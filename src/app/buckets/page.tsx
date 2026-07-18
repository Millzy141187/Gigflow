"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import BottomNav from "@/components/nav";
import { BucketCard } from "@/components/bucket-card";
import { PiggyBank, Plus, Info, ArrowLeft, Sparkles } from "lucide-react";

interface Bucket { id: string; name: string; type: string; targetAmount: number; currentAmount: number; allocationPercent: number; color: string; icon: string; }

export default function BucketsPage() {
  const router = useRouter();
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("GBP");
  const [editing, setEditing] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newBucket, setNewBucket] = useState({ name: "", targetAmount: "", allocationPercent: "10", color: "#10b981", icon: "folder" });

  useEffect(() => {
    fetch("/api/user-data").then((r) => r.ok ? r.json() : null).then((d) => {
      if (d?.error) { router.push("/login"); return; }
      setBuckets(d.buckets); setCurrency(d.user.currency); setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  const handleAllocate = async (bucketId: string, amount: number) => {
    await fetch("/api/buckets", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: bucketId, currentAmount: amount }) });
    setBuckets((prev) => prev.map((b) => (b.id === bucketId ? { ...b, currentAmount: amount } : b)));
    setEditing(null);
  };

  const handleCreate = async () => {
    if (!newBucket.name || !newBucket.targetAmount) return;
    const res = await fetch("/api/buckets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newBucket.name, type: "custom", targetAmount: Number(newBucket.targetAmount), currentAmount: 0, allocationPercent: Number(newBucket.allocationPercent), color: newBucket.color, icon: newBucket.icon }) });
    if (res.ok) { const created = await res.json(); setBuckets((prev) => [...prev, created]); setShowAdd(false); setNewBucket({ name: "", targetAmount: "", allocationPercent: "10", color: "#10b981", icon: "folder" }); }
  };

  const totalAllocated = buckets.reduce((s, b) => s + b.currentAmount, 0);
  const totalTarget = buckets.reduce((s, b) => s + b.targetAmount, 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafb] dark:bg-[#0a0f1a]"><div className="shimmer w-48 h-4" /></div>;

  return (
    <div className="min-h-screen bg-[#f8fafb] dark:bg-[#0a0f1a] md:pl-64 pb-20 md:pb-0">
      <BottomNav />
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-start justify-between mb-6 animate-in">
          <div>
            <button onClick={() => router.push("/")} className="md:hidden flex items-center gap-1 text-sm text-slate-400 mb-2"><ArrowLeft size={14} /> Dashboard</button>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Buckets</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Smart money allocation for your freelance income</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium"><Plus size={16} /> Add</button>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-3"><PiggyBank size={18} className="text-emerald-500" /><span className="font-semibold">Total in Buckets</span></div>
          <p className="text-2xl font-bold">{formatCurrency(totalAllocated, currency)}</p>
          <p className="text-sm text-slate-400 mt-1">of {formatCurrency(totalTarget, currency)} target</p>
        </div>
        {showAdd && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800 shadow-sm mb-6">
            <h3 className="font-semibold mb-3"><Sparkles size={16} className="inline text-emerald-500 mr-1" /> New Bucket</h3>
            <div className="space-y-2">
              <input type="text" placeholder="Bucket name" value={newBucket.name} onChange={(e) => setNewBucket({ ...newBucket, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
              <div className="flex gap-2"><input type="number" placeholder="Target amount" value={newBucket.targetAmount} onChange={(e) => setNewBucket({ ...newBucket, targetAmount: e.target.value })} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" /><input type="number" placeholder="%" value={newBucket.allocationPercent} onChange={(e) => setNewBucket({ ...newBucket, allocationPercent: e.target.value })} className="w-20 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" /></div>
              <div className="flex gap-2"><button onClick={handleCreate} className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium">Create</button><button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl text-sm">Cancel</button></div>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {buckets.map((bucket) => (
            <div key={bucket.id}>
              {editing === bucket.id ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Edit: {bucket.name}</p>
                  <div className="flex gap-2"><input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" autoFocus /><button onClick={() => handleAllocate(bucket.id, Number(editAmount))} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600">Save</button><button onClick={() => setEditing(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl text-sm">Cancel</button></div>
                </div>
              ) : (
                <BucketCard {...bucket} currency={currency} onClick={() => { setEditing(bucket.id); setEditAmount(String(bucket.currentAmount)); }} />
              )}
            </div>
          ))}
          {buckets.length === 0 && <div className="text-center py-12"><PiggyBank size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" /><p className="text-slate-400">No buckets yet. Create your first one!</p></div>}
        </div>
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl p-5 border border-blue-100 dark:border-blue-900">
          <div className="flex items-start gap-3"><Info size={20} className="text-blue-500 shrink-0 mt-0.5" /><div><h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">How Auto-Allocation Works</h3><p className="text-sm text-blue-600 dark:text-blue-300 leading-relaxed">When you receive a payment, GigFlow automatically distributes it across your buckets based on the allocation percentages you set. This is called income smoothing.</p></div></div>
        </div>
      </main>
    </div>
  );
}
