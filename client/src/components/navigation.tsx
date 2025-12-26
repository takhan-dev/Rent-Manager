import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Hammer, Users, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...(user.role === "landlord" 
      ? [{ href: "/tenants", label: "Tenants", icon: Users }] 
      : []),
    { href: "/maintenance", label: "Maintenance", icon: Hammer },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed h-screen bg-background border-r border-border p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl leading-none">PropMan</h1>
            <p className="text-xs text-muted-foreground mt-1">Property Manager</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-foreground")} />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-border">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
              {user.name[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 z-50 pb-safe">
        <div className="flex justify-around items-center">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href} className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                <Icon className={cn("w-6 h-6", isActive && "fill-current/20")} />
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            );
          })}
          <button 
            onClick={() => logout()}
            className="flex flex-col items-center gap-1 p-2 rounded-lg text-muted-foreground"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}
