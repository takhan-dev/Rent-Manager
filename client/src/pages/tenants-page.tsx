import { useTenants } from "@/hooks/use-tenants";
import { UICard, CardHeader } from "@/components/ui-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TenantsPage() {
  const { tenants, updatePayment } = useTenants();
  const [search, setSearch] = useState("");

  const filteredTenants = tenants?.filter(t => 
    t.user.name.toLowerCase().includes(search.toLowerCase()) ||
    t.unitNumber.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Tenants</h1>
          <p className="text-muted-foreground">Manage your properties and rent collection</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search name or unit..." 
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTenants?.map((tenant) => (
          <UICard key={tenant.id} className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {tenant.user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{tenant.user.name}</h3>
                  <p className="text-sm text-muted-foreground">Unit {tenant.unitNumber}</p>
                </div>
              </div>
              <StatusBadge status={tenant.isPaid ? 'paid' : 'unpaid'} />
            </div>

            <div className="pt-4 border-t border-border flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Rent</span>
                <span className="font-bold">${tenant.rentAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="truncate max-w-[150px]">{tenant.user.username}</span>
              </div>
            </div>

            <Button 
              variant={tenant.isPaid ? "outline" : "default"}
              className={`w-full mt-2 ${tenant.isPaid ? "" : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"}`}
              onClick={() => updatePayment({ id: tenant.id, isPaid: !tenant.isPaid })}
            >
              {tenant.isPaid ? "Mark as Unpaid" : "Mark as Paid"}
            </Button>
          </UICard>
        ))}

        {!filteredTenants?.length && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No tenants found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
