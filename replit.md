# PropMan - Property Management App

A full-stack, mobile-friendly web app for small landlords built with React, Node.js/Express, and PostgreSQL.

## Architecture

- **Frontend**: React + Vite, TanStack Query, Wouter routing, shadcn/ui, Tailwind CSS
- **Backend**: Express.js with Passport.js (local strategy) session-based auth
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: Email + password login with scrypt hashing (no Replit Auth)

## User Roles

### Landlord
- Dashboard with rent collection stats and pending maintenance overview
- Tenants page: view all tenants, toggle rent paid/unpaid status
- Maintenance page: view all requests, update status, assign contractors

### Tenant
- Dashboard with rent card (pay/unpaid button) and their own maintenance requests
- Maintenance page: submit new requests, track status of existing ones

## Key Files

| File | Purpose |
|------|---------|
| `shared/schema.ts` | Drizzle schema + Zod types for all tables |
| `shared/routes.ts` | Shared API contract (paths, schemas, types) |
| `server/routes.ts` | Express route handlers + seed data + auth setup |
| `server/storage.ts` | DatabaseStorage class implementing IStorage interface |
| `server/auth.ts` | Password hashing utilities (scrypt) |
| `client/src/App.tsx` | Router with private route guard |
| `client/src/hooks/use-auth.ts` | Auth state, login, register, logout |
| `client/src/hooks/use-tenants.ts` | Tenant list and payment mutation |
| `client/src/hooks/use-maintenance.ts` | Maintenance requests CRUD |
| `client/src/pages/` | Dashboard, Tenants, Maintenance, Auth pages |
| `client/src/components/navigation.tsx` | Sidebar (desktop) + bottom nav (mobile) |

## Database Tables

- `users` — id, username (email), password, role (landlord|tenant), name
- `tenants` — id, userId, unitNumber, rentAmount, isPaid
- `contractors` — id, name, type, contactInfo
- `maintenance_requests` — id, tenantId, title, description, urgency, status, contractorId, createdAt

## Demo Accounts

| Role | Email | Password |
|------|-------|---------|
| Landlord | landlord@example.com | landlord123 |
| Tenant | tenant@example.com | tenant123 |

## Demo Data

- 3 contractors seeded: Bob the Builder (General), Mario Plumbing (Plumber), Luigi Electric (Electrician)
- Demo tenant (Tenant Tim) is in Unit 101 with $1,500/mo rent

## Running

The `Start application` workflow runs `npm run dev` which starts both the Express backend and Vite dev server on port 5000.

## Environment Variables

- `DATABASE_URL` — auto-provisioned by Replit PostgreSQL
- `SESSION_SECRET` — used for session signing (set in Replit secrets)
