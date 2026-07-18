import { cn, formatCurrency } from "@/lib/utils";
import { Receipt, Shield, TrendingUp, Home, Sparkles, Folder } from "lucide-react";

const iconMap: Record<string, React.ComponentType<any>> = {
  receipt: Receipt, shield: Shield, "trending-up": TrendingUp, home: Home, sparkles: Sparkles, folder: Folder,
};

interface BucketCardProps {
  name: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  allocationPercent: number;
  color: string;
  icon: string;
  currency?: string;
  onClick?: () => void;
}

export function BucketCard({ name, targetAmount, currentAmount, allocationPercent, color, icon, currency = "USD", onClick }: BucketCardProps) {
  const percent = targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 0;
  const Icon = iconMap[icon] || Folder;
  return (
    <button onClick={onClick} className="w-full text-left bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Icon size={20} color={color} />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{name}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{allocationPercent}% allocation</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(currentAmount, currency)}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">of {formatCurrency(targetAmount, currency)}</p>
        </div>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700 ease-out", percent >= 100 && "animate-pulse")} style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-slate-400 dark:text-slate-500">{Math.round(percent)}% filled</span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{formatCurrency(targetAmount - currentAmount, currency)} to go</span>
      </div>
    </button>
  );
}
