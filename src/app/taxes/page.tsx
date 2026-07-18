"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import BottomNav from "@/components/nav";
import { ArrowLeft, Receipt, TrendingUp, TrendingDown, Download, Info, Calendar, Percent, Building2 } from "lucide-react";

interface Transaction { type: "income" | "expense"; amount: number; description: string; category: string; deductible: boolean; date: string; }

export default function TaxesPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState(30);

  useEffect(() => {
    fetch("/api/user-data").then((r) => r.ok ? r.json() : null).then((d) => {
      if (d?.error) { router.push("/login"); return; }
      setTransactions(d.transactions); setCurrency(d.user.currency); setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  const now = new Date();
  const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const quarterlyTxns = useMemo(() => transactions.filter((t) => new Date(t.date) >= quarterStart), [transactions]);
  const totalIncome = quarterlyTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const deductibleExpenses = quarterlyTxns.filter((t) => t.type === "expense" && t.deductible).reduce((s, t) => s + t.amount, 0);
  const allDeductible = transactions.filter((t) => t.type === "expense" && t.deductible).reduce((s, t) => s + t.amount, 0);
  const taxableIncome = Math.max(0, totalIncome - deductibleExpenses);
  const estimatedTax = taxableIncome * (taxRate / 100);
  const quarterlyLabel = `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;

  const handleExport = () => {
    const csvContent = ["Date,Type,Description,Category,Amount,Deductible", ...transactions.filter((t) => t.deductible).map((t) => `${t.date},${t.type},${t.description},${t.category},${t.amount},yes`)].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `gigflow-deductible-expenses-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafb] dark:bg-[#0a0f1a]"><div className="shimmer w-48 h-4" /></div>;

  return (
    <div className="min-h-screen bg-[#f8fafb] dark:bg-[#0a0f1a] md:pl-64 pb-20 md:pb-0">
      <BottomNav />
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 animate-in">
          <button onClick={() => router.push("/")} className="md:hidden flex items-center gap-1 text-sm text-slate-400 mb-2"><ArrowLeft size={14} /> Dashboard</button>
          <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-800 dark:text-white">Taxes</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{quarterlyLabel} Estimate</p></div><button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-sm"><Download size={14} /> Export</button></div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 md:p-6 text-white shadow-xl shadow-amber-200/50 dark:shadow-amber-900/30 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Building2 size={20} className="opacity-80" /><span className="text-sm font-medium opacity-90">Est. Quarterly Tax ({quarterlyLabel})</span></div><span className="text-xs bg-white/20 px-2 py-1 rounded-full">{taxRate}% rate</span></div>
          <p className="text-3xl md:text-4xl font-bold tracking-tight">{formatCurrency(estimatedTax, currency)}</p>
          <div className="flex gap-4 mt-3 text-sm opacity-80"><div className="flex items-center gap-1"><TrendingUp size={14} /><span>{formatCurrency(totalIncome, currency)} income</span></div><div className="flex items-center gap-1"><TrendingDown size={14} /><span>-{formatCurrency(deductibleExpenses, currency)} deductions</span></div></div>
          <div className="mt-4 pt-3 border-t border-white/20"><label className="flex items-center justify-between text-xs opacity-80 mb-1"><span>Adjust tax rate</span><span>{taxRate}%</span></label><input type="range" min="15" max="45" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-full accent-white" /></div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm animate-in"><div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center mb-2"><Receipt size={16} className="text-green-600 dark:text-green-400" /></div><p className="text-sm font-semibold text-slate-800 dark:text-white">{formatCurrency(deductibleExpenses, currency)}</p><p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">This quarter deductions</p></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm animate-in animation-delay-100"><div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-2"><Calendar size={16} className="text-blue-600 dark:text-blue-400" /></div><p className="text-sm font-semibold text-slate-800 dark:text-white">{formatCurrency(allDeductible, currency)}</p><p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">All-time deductions</p></div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 md:p-5 mb-6 animate-slide-up"><h2 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><Receipt size={18} className="text-amber-500" /> Deductible Expenses This Quarter</h2>{quarterlyTxns.filter((t) => t.deductible).length === 0 ? <p className="text-sm text-slate-400 py-4 text-center">No deductible expenses tracked this quarter.</p> : <div className="divide-y divide-slate-50 dark:divide-slate-800">{quarterlyTxns.filter((t) => t.deductible).map((t, i) => <div key={i} className="flex items-center justify-between py-2.5"><div><p className="text-sm font-medium text-slate-800 dark:text-white">{t.description}</p><p className="text-xs text-slate-400 dark:text-slate-500">{t.category} · {t.date}</p></div><span className="text-sm font-semibold text-red-500 dark:text-red-400">-{formatCurrency(t.amount, currency)}</span></div>)}</div>}</div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 animate-slide-up"><div className="flex items-start gap-3"><Info size={20} className="text-slate-400 shrink-0 mt-0.5" /><p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Disclaimer: This is a simplified US-focused estimator for informational purposes only. Your actual tax liability depends on many factors including filing status, state taxes, self-employment tax (15.3%), and more. Always consult a qualified tax professional.</p></div></div>
      </main>
    </div>
  );
}
