"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/nav";
import { ArrowLeft, User, Mail, Globe, Briefcase, Plus, X, Check, LogOut, Shield, Moon, Sun } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string; currency: string; incomeSources: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [sources, setSources] = useState<string[]>([]);
  const [newSource, setNewSource] = useState("");
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    fetch("/api/user-data").then((r) => r.ok ? r.json() : null).then((d) => {
      if (d?.error) { router.push("/login"); return; }
      setUser(d.user); setName(d.user.name); setCurrency(d.user.currency);
      setSources(d.user.incomeSources || []); setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  const handleSave = async () => {
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, currency, incomeSources: sources }) });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const addSource = () => { if (newSource.trim() && !sources.includes(newSource.trim())) { setSources([...sources, newSource.trim()]); setNewSource(""); } };
  const removeSource = (source: string) => { setSources(sources.filter((s) => s !== source)); };
  const handleLogout = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); };

  const currencies = [{ code: "USD", label: "US Dollar ($)" },{ code: "EUR", label: "Euro (\u20ac)" },{ code: "GBP", label: "British Pound (\u00a3)" },{ code: "CAD", label: "Canadian Dollar (C$)" },{ code: "AUD", label: "Australian Dollar (A$)" },{ code: "INR", label: "Indian Rupee (\u20b9)" }];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafb] dark:bg-[#0a0f1a]"><div className="shimmer w-48 h-4" /></div>;

  return (
    <div className="min-h-screen bg-[#f8fafb] dark:bg-[#0a0f1a] md:pl-64 pb-20 md:pb-0">
      <BottomNav />
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 animate-in"><button onClick={() => router.push("/")} className="md:hidden flex items-center gap-1 text-sm text-slate-400 mb-2"><ArrowLeft size={14} /> Dashboard</button><h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your profile and preferences</p></div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 mb-4">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><User size={18} className="text-emerald-500" /> Profile</h2>
          <div className="space-y-3">
            <div><label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" /></div>
            <div><label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label><div className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-sm text-slate-400 dark:text-slate-500 flex items-center gap-2"><Mail size={14} />{user?.email}</div></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 mb-4 animation-delay-100">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Globe size={18} className="text-blue-500" /> Currency</h2>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">{currencies.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}</select>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 mb-4 animation-delay-200">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Briefcase size={18} className="text-purple-500" /> Income Sources</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Add the types of gigs or income you typically earn</p>
          <div className="flex gap-2 mb-3"><input type="text" value={newSource} onChange={(e) => setNewSource(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSource()} placeholder="e.g. Freelance design, Consulting..." className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" /><button onClick={addSource} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"><Plus size={16} /></button></div>
          <div className="flex flex-wrap gap-2">{sources.map((source) => <span key={source} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-300">{source}<button onClick={() => removeSource(source)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={12} /></button></span>)}{sources.length === 0 && <p className="text-xs text-slate-400">No income sources added yet.</p>}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 mb-4 animation-delay-300">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">{theme === "dark" ? <Moon size={18} className="text-indigo-500" /> : <Sun size={18} className="text-amber-500" />} Appearance</h2>
          <div className="flex gap-2">{(["light", "dark", "system"] as const).map((t) => <button key={t} onClick={() => setTheme(t)} className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize", theme === t ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400")}>{t}</button>)}</div>
        </div>
        <button onClick={handleSave} className={cn("w-full py-3 rounded-xl font-semibold text-sm transition-all mb-4", saved ? "bg-emerald-500 text-white" : "bg-slate-800 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100")}>{saved ? <span className="flex items-center justify-center gap-2"><Check size={16} /> Saved!</span> : "Save Changes"}</button>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 mb-4 animation-delay-400"><h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Shield size={18} className="text-slate-500" /> Account</h2><div className="space-y-2"><div className="flex items-center justify-between py-2 px-1"><span className="text-sm text-slate-600 dark:text-slate-300">Data storage</span><span className="text-sm text-slate-400 dark:text-slate-500">Local JSON files</span></div></div></div>
        <button onClick={handleLogout} className="w-full py-3 rounded-xl border border-red-200 dark:border-red-800 text-red-500 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-950 transition-all flex items-center justify-center gap-2 animation-delay-500"><LogOut size={16} /> Log out</button>
      </main>
    </div>
  );
}
