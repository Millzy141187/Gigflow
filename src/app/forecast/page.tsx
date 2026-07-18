"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, cn } from "@/lib/utils";
import BottomNav from "@/components/nav";
import { ForecastChart } from "@/components/forecast-chart";
import { StatCard } from "@/components/stat-card";
import { ArrowLeft, TrendingUp, Calendar, DollarSign, AlertCircle, Briefcase, Sliders, Plus, Info } from "lucide-react";

interface Gig { id: string; title: string; client: string; expectedAmount: number; expectedDate: string; probability: "confirmed" | "likely" | "possible" | "speculative"; status: string; }

export default function ForecastPage() {
  const router = useRouter();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [avgMonthlyIncome, setAvgMonthly] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState<{ month: string; amount: number }[]>([]);
  const [simScenario, setSimScenario] = useState<"none" | "drop30" | "drop50" | "double">("none");
  const [showAddGig, setShowAddGig] = useState(false);
  const [newGig, setNewGig] = useState({ title: "", client: "", expectedAmount: "", expectedDate: "", probability: "likely" });

  useEffect(() => {
    fetch("/api/user-data").then((r) => r.ok ? r.json() : null).then((d) => {
      if (d?.error) { router.push("/login"); return; }
      setGigs(d.gigs); setCurrency(d.user.currency); setAvgMonthly(d.avgMonthlyIncome); setMonthlyIncome(d.monthlyIncome); setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  const handleAddGig = async () => {
    if (!newGig.title || !newGig.expectedAmount) return;
    const res = await fetch("/api/gigs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newGig.title, client: newGig.client || "Unknown", expectedAmount: Number(newGig.expectedAmount), expectedDate: newGig.expectedDate || new Date(Date.now() + 14 * 86400000).toISOString(), probability: newGig.probability, status: "upcoming" }) });
    if (res.ok) { const created = await res.json(); setGigs((prev) => [...prev, created]); setShowAddGig(false); setNewGig({ title: "", client: "", expectedAmount: "", expectedDate: "", probability: "likely" }); }
  };

  const probColors: Record<string, string> = { confirmed: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300", likely: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300", possible: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300", speculative: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" };
  const probWeights = { confirmed: 1, likely: 0.7, possible: 0.4, speculative: 0.15 };
  const pipelineTotal = gigs.reduce((s, g) => s + g.expectedAmount * (probWeights[g.probability] || 0), 0);
  const confirmedTotal = gigs.filter((g) => g.probability === "confirmed").reduce((s, g) => s + g.expectedAmount, 0);
  const scenarioMultiplier = simScenario === "drop30" ? 0.7 : simScenario === "drop50" ? 0.5 : simScenario === "double" ? 2 : 1;
  const simulatedIncome = avgMonthlyIncome * scenarioMultiplier;
  const chartData = monthlyIncome.concat([1,2,3].map((i) => { const d = new Date(); d.setMonth(d.getMonth() + i); return { month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, amount: simulatedIncome }; })).slice(-9);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafb] dark:bg-[#0a0f1a]"><div className="shimmer w-48 h-4" /></div>;

  return (
    <div className="min-h-screen bg-[#f8fafb] dark:bg-[#0a0f1a] md:pl-64 pb-20 md:pb-0">
      <BottomNav />
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-start justify-between mb-6 animate-in">
          <div><button onClick={() => router.push("/")} className="md:hidden flex items-center gap-1 text-sm text-slate-400 mb-2"><ArrowLeft size={14} /> Dashboard</button><h1 className="text-2xl font-bold text-slate-800 dark:text-white">Forecast & Planning</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Plan ahead with income projections and scenarios</p></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <StatCard icon={<Briefcase size={18} />} label="Active Gigs" value={String(gigs.length)} color="emerald" />
          <StatCard icon={<DollarSign size={18} />} label="Confirmed" value={formatCurrency(confirmedTotal, currency)} color="blue" delay={100} />
          <StatCard icon={<TrendingUp size={18} />} label="Pipeline (weighted)" value={formatCurrency(pipelineTotal, currency)} color="purple" delay={200} />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-6"><h2 className="font-semibold text-slate-800 dark:text-white mb-4">Income Forecast</h2><ForecastChart data={chartData} type="area" color="#10b981" dataKey="amount" /></div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4"><Sliders size={18} className="text-purple-500" /><h2 className="font-semibold text-slate-800 dark:text-white">Scenario Simulator</h2><span className="tooltip-trigger text-slate-400 text-xs"><Info size={12} /></span></div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">See how different income scenarios affect your projected monthly earnings of <strong>{formatCurrency(avgMonthlyIncome, currency)}</strong>.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {[{ key: "none" as const, label: "Normal" },{ key: "drop30" as const, label: "-30% Drop" },{ key: "drop50" as const, label: "-50% Drop" },{ key: "double" as const, label: "Double Income" }].map((s) => (
              <button key={s.key} onClick={() => setSimScenario(s.key)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", simScenario === s.key ? "bg-purple-500 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300")}>{s.label}</button>
            ))}
          </div>
          <div className={cn("p-4 rounded-xl border transition-all", simScenario === "none" ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800" : simScenario === "double" ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800" : "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800")}>
            <div className="flex items-center gap-2">{simScenario !== "none" && simScenario !== "double" ? <AlertCircle size={16} className="text-amber-500" /> : <TrendingUp size={16} className="text-emerald-500" />}<span className={cn("text-sm font-medium", simScenario === "none" || simScenario === "double" ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300")}>Projected monthly: {formatCurrency(simulatedIncome, currency)}</span></div>
            {simScenario !== "none" && <p className="text-xs mt-1.5 text-slate-500 dark:text-slate-400">{simScenario === "drop30" ? "With a 30% drop, consider reducing discretionary spending." : simScenario === "drop50" ? "A 50% drop is serious. Prioritize your Emergency bucket." : "Extra income! Boost your Growth bucket and pad your Emergency fund."}</p>}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 md:p-5 mb-6">
          <div className="flex items-center justify-between mb-3"><h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><Calendar size={18} className="text-blue-500" /> Income Pipeline</h2><button onClick={() => setShowAddGig(!showAddGig)} className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline"><Plus size={14} /> Add Gig</button></div>
          {showAddGig && (
            <div className="mb-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"><div className="space-y-2">
              <input type="text" placeholder="Title (e.g. Website redesign)" value={newGig.title} onChange={(e) => setNewGig({ ...newGig, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
              <div className="flex gap-2"><input type="text" placeholder="Client name" value={newGig.client} onChange={(e) => setNewGig({ ...newGig, client: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" /><input type="number" placeholder="Amount" value={newGig.expectedAmount} onChange={(e) => setNewGig({ ...newGig, expectedAmount: e.target.value })} className="w-28 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" /></div>
              <div className="flex gap-2"><input type="date" value={newGig.expectedDate} onChange={(e) => setNewGig({ ...newGig, expectedDate: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" /><select value={newGig.probability} onChange={(e) => setNewGig({ ...newGig, probability: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"><option value="confirmed">Confirmed</option><option value="likely">Likely</option><option value="possible">Possible</option><option value="speculative">Speculative</option></select></div>
              <div className="flex gap-2"><button onClick={handleAddGig} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium">Add Gig</button><button onClick={() => setShowAddGig(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm">Cancel</button></div>
            </div></div>
          )}
          {gigs.length === 0 ? <p className="text-sm text-slate-400 py-6 text-center">No upcoming gigs. Add one to start forecasting!</p> : (
            <div className="space-y-3">{gigs.map((gig) => (
              <div key={gig.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"><div className="flex-1 min-w-0"><p className="font-medium text-slate-800 dark:text-white truncate">{gig.title}</p><p className="text-xs text-slate-400 dark:text-slate-500">{gig.client} - {new Date(gig.expectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p></div><div className="flex items-center gap-3"><span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", probColors[gig.probability])}>{gig.probability}</span><span className="font-semibold text-slate-800 dark:text-white text-sm">{formatCurrency(gig.expectedAmount, currency)}</span></div></div>
            ))}</div>
          )}
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900"><div className="flex items-start gap-3"><Info size={20} className="text-emerald-500 shrink-0 mt-0.5" /><div><h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">Pro Tip: Income Smoothing</h3><p className="text-sm text-emerald-600 dark:text-emerald-300 leading-relaxed">When your income is irregular, plan based on your average monthly income, not your best month. Always keep your Buffer/Emergency bucket funded to cover at least 2-3 months of essential expenses.</p></div></div></div>
      </main>
    </div>
  );
}
