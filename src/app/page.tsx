"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, cn } from "@/lib/utils";
import BottomNav from "@/components/nav";
import { TransactionItem } from "@/components/transaction-item";
import { ForecastChart } from "@/components/forecast-chart";
import { StatCard } from "@/components/stat-card";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Wallet,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Briefcase,
  Info,
  AlertTriangle,
} from "lucide-react";

interface DashboardData {
  user: { id: string; name: string; email: string; currency: string };
  safeToSpend: number;
  income30: number;
  expenses30: number;
  avgMonthlyIncome: number;
  totalBucketBalances: number;
  pipelineTotal: number;
  quarterlyTaxEstimate: number;
  monthlyIncome: { month: string; amount: number }[];
  monthlyExpenses: { month: string; amount: number }[];
  recentTransactions: any[];
  buckets: any[];
  gigs: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [txnType, setTxnType] = useState<"income" | "expense">("income");
  const [txnAmount, setTxnAmount] = useState("");
  const [txnDesc, setTxnDesc] = useState("");
  const [txnSource, setTxnSource] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    fetch("/api/user-data")
      .then((r) => {
        if (!r.ok) throw new Error(`Server error: ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (d?.error) { setError(String(d.error)); setLoading(false); return; }
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Failed to load data");
        setLoading(false);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const handleQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnAmount || !txnDesc) return;
    setSaving(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: txnType, amount: Number(txnAmount), description: txnDesc,
          source: txnSource || undefined, date: new Date().toISOString(),
        }),
      });
      if (res.ok) { setTxnAmount(""); setTxnDesc(""); setTxnSource(""); setShowQuickLog(false); fetchData(); }
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <RefreshCw size={32} className="text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading GigFlow...</p>
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

  if (!data) return null;

  const chartData = (data.monthlyIncome || []).map((m: any, i: number) => ({
    month: m?.month || "?",
    income: m?.amount || 0,
    expenses: (data.monthlyExpenses || [])[i]?.amount || 0,
  })).slice(-6);

  const recentTxns = (data.recentTransactions || []).slice(0, 8);
  const userName = (data.user?.name || "there").split(" ")[0];
  const currency = data.user?.currency || "GBP";

  const getTimeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6 md:pt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Good {getTimeOfDay()}, {userName}</p>
          </div>
          <button onClick={() => setShowQuickLog(!showQuickLog)} className="md:hidden w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
            <Plus size={20} />
          </button>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-5 md:p-6 text-white shadow-xl shadow-emerald-500/20 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} />
            <span className="text-sm font-medium text-white/80">Safe to Spend</span>
          </div>
          <p className="text-3xl md:text-4xl font-bold">{formatCurrency(data.safeToSpend || 0, currency)}</p>
          <p className="text-xs text-white/60 mt-1">Last 30 days: {formatCurrency(data.income30 || 0, currency)} in, {formatCurrency(data.expenses30 || 0, currency)} out</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard icon={<TrendingUp size={18} />} label="Avg. Monthly Income" value={formatCurrency(data.avgMonthlyIncome || 0, currency)} color="emerald" delay={100} />
          <StatCard icon={<Briefcase size={18} />} label="Pipeline Total" value={formatCurrency(data.pipelineTotal || 0, currency)} color="blue" delay={200} />
          <StatCard icon={<PiggyBank size={18} />} label="Bucket Balances" value={formatCurrency(data.totalBucketBalances || 0, currency)} color="purple" delay={300} />
          <StatCard icon={<Info size={18} />} label="Est. Quarterly Tax" value={formatCurrency(data.quarterlyTaxEstimate || 0, currency)} color="amber" delay={400} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 md:p-5 mb-6">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-3">Income vs Expenses</h2>
          <ForecastChart data={chartData} type="bar" />
        </div>

        {showQuickLog && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 md:p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-800 dark:text-white">Quick Log</h2>
              <button onClick={() => setShowQuickLog(false)} className="text-slate-400 text-sm">Cancel</button>
            </div>
            <form onSubmit={handleQuickLog} className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                <button type="button" onClick={() => setTxnType("income")} className={cn("px-3 py-1.5 text-xs font-medium rounded-lg transition-all", txnType === "income" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500")}>Income</button>
                <button type="button" onClick={() => setTxnType("expense")} className={cn("px-3 py-1.5 text-xs font-medium rounded-lg transition-all", txnType === "expense" ? "bg-white dark:bg-slate-700 text-red-500 shadow-sm" : "text-slate-500")}>Expense</button>
              </div>
              <input type="number" value={txnAmount} onChange={(e) => setTxnAmount(e.target.value)} placeholder="Amount" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" required />
              <input type="text" value={txnDesc} onChange={(e) => setTxnDesc(e.target.value)} placeholder="Description" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" required />
              <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">{saving ? "..." : "Add"}</button>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800 dark:text-white">Recent Transactions</h2>
            <button onClick={() => router.push("/transactions")} className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">View all</button>
          </div>
          {recentTxns.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No transactions yet. Start by logging your first income or expense!</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTxns.map((txn: any) => (
                <TransactionItem key={txn.id} type={txn.type} amount={txn.amount} description={txn.description} category={txn.category} source={txn.source} date={txn.date} deductible={txn.deductible} currency={currency} />
              ))}
            </div>
          )}
        </div>
      </div>

      <button onClick={() => setShowQuickLog(!showQuickLog)} className="hidden md:flex fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl items-center justify-center hover:scale-105 transition-all z-30"><Plus size={24} /></button>
      <BottomNav />
    </div>
  );
}
