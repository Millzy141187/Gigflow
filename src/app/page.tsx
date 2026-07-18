"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, cn } from "@/lib/utils";
import BottomNav from "@/components/nav";
import { TransactionItem } from "@/components/transaction-item";
import { ForecastChart } from "@/components/forecast-chart";
import { StatCard } from "@/components/stat-card";
import { TrendingUp, TrendingDown, Plus, Wallet, RefreshCw, ArrowUpRight, ArrowDownLeft, PiggyBank, Briefcase, Info } from "lucide-react";

interface DashboardData {
  user: { id: string; name: string; email: string; currency: string };
  safeToSpend: number; income30: number; expenses30: number;
  avgMonthlyIncome: number; totalBucketBalances: number;
  pipelineTotal: number; quarterlyTaxEstimate: number;
  monthlyIncome: { month: string; amount: number }[];
  monthlyExpenses: { month: string; amount: number }[];
  transactions: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [txnType, setTxnType] = useState<"income" | "expense">("income");
  const [txnAmount, setTxnAmount] = useState("");
  const [txnDesc, setTxnDesc] = useState("");
  const [txnSource, setTxnSource] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user-data")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.error) { router.push("/login"); return; }
        setData(d); setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [router]);

  const handleQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnAmount || !txnDesc) return;
    setSaving(true);
    await fetch("/api/transactions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: txnType, amount: Number(txnAmount), description: txnDesc, source: txnSource || undefined, date: new Date().toISOString() }),
    });
    setTxnAmount(""); setTxnDesc(""); setTxnSource(""); setSaving(false); setShowQuickLog(false);
    const r = await fetch("/api/user-data");
    if (r.ok) setData(await r.json());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafb] dark:bg-[#0a0f1a]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-emerald-500" />
          <p className="text-slate-400 text-sm">Loading GigFlow...</p>
        </div>
      </div>
    );
  }

  if (!data) { router.push("/login"); return null; }

  const chartData = data.monthlyIncome.map((m) => {
    const exp = data.monthlyExpenses.find((e) => e.month === m.month);
    return { month: m.month.substring(5), income: m.amount, expenses: exp?.amount || 0 };
  }).slice(-6);
  const recentTxns = data.transactions.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#f8fafb] dark:bg-[#0a0f1a] md:pl-64 pb-20 md:pb-0">
      <BottomNav />
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 animate-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Good {getTimeOfDay()}, {data.user.name.split(" ")[0]}</p>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">Dashboard</h1>
            </div>
            <button onClick={() => setShowQuickLog(!showQuickLog)} className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 transition-all active:scale-95"><Plus size={18} />Log</button>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 md:p-6 text-white shadow-xl shadow-emerald-200/50 dark:shadow-emerald-900/30 mb-6">
          <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Wallet size={20} className="opacity-80" /><span className="text-sm font-medium opacity-90">Safe to Spend</span><span className="tooltip-trigger text-white/60 text-xs" title="Your income minus expenses over the last 30 days."><Info size={12} /></span></div><span className="text-xs bg-white/20 px-2 py-1 rounded-full">Last 30 days</span></div>
          <p className="text-3xl md:text-4xl font-bold tracking-tight">{formatCurrency(data.safeToSpend, data.user.currency)}</p>
          <div className="flex gap-4 mt-3 text-sm opacity-80"><div className="flex items-center gap-1"><ArrowDownLeft size={14} /><span>+{formatCurrency(data.income30, data.user.currency)} earned</span></div><div className="flex items-center gap-1"><ArrowUpRight size={14} /><span>-{formatCurrency(data.expenses30, data.user.currency)} spent</span></div></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<TrendingUp size={18} />} label="Avg Monthly Income" value={formatCurrency(data.avgMonthlyIncome, data.user.currency)} color="emerald" />
          <StatCard icon={<Briefcase size={18} />} label="Pipeline" value={formatCurrency(data.pipelineTotal, data.user.currency)} color="blue" delay={100} />
          <StatCard icon={<PiggyBank size={18} />} label="Buckets" value={formatCurrency(data.totalBucketBalances, data.user.currency)} color="purple" delay={200} />
          <StatCard icon={<TrendingDown size={18} />} label="Est. Quarterly Tax" value={formatCurrency(data.quarterlyTaxEstimate, data.user.currency)} color="amber" delay={300} />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4"><h2 className="font-semibold text-slate-800 dark:text-white">Income vs Expenses</h2><span className="text-xs text-slate-400 dark:text-slate-500">Last 6 months</span></div>
          <ForecastChart data={chartData} type="bar" />
        </div>
        <div className={cn("bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-6 transition-all duration-300 overflow-hidden", showQuickLog ? "p-4 md:p-5" : "hidden md:block md:p-5")}>
          <div className="flex items-center justify-between mb-3"><h2 className="font-semibold text-slate-800 dark:text-white">Quick Log</h2><button onClick={() => setShowQuickLog(false)} className="md:hidden text-slate-400">X</button></div>
          <form onSubmit={handleQuickLog} className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button type="button" onClick={() => setTxnType("income")} className={cn("px-3 py-1.5 text-xs font-medium rounded-lg transition-all", txnType === "income" ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500")}>+ Income</button>
              <button type="button" onClick={() => setTxnType("expense")} className={cn("px-3 py-1.5 text-xs font-medium rounded-lg transition-all", txnType === "expense" ? "bg-white dark:bg-slate-700 text-red-500 shadow-sm" : "text-slate-500")}>- Expense</button>
            </div>
            <input type="number" placeholder="Amount" value={txnAmount} onChange={(e) => setTxnAmount(e.target.value)} required className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            <input type="text" placeholder={txnType === "income" ? "Gig description..." : "Expense description..."} value={txnDesc} onChange={(e) => setTxnDesc(e.target.value)} required className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            {txnType === "income" && <input type="text" placeholder="Client name" value={txnSource} onChange={(e) => setTxnSource(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />}
            <button type="submit" disabled={saving} className="px-4 py-2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-100 transition-all disabled:opacity-50 shrink-0">{saving ? "..." : "Add"}</button>
          </form>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 md:p-5">
          <div className="flex items-center justify-between mb-3"><h2 className="font-semibold text-slate-800 dark:text-white">Recent Transactions</h2><button onClick={() => router.push("/transactions")} className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline">View all</button></div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {recentTxns.length === 0 ? <p className="text-sm text-slate-400 py-6 text-center">No transactions yet. Log your first income or expense!</p> : recentTxns.map((t) => <TransactionItem key={t.id} type={t.type} amount={t.amount} description={t.description} category={t.category} source={t.source} date={t.date} deductible={t.deductible} currency={data.user.currency} />)}
          </div>
        </div>
        <button onClick={() => setShowQuickLog(!showQuickLog)} className="hidden md:flex fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-200/50 dark:shadow-emerald-900/30 items-center justify-center hover:scale-105 transition-all z-30"><Plus size={24} /></button>
      </main>
    </div>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
