import type { ServiceId } from "@/contexts/lib/service";

export type PaymentStatus = "pending" | "paid" | "failed";

const USERS_KEY = "users";

export interface AccountRecord {
  id: string;
  email: string;
  name: string;
  phone?: string;
  password: string;
  paymentStatus: PaymentStatus;
  acquiredService: ServiceId | null;
  nfcPublicSlug?: string;
  loyaltyPublicSlug?: string;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  acquiredService: ServiceId | null;
  paymentStatus: PaymentStatus;
  nfcPublicSlug?: string;
  loyaltyPublicSlug?: string;
}

function writeRawUsers(users: AccountRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function readRawUsers(): AccountRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(USERS_KEY) || "[]";
  let arr: Partial<AccountRecord>[];
  try {
    arr = JSON.parse(raw) as Partial<AccountRecord>[];
  } catch {
    return [];
  }
  const out: AccountRecord[] = [];
  let dirty = false;
  for (const u of arr) {
    if (!u.id || !u.email || typeof u.password !== "string") continue;
    const rec: AccountRecord = {
      id: u.id,
      email: u.email,
      name: u.name ?? "",
      phone: u.phone,
      password: u.password,
      paymentStatus: u.paymentStatus ?? "pending",
      acquiredService:
        u.acquiredService === undefined ? null : u.acquiredService,
      nfcPublicSlug: u.nfcPublicSlug,
      loyaltyPublicSlug: u.loyaltyPublicSlug,
    };
    if (u.paymentStatus === undefined || u.acquiredService === undefined) {
      dirty = true;
    }
    out.push(rec);
  }
  if (dirty) writeRawUsers(out);
  return out;
}

export function listUsersForAdmin(): AdminUserRow[] {
  const users = readRawUsers();
  for (const u of users) {
    if (u.acquiredService === "nfc-business") {
      ensureNfcPublicSlug(u.id);
    }
    if (u.acquiredService === "loyalty") {
      ensureLoyaltyPublicSlug(u.id);
    }
  }
  return readRawUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    acquiredService: u.acquiredService,
    paymentStatus: u.paymentStatus,
    nfcPublicSlug: u.nfcPublicSlug,
    loyaltyPublicSlug: u.loyaltyPublicSlug,
  }));
}

export function setUserPaymentStatus(
  userId: string,
  status: PaymentStatus,
): void {
  const users = readRawUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return;
  users[idx] = { ...users[idx], paymentStatus: status };
  writeRawUsers(users);
}

export function deleteUser(userId: string): void {
  const users = readRawUsers();
  const remaining = users.filter((u) => u.id !== userId);
  if (remaining.length === users.length) return;
  writeRawUsers(remaining);
}

export function addUser(user: AccountRecord): void {
  const users = readRawUsers().filter((u) => u.id !== user.id);
  users.push(user);
  writeRawUsers(users);
}

export function syncAcquiredService(userId: string, service: ServiceId): void {
  const users = readRawUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return;
  users[idx] = { ...users[idx], acquiredService: service };
  writeRawUsers(users);
}

function randomSlug(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 18)}`;
}

/** Ensures a stable unguessable public slug for NFC encoding; one per account. */
export function ensureNfcPublicSlug(userId: string): string {
  const users = readRawUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return "";
  let slug = users[idx].nfcPublicSlug;
  if (!slug) {
    slug = randomSlug();
    users[idx] = { ...users[idx], nfcPublicSlug: slug };
    writeRawUsers(users);
  }
  return slug;
}

export function findUserIdByPublicSlug(slug: string): string | null {
  if (!slug) return null;
  const users = readRawUsers();
  const u = users.find((x) => x.nfcPublicSlug === slug);
  return u?.id ?? null;
}

/** Loyalty program share links use a separate slug from NFC. */
export function ensureLoyaltyPublicSlug(userId: string): string {
  const users = readRawUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return "";
  let slug = users[idx].loyaltyPublicSlug;
  if (!slug) {
    slug = randomSlug();
    users[idx] = { ...users[idx], loyaltyPublicSlug: slug };
    writeRawUsers(users);
  }
  return slug;
}

export function findUserIdByLoyaltySlug(slug: string): string | null {
  if (!slug) return null;
  const users = readRawUsers();
  const u = users.find((x) => x.loyaltyPublicSlug === slug);
  return u?.id ?? null;
}

export function getAccountByIdForPublic(userId: string): {
  name: string;
  email: string;
} | null {
  const u = readRawUsers().find((x) => x.id === userId);
  if (!u) return null;
  return { name: u.name, email: u.email };
}
