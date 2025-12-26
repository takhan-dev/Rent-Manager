import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { hashPassword, comparePasswords } from "./auth";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Auth Setup
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new SessionStore({
        checkPeriod: 86400000,
      }),
      resave: false,
      saveUninitialized: false,
      secret: "keyboard cat",
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (!(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth Routes
  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      // Auto-create tenant profile if role is tenant
      if (user.role === 'tenant') {
        await storage.createTenant({
          userId: user.id,
          unitNumber: "Pending", // Default, landlord can update
          rentAmount: 0,
          isPaid: false
        });
      }

      req.login(user, (err) => {
        if (err) throw err;
        res.status(201).json(user);
      });
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.auth.user.path, (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });


  // API Routes

  // Tenants
  app.get(api.tenants.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // In a real app, check if user is landlord
    const tenants = await storage.getTenants();
    res.json(tenants);
  });

  app.patch(api.tenants.updatePayment.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tenant = await storage.updateTenantPaymentStatus(Number(req.params.id), req.body.isPaid);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    res.json(tenant);
  });

  // Maintenance
  app.get(api.maintenance.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    
    if (user.role === 'tenant') {
      const tenant = await storage.getTenantByUserId(user.id);
      if (!tenant) return res.json([]);
      const requests = await storage.getMaintenanceRequestsByTenant(tenant.id);
      res.json(requests);
    } else {
      const requests = await storage.getMaintenanceRequests();
      res.json(requests);
    }
  });

  app.post(api.maintenance.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const tenant = await storage.getTenantByUserId(user.id);
    
    if (!tenant) return res.status(400).json({ message: "Tenant profile not found" });

    try {
      const input = api.maintenance.create.input.parse({ ...req.body, tenantId: tenant.id });
      const request = await storage.createMaintenanceRequest(input);
      res.status(201).json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.maintenance.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const request = await storage.updateMaintenanceRequest(Number(req.params.id), req.body);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  });

  // Contractors
  app.get(api.contractors.list.path, async (req, res) => {
    const contractors = await storage.getContractors();
    res.json(contractors);
  });

  // Seed Data
  if ((await storage.getContractors()).length === 0) {
    await storage.createContractor({ name: "Bob the Builder", type: "General", contactInfo: "555-0101" });
    await storage.createContractor({ name: "Mario Plumbing", type: "Plumber", contactInfo: "555-0102" });
    await storage.createContractor({ name: "Luigi Electric", type: "Electrician", contactInfo: "555-0103" });
  }

  // Seed Users if empty
  if (!(await storage.getUserByUsername("landlord@example.com"))) {
    const hashed = await hashPassword("landlord123");
    await storage.createUser({
      username: "landlord@example.com",
      password: hashed,
      role: "landlord",
      name: "Landlord Larry"
    });
  }

  if (!(await storage.getUserByUsername("tenant@example.com"))) {
    const hashed = await hashPassword("tenant123");
    const user = await storage.createUser({
      username: "tenant@example.com",
      password: hashed,
      role: "tenant",
      name: "Tenant Tim"
    });
    // Update the auto-created tenant profile
    const tenant = await storage.getTenantByUserId(user.id);
    if (tenant) {
      // Direct DB update for seed data would be better but we don't have updateTenant method exposed fully
      // But we can use direct db call here or add method. 
      // Actually storage.createTenant was called in register, but here we manually created user.
      // So we must manually create tenant profile.
      await storage.createTenant({
        userId: user.id,
        unitNumber: "101",
        rentAmount: 1500,
        isPaid: false
      });
    }
  }

  return httpServer;
}
