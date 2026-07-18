"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, PiggyBank, ArrowLeftRight, TrendingUp, Receipt, Settings, LogOut, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/buckets", label: "Buckets", icon: PiggyBank },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/forecast", label: "Forecast", icon: TrendingUp },
  { href: "/taxes", label: "Taxes", icon: Receipt },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition-all duration-200",
                active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              )}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl text-slate-400 dark:text-slate-500">
            <Menu size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex" onClick={() => setMenuOpen(false)}>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
            <div className="absolute bottom-16 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl border-t border-slate-200 dark:border-slate-800 p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-3 px-2">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Menu</span>
                <button onClick={() => setMenuOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
              </div>
              {navItems.slice(4).map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all",
                    active ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}>
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full mt-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all">
                <LogOut size={20} />
                <span className="font-medium">Log out</span>
              </button>
            </div>
          </div>
        )}
      </nav>
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-40">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">G</div>
            <span className="font-bold text-lg text-slate-800 dark:text-white">GigFlow</span>
          </Link>
        </div>
        <nav className="flex-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200",
                active ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-200"
              )}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all">
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default BottomNav;
