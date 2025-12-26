import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function UICard({ children, className, onClick }: CardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl p-6 border border-border/50 shadow-sm transition-all duration-300",
        "hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5",
        "dark:bg-card dark:border-border",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="text-xl font-bold text-foreground font-display tracking-tight">{title}</h3>
        {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
