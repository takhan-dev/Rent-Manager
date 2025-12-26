import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Acts as email
  password: text("password").notNull(),
  role: text("role", { enum: ["landlord", "tenant"] }).notNull().default("tenant"),
  name: text("name").notNull(),
});

export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  unitNumber: text("unit_number").notNull(),
  rentAmount: integer("rent_amount").notNull(),
  isPaid: boolean("is_paid").default(false),
});

export const contractors = pgTable("contractors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // e.g., Plumber, Electrician
  contactInfo: text("contact_info").notNull(),
});

export const maintenanceRequests = pgTable("maintenance_requests", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  urgency: text("urgency", { enum: ["low", "medium", "high"] }).notNull(),
  status: text("status", { enum: ["pending", "in_progress", "completed"] }).default("pending").notNull(),
  contractorId: integer("contractor_id").references(() => contractors.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  tenantInfo: one(tenants, {
    fields: [users.id],
    references: [tenants.userId],
  }),
}));

export const tenantsRelations = relations(tenants, ({ one, many }) => ({
  user: one(users, {
    fields: [tenants.userId],
    references: [users.id],
  }),
  requests: many(maintenanceRequests),
}));

export const maintenanceRequestsRelations = relations(maintenanceRequests, ({ one }) => ({
  tenant: one(tenants, {
    fields: [maintenanceRequests.tenantId],
    references: [tenants.id],
  }),
  contractor: one(contractors, {
    fields: [maintenanceRequests.contractorId],
    references: [contractors.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true });
export const insertContractorSchema = createInsertSchema(contractors).omit({ id: true });
export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Contractor = typeof contractors.$inferSelect;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;
