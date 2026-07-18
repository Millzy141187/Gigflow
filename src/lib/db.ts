import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readCollection<T>(name: string): T[] {
  ensureDir();
  const filePath = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
    return [];
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeCollection<T>(name: string, data: T[]): void {
  ensureDir();
  const filePath = path.join(DATA_DIR, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  currency: string;
  incomeSources: string[];
  createdAt: string;
  onboardingComplete: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  source?: string;
  date: string;
  deductible: boolean;
  bucketId?: string;
}

export interface Bucket {
  id: string;
  userId: string;
  name: string;
  type: "taxes" | "emergency" | "growth" | "living" | "fun" | "custom";
  targetAmount: number;
  currentAmount: number;
  allocationPercent: number;
  color: string;
  icon: string;
}

export interface Gig {
  id: string;
  userId: string;
  title: string;
  client: string;
  expectedAmount: number;
  expectedDate: string;
  probability: "confirmed" | "likely" | "possible" | "speculative";
  status: "upcoming" | "in-progress" | "completed" | "cancelled";
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

export const db = {
  users: {
    all: () => readCollection<User>("users"),
    findById: (id: string) => readCollection<User>("users").find((u) => u.id === id),
    findByEmail: (email: string) => readCollection<User>("users").find((u) => u.email === email),
    create: (user: User) => {
      const users = readCollection<User>("users");
      users.push(user);
      writeCollection("users", users);
      return user;
    },
    update: (id: string, updates: Partial<User>) => {
      const users = readCollection<User>("users");
      const idx = users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      users[idx] = { ...users[idx], ...updates };
      writeCollection("users", users);
      return users[idx];
    },
  },
  transactions: {
    all: () => readCollection<Transaction>("transactions"),
    findByUser: (userId: string) =>
      readCollection<Transaction>("transactions")
        .filter((t) => t.userId === userId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    findById: (id: string) => readCollection<Transaction>("transactions").find((t) => t.id === id),
    create: (t: Transaction) => {
      const all = readCollection<Transaction>("transactions");
      all.push(t);
      writeCollection("transactions", all);
      return t;
    },
    update: (id: string, updates: Partial<Transaction>) => {
      const all = readCollection<Transaction>("transactions");
      const idx = all.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...updates };
      writeCollection("transactions", all);
      return all[idx];
    },
    delete: (id: string) => {
      const all = readCollection<Transaction>("transactions");
      const filtered = all.filter((t) => t.id !== id);
      writeCollection("transactions", filtered);
      return true;
    },
  },
  buckets: {
    all: () => readCollection<Bucket>("buckets"),
    findByUser: (userId: string) => readCollection<Bucket>("buckets").filter((b) => b.userId === userId),
    findById: (id: string) => readCollection<Bucket>("buckets").find((b) => b.id === id),
    create: (b: Bucket) => {
      const all = readCollection<Bucket>("buckets");
      all.push(b);
      writeCollection("buckets", all);
      return b;
    },
    update: (id: string, updates: Partial<Bucket>) => {
      const all = readCollection<Bucket>("buckets");
      const idx = all.findIndex((b) => b.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...updates };
      writeCollection("buckets", all);
      return all[idx];
    },
    delete: (id: string) => {
      const all = readCollection<Bucket>("buckets");
      writeCollection("buckets", all.filter((b) => b.id !== id));
      return true;
    },
  },
  gigs: {
    all: () => readCollection<Gig>("gigs"),
    findByUser: (userId: string) =>
      readCollection<Gig>("gigs")
        .filter((g) => g.userId === userId)
        .sort((a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime()),
    findById: (id: string) => readCollection<Gig>("gigs").find((g) => g.id === id),
    create: (g: Gig) => {
      const all = readCollection<Gig>("gigs");
      all.push(g);
      writeCollection("gigs", all);
      return g;
    },
    update: (id: string, updates: Partial<Gig>) => {
      const all = readCollection<Gig>("gigs");
      const idx = all.findIndex((g) => g.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...updates };
      writeCollection("gigs", all);
      return all[idx];
    },
    delete: (id: string) => {
      const all = readCollection<Gig>("gigs");
      writeCollection("gigs", all.filter((g) => g.id !== id));
      return true;
    },
  },
  sessions: {
    all: () => readCollection<Session>("sessions"),
    findByToken: (token: string) => readCollection<Session>("sessions").find((s) => s.token === token),
    create: (s: Session) => {
      const all = readCollection<Session>("sessions");
      all.push(s);
      writeCollection("sessions", all);
      return s;
    },
    delete: (token: string) => {
      const all = readCollection<Session>("sessions");
      writeCollection("sessions", all.filter((s) => s.token !== token));
      return true;
    },
    deleteByUser: (userId: string) => {
      const all = readCollection<Session>("sessions");
      writeCollection("sessions", all.filter((s) => s.userId !== userId));
      return true;
    },
  },
};
