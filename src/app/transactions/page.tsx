"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import BottomNav from "@/components/nav";
import { TransactionItem } from "@/components/transaction-item";
import { Search, X, ArrowLeft, ArrowDownLeft, ArrowUpRight, Filter, RefreshCw, AlertTriangle } from "lucide-react";

interface Transaction { id: string; type: "income" | "expense"; amount: number; category: string; description: string; source?: string; date: string; deductible: boolean; }

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  const fetchData = () => {
    fetch("/api/user-data")
      .then((r) => { if (!r.ok) throw new Error(`Server error: ${r.status}`); return r.json(); })
      .then((d) => {
        if (d?.error) { setError(String(d.error)); setLoading(false); return; }
        setTransactions(d?.recentTransactions || d?.transactions || []);
        setCurrency(d?.user?.currency || "GBP");
        setLoading(false);
      })
      .catch((err) => { setError(err?.message || "Failed to load"); setLoading(false); });
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch { /* silent */ }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    let result = transactions;
    if (filterType !== "all") result = result.filter((t) => t.type === filterType);
    if (search) { const q = search.toLowerCase(); result = result.filter((t) => (t.description || "").toLowerCase().includes(q) || (t.source || "").toLowerCase().includes(q) || (t.category || "").toLowerCase().includes(q)); }
    return result;
  }, [transactions, filterType, search]);

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + (t.amount || 0), 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + (t.amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <RefreshCw size={32} className="text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <AlertTriangle size={40} className="text-amber-500 mb-4" />
        <p className="text-slate-700 dark:text-slate-300 text-sm mb-1">Something went wrong</p>
        <p className="text-slate-400 text-xs mb-4">{error}</p>
        <button onClick={fetchData} className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600">Retry</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6 md:pt-10">
        <div className="mb-6">
          <button onClick={() => router.push("/")} className="flex items-center gap-1 text-sm text-slate-400 mb-2"><ArrowLeft size={14} /> Dashboard</button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Transactions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track every pound in and out</p>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-1"><ArrowDownLeft size={14} className="text-emerald-500" /><span className="text-xs text-slate-400 font-medium">INCOME</span></div>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome, currency)}</p>
          </div>
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-1"><ArrowUpRight size={14} className="text-red-500" /><span className="text-xs text-slate-400 font-medium">EXPENSES</span></div>
            <p className="text-lg font-bold text-red-500 dark:text-red-400">{formatCurrency(totalExpense, currency)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-3 mb-4">
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />{search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>}</div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {(["all", "income", "expense"] as const).map((type) => <button key={type} onClick={() => setFilterType(type)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${filterType === type ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>{type}</button>)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 md:p-5">
          {filtered.length === 0 ? (
            <div className="text-center py-12"><Filter size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" /><p className="text-slate-400 font-medium">No transactions found</p></div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">{filtered.map((t) => <TransactionItem key={t.id} type={t.type} amount={t.amount} description={t.description} category={t.category} source={t.source} date={t.date} deductible={t.deductible} currency={currency} onDelete={handleDelete} id={t.id} />)}</div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
