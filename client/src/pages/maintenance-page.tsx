import { useState } from "react";
import { useMaintenance, useContractors } from "@/hooks/use-maintenance";
import { useAuth } from "@/hooks/use-auth";
import { UICard, CardHeader } from "@/components/ui-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Hammer, Wrench, AlertTriangle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { api, type InsertMaintenanceRequest } from "@shared/routes";
import { z } from "zod";

export default function MaintenancePage() {
  const { user } = useAuth();
  const { requests, updateRequest } = useMaintenance();
  const { data: contractors } = useContractors();
  const [filter, setFilter] = useState("all");

  const filteredRequests = requests?.filter(req => {
    if (user?.role === "tenant" && req.tenant.userId !== user.id) return false;
    if (filter === "all") return true;
    return req.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Maintenance</h1>
          <p className="text-muted-foreground">
            {user?.role === "landlord" 
              ? "Track and resolve tenant issues" 
              : "Submit and track your requests"}
          </p>
        </div>
        
        <div className="flex gap-2">
          {user?.role === "tenant" && <CreateRequestDialog tenantId={user.tenantInfo?.id || 0} />}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 pb-2 overflow-x-auto">
        {["all", "pending", "in_progress", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f 
                ? "bg-foreground text-background shadow-md" 
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {f.replace("_", " ").charAt(0).toUpperCase() + f.replace("_", " ").slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRequests?.map((req) => (
          <UICard key={req.id} className="group relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
              req.urgency === 'high' ? 'bg-rose-500' : 
              req.urgency === 'medium' ? 'bg-amber-500' : 'bg-slate-300'
            }`} />
            
            <div className="pl-4 flex flex-col md:flex-row gap-6 justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <StatusBadge status={req.status} />
                  <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                    req.urgency === 'high' ? 'text-rose-600' : 
                    req.urgency === 'medium' ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    {req.urgency === 'high' && <AlertTriangle className="w-3 h-3" />}
                    {req.urgency} Urgency
                  </span>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold">{req.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{req.description}</p>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    Unit {req.tenant.unitNumber}
                  </span>
                  <span>•</span>
                  <span>{new Date(req.createdAt || "").toLocaleDateString()}</span>
                  {req.contractor && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Hammer className="w-3 h-3" />
                        {req.contractor.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Landlord Actions */}
              {user?.role === "landlord" && (
                <div className="flex flex-col gap-2 min-w-[200px] border-l pl-6 border-border/50">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Actions</p>
                  
                  <Select 
                    value={req.status} 
                    onValueChange={(val) => updateRequest({ id: req.id, status: val as any })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={req.contractorId?.toString() || "none"} 
                    onValueChange={(val) => updateRequest({ id: req.id, contractorId: val === "none" ? null : Number(val) })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Assign Contractor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Contractor</SelectItem>
                      {contractors?.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name} ({c.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </UICard>
        ))}
        
        {!filteredRequests?.length && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-border">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Hammer className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg">No requests found</h3>
            <p className="text-muted-foreground">There are no maintenance requests matching your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateRequestDialog({ tenantId }: { tenantId: number }) {
  const [open, setOpen] = useState(false);
  const { createRequest, isCreating } = useMaintenance();
  
  const formSchema = api.maintenance.create.input;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { tenantId, urgency: "medium" }
  });

  const onSubmit = (data: any) => {
    createRequest({ ...data, tenantId }, {
      onSuccess: () => {
        setOpen(false);
        reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-full px-6">
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Maintenance Request</DialogTitle>
          <DialogDescription>
            Describe the issue in detail. Urgent issues should be reported by phone.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title</Label>
            <Input id="title" placeholder="e.g. Leaking faucet" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency Level</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("urgency")}
            >
              <option value="low">Low - Can wait a week</option>
              <option value="medium">Medium - Fix within 48h</option>
              <option value="high">High - Emergency/Hazard</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Please provide details about the problem..." 
              className="min-h-[100px]"
              {...register("description")} 
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
