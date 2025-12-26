import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertMaintenanceRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useMaintenance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: [api.maintenance.list.path],
    queryFn: async () => {
      const res = await fetch(api.maintenance.list.path);
      if (!res.ok) throw new Error("Failed to fetch requests");
      return api.maintenance.list.responses[200].parse(await res.json());
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertMaintenanceRequest) => {
      const res = await fetch(api.maintenance.create.path, {
        method: api.maintenance.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to submit request");
      return api.maintenance.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.maintenance.list.path] });
      toast({ title: "Request submitted successfully" });
    },
    onError: (error) => {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertMaintenanceRequest>) => {
      const url = buildUrl(api.maintenance.update.path, { id });
      const res = await fetch(url, {
        method: api.maintenance.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update request");
      return api.maintenance.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.maintenance.list.path] });
      toast({ title: "Request updated" });
    },
    onError: (error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  return {
    requests: requestsQuery.data,
    isLoading: requestsQuery.isLoading,
    createRequest: createMutation.mutate,
    updateRequest: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

export function useContractors() {
  return useQuery({
    queryKey: [api.contractors.list.path],
    queryFn: async () => {
      const res = await fetch(api.contractors.list.path);
      if (!res.ok) throw new Error("Failed to fetch contractors");
      return api.contractors.list.responses[200].parse(await res.json());
    },
  });
}
