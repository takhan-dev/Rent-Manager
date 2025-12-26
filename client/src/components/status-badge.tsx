import { cn } from "@/lib/utils";

type StatusType = "pending" | "in_progress" | "completed" | "paid" | "unpaid" | "low" | "medium" | "high";

export function StatusBadge({ status, className }: { status: StatusType | string, className?: string }) {
  const getStyles = (s: string) => {
    switch (s) {
      case "completed":
      case "paid":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      case "pending":
      case "medium":
      case "unpaid":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
      case "high":
        return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
      case "low":
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getLabel = (s: string) => {
    return s.replace("_", " ").toUpperCase();
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
      getStyles(status),
      className
    )}>
      {getLabel(status)}
    </span>
  );
}
