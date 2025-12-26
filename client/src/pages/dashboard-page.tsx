import { useAuth } from "@/hooks/use-auth";
import { useMaintenance } from "@/hooks/use-maintenance";
import { useTenants } from "@/hooks/use-tenants";
import { UICard, CardHeader } from "@/components/ui-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { DollarSign, AlertCircle, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user.name}. Here's what's happening today.
        </p>
      </div>

      {user.role === "landlord" ? <LandlordDashboard /> : <TenantDashboard userId={user.id} />}
    </div>
  );
}

function LandlordDashboard() {
  const { tenants } = useTenants();
  const { requests } = useMaintenance();

  const totalTenants = tenants?.length || 0;
  const paidTenants = tenants?.filter(t => t.isPaid).length || 0;
  const pendingRequests = requests?.filter(r => r.status === "pending").length || 0;
  const totalRent = tenants?.reduce((sum, t) => sum + t.rentAmount, 0) || 0;
  const collectedRent = tenants?.reduce((sum, t) => t.isPaid ? sum + t.rentAmount : sum, 0) || 0;

  const stats = [
    { 
      label: "Rent Collected", 
      value: `$${collectedRent.toLocaleString()}`, 
      sub: `of $${totalRent.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-100" 
    },
    { 
      label: "Pending Requests", 
      value: pendingRequests, 
      sub: "Needs attention",
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-100" 
    },
    { 
      label: "Occupancy", 
      value: totalTenants, 
      sub: "Active tenants",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100" 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <UICard className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold font-display">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            </UICard>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UICard>
          <CardHeader title="Recent Maintenance" description="Latest requests from tenants" />
          <div className="space-y-4">
            {requests?.slice(0, 5).map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    req.urgency === 'high' ? 'bg-rose-500' : 
                    req.urgency === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{req.title}</p>
                    <p className="text-xs text-muted-foreground">Unit {req.tenant.unitNumber}</p>
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
            {!requests?.length && <p className="text-sm text-muted-foreground text-center py-4">No requests found</p>}
          </div>
        </UICard>

        <UICard>
          <CardHeader title="Payment Status" description="Rent collection overview" />
          <div className="space-y-4">
            {tenants?.slice(0, 5).map(tenant => (
              <div key={tenant.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium text-sm">{tenant.user.name}</p>
                  <p className="text-xs text-muted-foreground">Unit {tenant.unitNumber} • ${tenant.rentAmount}</p>
                </div>
                <StatusBadge status={tenant.isPaid ? 'paid' : 'unpaid'} />
              </div>
            ))}
          </div>
        </UICard>
      </div>
    </div>
  );
}

function TenantDashboard({ userId }: { userId: number }) {
  // In a real app we'd filter on the backend or have a specific endpoint
  // For this demo, we'll fetch list and find the current user's tenant record
  const { tenants, updatePayment, isUpdating } = useTenants();
  const { requests } = useMaintenance();
  
  const myTenant = tenants?.find(t => t.userId === userId);
  const myRequests = requests?.filter(r => r.tenantId === myTenant?.id) || [];

  if (!tenants) return <div>Loading...</div>;
  if (!myTenant) return <div>Tenant record not found. Please contact your landlord.</div>;

  return (
    <div className="space-y-6">
      {/* Rent Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <UICard className="bg-gradient-to-br from-primary to-primary/80 text-white border-none shadow-xl shadow-primary/25">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary-foreground/80 font-medium mb-1">Current Rent Status</p>
              <h2 className="text-4xl font-display font-bold">${myTenant.rentAmount}</h2>
              <p className="text-primary-foreground/80 text-sm mt-1">Due by the 1st of the month</p>
            </div>
            <div className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-sm ${
              myTenant.isPaid ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-white'
            }`}>
              {myTenant.isPaid ? 'PAID' : 'UNPAID'}
            </div>
          </div>
          
          <div className="mt-8">
            {!myTenant.isPaid ? (
              <Button 
                onClick={() => updatePayment({ id: myTenant.id, isPaid: true })}
                disabled={isUpdating}
                className="w-full bg-white text-primary hover:bg-white/90 font-bold h-12 rounded-xl shadow-lg"
              >
                {isUpdating ? "Processing..." : "Pay Rent Now"}
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Rent paid for this month. Thank you!</span>
              </div>
            )}
          </div>
        </UICard>
      </motion.div>

      {/* Requests */}
      <UICard>
        <CardHeader title="My Maintenance Requests" description="Track status of your tickets" />
        <div className="space-y-3">
          {myRequests.map(req => (
            <div key={req.id} className="p-4 rounded-xl border border-border bg-secondary/20 flex justify-between items-center">
              <div>
                <p className="font-semibold">{req.title}</p>
                <p className="text-sm text-muted-foreground">{req.urgency} urgency</p>
              </div>
              <StatusBadge status={req.status} />
            </div>
          ))}
          {!myRequests.length && (
            <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
              <p>No maintenance requests submitted.</p>
            </div>
          )}
        </div>
      </UICard>
    </div>
  );
}
