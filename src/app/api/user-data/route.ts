import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toCamelCase } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [profileRes, txnsRes, bucketsRes, gigsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("buckets").select("*").eq("user_id", user.id),
      supabase.from("gigs").select("*").eq("user_id", user.id).order("expected_date", { ascending: true }),
    ]);

    if (profileRes.error && profileRes.error.code !== "PGRST116") {
      console.error("Profile fetch error:", profileRes.error);
    }
    const profile = profileRes.data;
    const transactions = txnsRes.data || [];
    const buckets = bucketsRes.data || [];
    const gigs = gigsRes.data || [];

    const safeNum = (v: unknown) => { const n = Number(v); return isNaN(n) ? 0 : n; };
    const safeDate = (d: string) => { const parsed = new Date(d); return isNaN(parsed.getTime()) ? new Date(0) : parsed; };

    const now = new Date();
    const thirtyDays = new Date(now.getTime() - 30 * 86400000);
    const ninetyDays = new Date(now.getTime() - 90 * 86400000);

    const recent30 = transactions.filter((t) => safeDate(t.date) >= thirtyDays);
    const income30 = recent30.filter((t) => t.type === "income").reduce((s, t) => s + safeNum(t.amount), 0);
    const expenses30 = recent30.filter((t) => t.type === "expense").reduce((s, t) => s + safeNum(t.amount), 0);

    const monthlyIncome: { month: string; amount: number }[] = [];
    const monthlyExpenses: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const label = start.toLocaleString("en-US", { month: "short" });
      const monthTxns = transactions.filter((t) => {
        const d = safeDate(t.date);
        return d >= start && d <= end;
      });
      monthlyIncome.push({ month: label, amount: monthTxns.filter((t) => t.type === "income").reduce((s, t) => s + safeNum(t.amount), 0) });
      monthlyExpenses.push({ month: label, amount: monthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + safeNum(t.amount), 0) });
    }

    const avgMonthlyIncome = monthlyIncome.reduce((s, m) => s + m.amount, 0) / Math.max(1, monthlyIncome.filter((m) => m.amount > 0).length) || income30;
    const safeToSpend = income30 - expenses30;
    const totalBucketBalances = buckets.reduce((s, b) => s + safeNum(b.current_amount), 0);

    const recent90 = transactions.filter((t) => safeDate(t.date) >= ninetyDays);
    const income90 = recent90.filter((t) => t.type === "income").reduce((s, t) => s + safeNum(t.amount), 0);
    const deductible90 = recent90.filter((t) => t.deductible && t.type === "expense").reduce((s, t) => s + safeNum(t.amount), 0);
    const quarterlyTaxEstimate = Math.max(0, (income90 - deductible90) * 0.3);

    const probabilities: Record<string, number> = { confirmed: 1, likely: 0.7, possible: 0.4, speculative: 0.1 };
    const pipelineTotal = gigs
      .filter((g) => g.status !== "completed" && g.status !== "cancelled")
      .reduce((s, g) => s + safeNum(g.expected_amount) * (probabilities[g.probability] || 0), 0);

    return NextResponse.json({
      user: toCamelCase({
        id: user.id,
        name: profile?.name || user.email,
        email: user.email,
        currency: profile?.currency || "GBP",
      }),
      safeToSpend,
      income30,
      expenses30,
      avgMonthlyIncome,
      totalBucketBalances,
      pipelineTotal,
      quarterlyTaxEstimate,
      monthlyIncome,
      monthlyExpenses,
      recentTransactions: transactions.slice(0, 20).map(toCamelCase),
      transactions: transactions.map(toCamelCase),
      buckets: buckets.map(toCamelCase),
      gigs: gigs.filter((g) => g.status !== "completed" && g.status !== "cancelled").map(toCamelCase),
    });
  } catch (err) {
    console.error("user-data API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
