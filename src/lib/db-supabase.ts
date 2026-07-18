import { createClient as createServerClient } from "@/lib/supabase/server";

// Database types matching our schema
export interface User {
  id: string; email: string; name: string; currency: string;
  income_sources: string[]; created_at: string; onboarding_complete: boolean;
}

export interface Transaction {
  id: string; user_id: string; type: "income" | "expense"; amount: number;
  category: string; description: string; source?: string; date: string;
  deductible: boolean; bucket_id?: string;
}

export interface Bucket {
  id: string; user_id: string; name: string;
  type: "taxes" | "emergency" | "growth" | "living" | "fun" | "custom";
  target_amount: number; current_amount: number; allocation_percent: number;
  color: string; icon: string;
}

export interface Gig {
  id: string; user_id: string; title: string; client: string;
  expected_amount: number; expected_date: string;
  probability: "confirmed" | "likely" | "possible" | "speculative";
  status: "upcoming" | "in-progress" | "completed" | "cancelled";
}

export async function getUser(userId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}

export async function getTransactions(userId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false });
  return data || [];
}

export async function createTransaction(txn: Omit<Transaction, "id" | "created_at">) {
  const supabase = await createServerClient();
  const { data } = await supabase.from("transactions").insert(txn).select().single();
  return data;
}

export async function getBuckets(userId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase.from("buckets").select("*").eq("user_id", userId);
  return data || [];
}

export async function createBucket(bucket: Omit<Bucket, "id" | "created_at">) {
  const supabase = await createServerClient();
  const { data } = await supabase.from("buckets").insert(bucket).select().single();
  return data;
}

export async function updateBucket(id: string, updates: Partial<Bucket>) {
  const supabase = await createServerClient();
  const { data } = await supabase.from("buckets").update(updates).eq("id", id).select().single();
  return data;
}

export async function getGigs(userId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase.from("gigs").select("*").eq("user_id", userId).order("expected_date", { ascending: true });
  return data || [];
}

export async function createGig(gig: Omit<Gig, "id" | "created_at">) {
  const supabase = await createServerClient();
  const { data } = await supabase.from("gigs").insert(gig).select().single();
  return data;
}

export async function updateProfile(userId: string, updates: Partial<User>) {
  const supabase = await createServerClient();
  const { data } = await supabase.from("profiles").update(updates).eq("id", userId).select().single();
  return data;
}

// Seed demo data for a new user - only if no data exists yet
export async function seedDemoData(userId: string) {
  const supabase = await createServerClient();

  // Check if user already has data
  const { count: txnCount } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (txnCount && txnCount > 0) {
    return; // Already seeded, skip
  }

  const buckets = [
    { user_id: userId, name: "Taxes", type: "taxes", target_amount: 5000, current_amount: 1250, allocation_percent: 30, color: "#ef4444", icon: "receipt" },
    { user_id: userId, name: "Emergency Fund", type: "emergency", target_amount: 3000, current_amount: 1800, allocation_percent: 20, color: "#f59e0b", icon: "shield" },
    { user_id: userId, name: "Business Growth", type: "growth", target_amount: 2000, current_amount: 600, allocation_percent: 15, color: "#8b5cf6", icon: "trending-up" },
    { user_id: userId, name: "Living Expenses", type: "living", target_amount: 4000, current_amount: 2800, allocation_percent: 25, color: "#10b981", icon: "home" },
    { user_id: userId, name: "Fun Money", type: "fun", target_amount: 1000, current_amount: 400, allocation_percent: 10, color: "#ec4899", icon: "sparkles" },
  ];
  const { error: bucketError } = await supabase.from("buckets").insert(buckets);
  if (bucketError) console.error("Seed buckets failed:", bucketError.message);

  const now = new Date();
  const days = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();
  const txns = [
    { user_id: userId, type: "income", amount: 2500, category: "freelance", description: "Website redesign - Acme Corp", source: "Acme Corp", date: days(2), deductible: false },
    { user_id: userId, type: "income", amount: 1800, category: "freelance", description: "Logo design - StartupX", source: "StartupX", date: days(7), deductible: false },
    { user_id: userId, type: "expense", amount: 450, category: "software", description: "Adobe Creative Cloud", date: days(3), deductible: true },
    { user_id: userId, type: "expense", amount: 1200, category: "rent", description: "Monthly rent", date: days(5), deductible: false },
    { user_id: userId, type: "income", amount: 3200, category: "consulting", description: "UX audit - TechCorp", source: "TechCorp", date: days(14), deductible: false },
    { user_id: userId, type: "expense", amount: 89, category: "utilities", description: "Internet bill", date: days(10), deductible: true },
    { user_id: userId, type: "expense", amount: 65, category: "food", description: "Grocery shopping", date: days(8), deductible: false },
    { user_id: userId, type: "income", amount: 900, category: "freelance", description: "Social media graphics", source: "LocalBakery", date: days(21), deductible: false },
    { user_id: userId, type: "expense", amount: 200, category: "healthcare", description: "Health insurance", date: days(15), deductible: true },
    { user_id: userId, type: "expense", amount: 150, category: "transportation", description: "Gas", date: days(12), deductible: false },
    { user_id: userId, type: "income", amount: 4200, category: "freelance", description: "Full brand identity - LaunchPad", source: "LaunchPad", date: days(28), deductible: false },
    { user_id: userId, type: "expense", amount: 300, category: "software", description: "Figma + Notion annual", date: days(25), deductible: true },
    { user_id: userId, type: "expense", amount: 35, category: "entertainment", description: "Netflix subscription", date: days(20), deductible: false },
    { user_id: userId, type: "expense", amount: 80, category: "food", description: "Dinner with client", date: days(18), deductible: false },
    { user_id: userId, type: "income", amount: 1500, category: "freelance", description: "Landing page - EcoShop", source: "EcoShop", date: days(35), deductible: false },
    { user_id: userId, type: "expense", amount: 500, category: "education", description: "Online course - Advanced React", date: days(40), deductible: true },
    { user_id: userId, type: "income", amount: 2800, category: "consulting", description: "Strategy session - FinCo", source: "FinCo", date: days(45), deductible: false },
    { user_id: userId, type: "expense", amount: 1100, category: "rent", description: "Monthly rent", date: days(35), deductible: false },
  ];
  const future = (n: number) => new Date(now.getTime() + n * 86400000).toISOString();
  const gigs = [
    { user_id: userId, title: "Mobile app UI design", client: "AppNova", expected_amount: 5000, expected_date: future(14), probability: "confirmed", status: "upcoming" },
    { user_id: userId, title: "Website maintenance retainer", client: "Acme Corp", expected_amount: 1500, expected_date: future(30), probability: "likely", status: "upcoming" },
    { user_id: userId, title: "Brand refresh project", client: "LocalCafe", expected_amount: 3000, expected_date: future(21), probability: "possible", status: "upcoming" },
    { user_id: userId, title: "Illustration series", client: "PubHouse", expected_amount: 2000, expected_date: future(45), probability: "speculative", status: "upcoming" },
    { user_id: userId, title: "SEO audit", client: "GrowthLabs", expected_amount: 800, expected_date: future(7), probability: "confirmed", status: "in-progress" },
  ];
  const { error: gigError } = await supabase.from("gigs").insert(gigs);
  if (gigError) console.error("Seed gigs failed:", gigError.message);
}
