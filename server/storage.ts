import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users, tenants, maintenanceRequests, contractors,
  type User, type InsertUser,
  type Tenant, type InsertTenant,
  type MaintenanceRequest, type InsertMaintenanceRequest,
  type Contractor, type InsertContractor
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Tenants
  getTenants(): Promise<(Tenant & { user: User })[]>;
  getTenantByUserId(userId: number): Promise<Tenant | undefined>;
  getTenant(id: number): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenantPaymentStatus(id: number, isPaid: boolean): Promise<Tenant>;

  // Maintenance
  getMaintenanceRequests(): Promise<(MaintenanceRequest & { tenant: Tenant & { user: User }, contractor: Contractor | null })[]>;
  getMaintenanceRequestsByTenant(tenantId: number): Promise<(MaintenanceRequest & { tenant: Tenant & { user: User }, contractor: Contractor | null })[]>;
  createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(id: number, updates: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest>;

  // Contractors
  getContractors(): Promise<Contractor[]>;
  createContractor(contractor: InsertContractor): Promise<Contractor>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getTenants(): Promise<(Tenant & { user: User })[]> {
    const rows = await db.select().from(tenants).innerJoin(users, eq(tenants.userId, users.id));
    return rows.map(row => ({ ...row.tenants, user: row.users }));
  }

  async getTenantByUserId(userId: number): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.userId, userId));
    return tenant;
  }

  async getTenant(id: number): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const [tenant] = await db.insert(tenants).values(insertTenant).returning();
    return tenant;
  }

  async updateTenantPaymentStatus(id: number, isPaid: boolean): Promise<Tenant> {
    const [tenant] = await db.update(tenants)
      .set({ isPaid })
      .where(eq(tenants.id, id))
      .returning();
    return tenant;
  }

  async getMaintenanceRequests(): Promise<(MaintenanceRequest & { tenant: Tenant & { user: User }, contractor: Contractor | null })[]> {
    const rows = await db.select()
      .from(maintenanceRequests)
      .innerJoin(tenants, eq(maintenanceRequests.tenantId, tenants.id))
      .innerJoin(users, eq(tenants.userId, users.id))
      .leftJoin(contractors, eq(maintenanceRequests.contractorId, contractors.id));

    return rows.map(row => ({
      ...row.maintenance_requests,
      tenant: { ...row.tenants, user: row.users },
      contractor: row.contractors
    }));
  }

  async getMaintenanceRequestsByTenant(tenantId: number): Promise<(MaintenanceRequest & { tenant: Tenant & { user: User }, contractor: Contractor | null })[]> {
    const rows = await db.select()
      .from(maintenanceRequests)
      .innerJoin(tenants, eq(maintenanceRequests.tenantId, tenants.id))
      .innerJoin(users, eq(tenants.userId, users.id))
      .leftJoin(contractors, eq(maintenanceRequests.contractorId, contractors.id))
      .where(eq(maintenanceRequests.tenantId, tenantId));

    return rows.map(row => ({
      ...row.maintenance_requests,
      tenant: { ...row.tenants, user: row.users },
      contractor: row.contractors
    }));
  }

  async createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest> {
    const [req] = await db.insert(maintenanceRequests).values(request).returning();
    return req;
  }

  async updateMaintenanceRequest(id: number, updates: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest> {
    const [req] = await db.update(maintenanceRequests)
      .set(updates)
      .where(eq(maintenanceRequests.id, id))
      .returning();
    return req;
  }

  async getContractors(): Promise<Contractor[]> {
    return await db.select().from(contractors);
  }

  async createContractor(contractor: InsertContractor): Promise<Contractor> {
    const [c] = await db.insert(contractors).values(contractor).returning();
    return c;
  }
}

export const storage = new DatabaseStorage();
