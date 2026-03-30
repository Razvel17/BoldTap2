import {
  findUserIdByPublicSlug,
  getAccountByIdForPublic,
} from "@/contexts/lib/userRegistry";

const NFC_PROFILES_KEY = "nfcProfilesByUserId";

export interface NfcSocialLink {
  id: string;
  label: string;
  url: string;
}

export interface NfcProfileData {
  name: string;
  title: string;
  company: string;
  phones: string[];
  emails: string[];
  website: string;
  socialLinks: NfcSocialLink[];
  /** Shown in About section */
  about?: string;
  /** Full-width banner image URL or data URL */
  bannerImageUrl?: string;
  /** Circular avatar image URL or data URL */
  profileImageUrl?: string;
}

export function defaultNfcProfile(user: {
  name: string;
  email: string;
  phone?: string;
}): NfcProfileData {
  return {
    name: user.name || "",
    title: "",
    company: "",
    phones: user.phone ? [user.phone] : [""],
    emails: user.email ? [user.email] : [""],
    website: "",
    about: "",
    socialLinks: [],
  };
}

function readAll(): Record<string, NfcProfileData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(NFC_PROFILES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, NfcProfileData>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, NfcProfileData>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NFC_PROFILES_KEY, JSON.stringify(data));
}

export function getNfcProfile(userId: string): NfcProfileData | null {
  const all = readAll();
  return all[userId] ?? null;
}

export function saveNfcProfile(userId: string, data: NfcProfileData): void {
  const all = readAll();
  all[userId] = data;
  writeAll(all);
}

/** Public card: resolve only by secret slug — never by user id from the client URL. */
export function getPublicCardBySlug(slug: string): {
  profile: NfcProfileData | null;
  fallbackName: string;
  fallbackEmail: string;
} | null {
  const userId = findUserIdByPublicSlug(slug);
  if (!userId) return null;
  const account = getAccountByIdForPublic(userId);
  if (!account) return null;
  return {
    profile: getNfcProfile(userId),
    fallbackName: account.name,
    fallbackEmail: account.email,
  };
}
