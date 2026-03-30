const KEY = "loyaltyCustomersByMerchant";

export interface LoyaltyCustomer {
  id: string;
  name: string;
  phone?: string;
  stamps: number;
  joinedAt: number;
}

function readAll(): Record<string, LoyaltyCustomer[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, LoyaltyCustomer[]>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, LoyaltyCustomer[]>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function listCustomers(merchantId: string): LoyaltyCustomer[] {
  const all = readAll();
  return all[merchantId] ?? [];
}

export function addCustomer(
  merchantId: string,
  input: { name: string; phone?: string },
): LoyaltyCustomer {
  const all = readAll();
  const list = all[merchantId] ?? [];
  const id = `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const row: LoyaltyCustomer = {
    id,
    name: input.name.trim(),
    phone: input.phone?.trim() || undefined,
    stamps: 0,
    joinedAt: Date.now(),
  };
  all[merchantId] = [...list, row];
  writeAll(all);
  return row;
}

export function setCustomerStamps(
  merchantId: string,
  customerId: string,
  stamps: number,
): void {
  const all = readAll();
  const list = all[merchantId] ?? [];
  const idx = list.findIndex((c) => c.id === customerId);
  if (idx === -1) return;
  const next = Math.max(0, Math.floor(stamps));
  list[idx] = { ...list[idx], stamps: next };
  all[merchantId] = [...list];
  writeAll(all);
}

export function incrementCustomerStamps(
  merchantId: string,
  customerId: string,
  delta: number,
): void {
  const all = readAll();
  const list = all[merchantId] ?? [];
  const idx = list.findIndex((c) => c.id === customerId);
  if (idx === -1) return;
  const next = Math.max(0, list[idx].stamps + delta);
  list[idx] = { ...list[idx], stamps: next };
  all[merchantId] = [...list];
  writeAll(all);
}

export function getCustomer(
  merchantId: string,
  customerId: string,
): LoyaltyCustomer | null {
  return listCustomers(merchantId).find((c) => c.id === customerId) ?? null;
}

const VISITOR_PREFIX = "loyaltyVisitor_";

export function getStoredVisitorCustomerId(merchantId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${VISITOR_PREFIX}${merchantId}`);
}

export function setStoredVisitorCustomerId(
  merchantId: string,
  customerId: string,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${VISITOR_PREFIX}${merchantId}`, customerId);
}
