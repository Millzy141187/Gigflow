import { db, type Bucket, type Transaction, type Gig } from "./db";
import { generateId } from "./utils";

const DEMO_USER_ID = "__demo__";

function makeTxn(overrides: Partial<Transaction> & { amount: number; type: "income" | "expense"; description: string; date: string }): Transaction {
  return { id: generateId(), userId: DEMO_USER_ID, category: "uncategorized", deductible: false, ...overrides };
}

function makeBucket(overrides: Partial<Bucket> & { name: string; type: Bucket["type"] }): Bucket {
  return { id: generateId(), userId: DEMO_USER_ID, targetAmount: 1000, currentAmount: 0, allocationPercent: 20, color: "#10b981", icon: "folder", ...overrides };
}

function makeGig(overrides: Partial<Gig> & { title: string }): Gig {
  return { id: generateId(), userId: DEMO_USER_ID, client: "Various", expectedAmount: 500, expectedDate: new Date(Date.now() + 7 * 86400000).toISOString(), probability: "likely", status: "upcoming", ...overrides };
}

export function seedDemoData(userId: string) {
  const existing = db.transactions.findByUser(userId);
  if (existing.length > 0) return;

  const now = new Date();
  const day = 86400000;

  const buckets: Bucket[] = [
    makeBucket({ name: "Taxes", type: "taxes", targetAmount: 5000, currentAmount: 2100, allocationPercent: 30, color: "#ef4444", icon: "receipt" }),
    makeBucket({ name: "Buffer / Emergency", type: "emergency", targetAmount: 3000, currentAmount: 1500, allocationPercent: 20, color: "#f59e0b", icon: "shield" }),
    makeBucket({ name: "Business Growth", type: "growth", targetAmount: 2000, currentAmount: 350, allocationPercent: 15, color: "#8b5cf6", icon: "trending-up" }),
    makeBucket({ name: "Living Expenses", type: "living", targetAmount: 2500, currentAmount: 1800, allocationPercent: 25, color: "#3b82f6", icon: "home" }),
    makeBucket({ name: "Fun / Guilt-Free", type: "fun", targetAmount: 1000, currentAmount: 400, allocationPercent: 10, color: "#ec4899", icon: "sparkles" }),
  ];
  buckets.forEach((b) => db.buckets.create(b));

  const txns: Transaction[] = [
    makeTxn({ type: "income", amount: 3500, description: "Web design project - Acme Corp", source: "Acme Corp", date: new Date(now.getTime() - 2 * day).toISOString(), category: "freelance" }),
    makeTxn({ type: "income", amount: 1200, description: "Logo design - StartupXYZ", source: "StartupXYZ", date: new Date(now.getTime() - 5 * day).toISOString(), category: "freelance" }),
    makeTxn({ type: "income", amount: 800, description: "Consulting call - Local Cafe", source: "Local Cafe", date: new Date(now.getTime() - 10 * day).toISOString(), category: "consulting" }),
    makeTxn({ type: "income", amount: 2200, description: "Mobile app MVP - TechStart Inc", source: "TechStart Inc", date: new Date(now.getTime() - 15 * day).toISOString(), category: "freelance" }),
    makeTxn({ type: "income", amount: 4500, description: "Full-stack dashboard - DataViz Co", source: "DataViz Co", date: new Date(now.getTime() - 25 * day).toISOString(), category: "freelance" }),
    makeTxn({ type: "income", amount: 600, description: "Bug fix sprint - SaaSly", source: "SaaSly", date: new Date(now.getTime() - 35 * day).toISOString(), category: "freelance" }),
    makeTxn({ type: "income", amount: 1800, description: "E-commerce integration - ShopFlow", source: "ShopFlow", date: new Date(now.getTime() - 45 * day).toISOString(), category: "freelance" }),
    makeTxn({ type: "expense", amount: 45, description: "Adobe Creative Cloud", date: new Date(now.getTime() - 1 * day).toISOString(), category: "subscriptions", deductible: true }),
    makeTxn({ type: "expense", amount: 120, description: "Coworking space - WeWork day pass", date: new Date(now.getTime() - 3 * day).toISOString(), category: "workspace", deductible: true }),
    makeTxn({ type: "expense", amount: 89, description: "Internet bill", date: new Date(now.getTime() - 4 * day).toISOString(), category: "utilities", deductible: true }),
    makeTxn({ type: "expense", amount: 250, description: "Grocery run - Trader Joe's", date: new Date(now.getTime() - 6 * day).toISOString(), category: "groceries" }),
    makeTxn({ type: "expense", amount: 35, description: "GitHub Pro", date: new Date(now.getTime() - 8 * day).toISOString(), category: "subscriptions", deductible: true }),
    makeTxn({ type: "expense", amount: 1800, description: "Rent payment", date: new Date(now.getTime() - 12 * day).toISOString(), category: "housing" }),
    makeTxn({ type: "expense", amount: 60, description: "Client lunch meeting", date: new Date(now.getTime() - 14 * day).toISOString(), category: "meals", deductible: true }),
    makeTxn({ type: "expense", amount: 15, description: "Notion subscription", date: new Date(now.getTime() - 16 * day).toISOString(), category: "subscriptions", deductible: true }),
    makeTxn({ type: "expense", amount: 95, description: "Phone bill", date: new Date(now.getTime() - 20 * day).toISOString(), category: "utilities", deductible: true }),
    makeTxn({ type: "expense", amount: 300, description: "New monitor - Dell 27\"", date: new Date(now.getTime() - 30 * day).toISOString(), category: "equipment", deductible: true }),
    makeTxn({ type: "expense", amount: 55, description: "Domain renewals", date: new Date(now.getTime() - 40 * day).toISOString(), category: "hosting", deductible: true }),
    makeTxn({ type: "expense", amount: 42, description: "Coffee + tips (monthly)", date: new Date(now.getTime() - 50 * day).toISOString(), category: "personal" }),
  ];
  txns.forEach((t) => db.transactions.create(t));

  const gigs: Gig[] = [
    makeGig({ title: "Redesign marketing site", client: "Acme Corp", expectedAmount: 2800, expectedDate: new Date(now.getTime() + 10 * day).toISOString(), probability: "confirmed" }),
    makeGig({ title: "API integration work", client: "TechStart Inc", expectedAmount: 1500, expectedDate: new Date(now.getTime() + 21 * day).toISOString(), probability: "likely" }),
    makeGig({ title: "Mobile app bug fixes", client: "SaaSly", expectedAmount: 900, expectedDate: new Date(now.getTime() + 35 * day).toISOString(), probability: "possible" }),
    makeGig({ title: "Brand identity package", client: "NewCo (proposal sent)", expectedAmount: 3500, expectedDate: new Date(now.getTime() + 45 * day).toISOString(), probability: "speculative" }),
    makeGig({ title: "Ongoing consulting retainer", client: "DataViz Co", expectedAmount: 1200, expectedDate: new Date(now.getTime() + 5 * day).toISOString(), probability: "confirmed", status: "in-progress" }),
  ];
  gigs.forEach((g) => db.gigs.create(g));
}
