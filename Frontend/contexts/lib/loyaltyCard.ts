import {
  findUserIdByLoyaltySlug,
  getAccountByIdForPublic,
} from "@/contexts/lib/userRegistry";

const LOYALTY_CARDS_KEY = "loyaltyCardsByUserId";

export interface LoyaltyStamp {
  id: string;
  timestamp: number;
  notes?: string;
}

export interface LoyaltyCardData {
  cardName: string;
  businessName: string;
  description: string;
  stampGoal: number;
  stamps: LoyaltyStamp[];
  rewardTitle: string;
  rewardDescription: string;
}

export function defaultLoyaltyCard(user: {
  name: string;
  email: string;
}): LoyaltyCardData {
  return {
    cardName: "My Loyalty Card",
    businessName: user.name || "My Business",
    description: "Collect stamps and earn rewards!",
    stampGoal: 10,
    stamps: [],
    rewardTitle: "Free Item",
    rewardDescription: "Get a free item after collecting all stamps",
  };
}

function readAll(): Record<string, LoyaltyCardData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOYALTY_CARDS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, LoyaltyCardData>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, LoyaltyCardData>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOYALTY_CARDS_KEY, JSON.stringify(data));
}

export function getLoyaltyCard(userId: string): LoyaltyCardData | null {
  const all = readAll();
  return all[userId] ?? null;
}

export function saveLoyaltyCard(userId: string, data: LoyaltyCardData): void {
  const all = readAll();
  all[userId] = data;
  writeAll(all);
}

export function addStamp(userId: string): LoyaltyCardData | null {
  const card = getLoyaltyCard(userId);
  if (!card) return null;

  const newStamp: LoyaltyStamp = {
    id: `stamp-${Date.now()}`,
    timestamp: Date.now(),
  };

  const updatedCard = {
    ...card,
    stamps: [...card.stamps, newStamp],
  };

  saveLoyaltyCard(userId, updatedCard);
  return updatedCard;
}

export function removeStamp(userId: string, stampId: string): LoyaltyCardData | null {
  const card = getLoyaltyCard(userId);
  if (!card) return null;

  const updatedCard = {
    ...card,
    stamps: card.stamps.filter((s) => s.id !== stampId),
  };

  saveLoyaltyCard(userId, updatedCard);
  return updatedCard;
}

/** Public card: resolve only by secret slug */
export function getPublicLoyaltyCardBySlug(slug: string): {
  card: LoyaltyCardData | null;
  fallbackName: string;
  fallbackEmail: string;
} | null {
  const userId = findUserIdByLoyaltySlug(slug);
  if (!userId) return null;
  const account = getAccountByIdForPublic(userId);
  if (!account) return null;
  return {
    card: getLoyaltyCard(userId),
    fallbackName: account.name,
    fallbackEmail: account.email,
  };
}
