import { formatCurrency, formatDateShort } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Tag, Trash2 } from "lucide-react";

interface TransactionItemProps {
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  source?: string;
  date: string;
  deductible?: boolean;
  currency?: string;
  onDelete?: (id: string) => void;
  id?: string;
}

export function TransactionItem({ type, amount, description, category, source, date, deductible, currency = "GBP", onDelete, id }: TransactionItemProps) {
  return (
    <div className="flex items-center gap-4 py-3 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        type === "income" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400"
      }`}>
        {type === "income" ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1"><Tag size={10} />{category}</span>
          {source && <span className="text-xs text-slate-400 dark:text-slate-500">· {source}</span>}
          {deductible && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-medium">deductible</span>}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-semibold ${type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
          {type === "income" ? "+" : "-"}{formatCurrency(amount, currency)}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{formatDateShort(date)}</p>
      </div>
      {onDelete && id && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(id); }}
          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-all shrink-0"
          title="Delete transaction"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
