import { db, type User } from "./db";
import { generateId } from "./utils";

function simpleHash(password: string): string {
  let hash = 0;
  const str = `gigflow_salt_${password}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + password.length.toString(36);
}

export function registerUser(
  email: string,
  password: string,
  name: string
): { user: User; token: string } | { error: string } {
  const existing = db.users.findByEmail(email);
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const user: User = {
    id: generateId(),
    email,
    name,
    passwordHash: simpleHash(password),
    currency: "GBP",
    incomeSources: [],
    createdAt: new Date().toISOString(),
    onboardingComplete: false,
  };

  db.users.create(user);

  const token = generateId() + generateId();
  db.sessions.create({
    id: generateId(),
    userId: user.id,
    token,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return { user, token };
}

export function loginUser(
  email: string,
  password: string
): { user: User; token: string } | { error: string } {
  const user = db.users.findByEmail(email);
  if (!user) {
    return { error: "No account found with this email." };
  }

  if (user.passwordHash !== simpleHash(password)) {
    return { error: "Incorrect password." };
  }

  db.sessions.deleteByUser(user.id);

  const token = generateId() + generateId();
  db.sessions.create({
    id: generateId(),
    userId: user.id,
    token,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return { user, token };
}

export function getUserFromToken(token: string): User | null {
  const session = db.sessions.findByToken(token);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    db.sessions.delete(token);
    return null;
  }
  return db.users.findById(session.userId) || null;
}

export function logoutUser(token: string): void {
  db.sessions.delete(token);
}

export function getTokenFromRequest(request: Request): string | null {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  const match = cookie.match(/gigflow_token=([^;]+)/);
  return match ? match[1] : null;
}
