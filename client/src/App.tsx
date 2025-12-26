import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import TenantsPage from "@/pages/tenants-page";
import MaintenancePage from "@/pages/maintenance-page";
import NotFound from "@/pages/not-found";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <Navigation />
      
      <main className="md:pl-64 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Switch>
            <Route path="/" component={AuthPage} />
            <Route path="/dashboard">
              <PrivateRoute component={DashboardPage} />
            </Route>
            <Route path="/tenants">
              <PrivateRoute component={TenantsPage} />
            </Route>
            <Route path="/maintenance">
              <PrivateRoute component={MaintenancePage} />
            </Route>
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
