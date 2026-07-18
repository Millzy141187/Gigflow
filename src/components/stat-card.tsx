import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "emerald" | "blue" | "purple" | "amber";
  delay?: number;
}

export function StatCard({ icon, label, value, color, delay = 0 }: StatCardProps) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
    amber: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 md:p-4 border border-slate-100 dark:border-slate-800 shadow-sm animate-in" style={{ animationDelay: `${delay}ms` }}>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", colors[color] || colors.emerald)}>
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-800 dark:text-white">{value}</p>
      <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
