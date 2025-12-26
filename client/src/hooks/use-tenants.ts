import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useTenants() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tenantsQuery = useQuery({
    queryKey: [api.tenants.list.path],
    queryFn: async () => {
      const res = await fetch(api.tenants.list.path);
      if (!res.ok) throw new Error("Failed to fetch tenants");
      return api.tenants.list.responses[200].parse(await res.json());
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, isPaid }: { id: number; isPaid: boolean }) => {
      const url = buildUrl(api.tenants.updatePayment.path, { id });
      const res = await fetch(url, {
        method: api.tenants.updatePayment.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid }),
      });

      if (!res.ok) throw new Error("Failed to update payment status");
      return api.tenants.updatePayment.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tenants.list.path] });
      toast({ title: "Payment status updated" });
    },
    onError: () => {
      toast({ title: "Update failed", variant: "destructive" });
    },
  });

  return {
    tenants: tenantsQuery.data,
    isLoading: tenantsQuery.isLoading,
    updatePayment: updatePaymentMutation.mutate,
    isUpdating: updatePaymentMutation.isPending,
  };
}
