// Database abstraction layer with repository pattern
// This allows easy switching between in-memory storage and real database

import type {
  User,
  NfcBusinessProfile,
  LoyaltyCard,
  LoyaltyBusiness,
} from "../types/index";

// User Repository
export interface IUserRepository {
  create(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  list(limit?: number, offset?: number): Promise<User[]>;
  count(): Promise<number>;
}

// NFC Business Profile Repository
export interface INfcBusinessRepository {
  create(
    profile: Omit<NfcBusinessProfile, "id" | "createdAt" | "updatedAt">,
  ): Promise<NfcBusinessProfile>;
  findById(id: string): Promise<NfcBusinessProfile | null>;
  findBySlug(slug: string): Promise<NfcBusinessProfile | null>;
  findByUserId(userId: string): Promise<NfcBusinessProfile | null>;
  update(
    id: string,
    data: Partial<NfcBusinessProfile>,
  ): Promise<NfcBusinessProfile | null>;
  delete(id: string): Promise<boolean>;
  slugExists(slug: string): Promise<boolean>;
}

// Loyalty Business Repository
export interface ILoyaltyBusinessRepository {
  create(
    business: Omit<LoyaltyBusiness, "id" | "createdAt" | "updatedAt">,
  ): Promise<LoyaltyBusiness>;
  findById(id: string): Promise<LoyaltyBusiness | null>;
  findBySlug(slug: string): Promise<LoyaltyBusiness | null>;
  findByUserId(userId: string): Promise<LoyaltyBusiness[]>;
  update(
    id: string,
    data: Partial<LoyaltyBusiness>,
  ): Promise<LoyaltyBusiness | null>;
  delete(id: string): Promise<boolean>;
  slugExists(slug: string): Promise<boolean>;
}

// Loyalty Card Repository
export interface ILoyaltyCardRepository {
  create(
    card: Omit<LoyaltyCard, "id" | "createdAt" | "updatedAt">,
  ): Promise<LoyaltyCard>;
  findById(id: string): Promise<LoyaltyCard | null>;
  findByBusinessAndUser(
    businessId: string,
    userId: string,
  ): Promise<LoyaltyCard | null>;
  findByBusinessId(businessId: string): Promise<LoyaltyCard[]>;
  findByUserId(userId: string): Promise<LoyaltyCard[]>;
  update(id: string, data: Partial<LoyaltyCard>): Promise<LoyaltyCard | null>;
  addPoints(id: string, points: number): Promise<LoyaltyCard | null>;
  delete(id: string): Promise<boolean>;
}

// Database interface - aggregates all repositories
export interface IDatabase {
  users: IUserRepository;
  nfcBusinessProfiles: INfcBusinessRepository;
  loyaltyBusinesses: ILoyaltyBusinessRepository;
  loyaltyCards: ILoyaltyCardRepository;
}

// In-memory implementations for development (without real database)
class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();
  private nextId = 1;

  async create(
    user: Omit<User, "id" | "createdAt" | "updatedAt">,
  ): Promise<User> {
    const id = `user_${this.nextId++}`;
    const fullUser: User = {
      ...user,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, fullUser);
    return fullUser;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...data, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async list(limit = 10, offset = 0): Promise<User[]> {
    return Array.from(this.users.values()).slice(offset, offset + limit);
  }

  async count(): Promise<number> {
    return this.users.size;
  }
}

class InMemoryNfcBusinessRepository implements INfcBusinessRepository {
  private profiles: Map<string, NfcBusinessProfile> = new Map();
  private nextId = 1;

  async create(
    profile: Omit<NfcBusinessProfile, "id" | "createdAt" | "updatedAt">,
  ): Promise<NfcBusinessProfile> {
    const id = `nfc_${this.nextId++}`;
    const fullProfile: NfcBusinessProfile = {
      ...profile,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.profiles.set(id, fullProfile);
    return fullProfile;
  }

  async findById(id: string): Promise<NfcBusinessProfile | null> {
    return this.profiles.get(id) || null;
  }

  async findBySlug(slug: string): Promise<NfcBusinessProfile | null> {
    for (const profile of this.profiles.values()) {
      if (profile.slug === slug) return profile;
    }
    return null;
  }

  async findByUserId(userId: string): Promise<NfcBusinessProfile | null> {
    for (const profile of this.profiles.values()) {
      if (profile.userId === userId) return profile;
    }
    return null;
  }

  async update(
    id: string,
    data: Partial<NfcBusinessProfile>,
  ): Promise<NfcBusinessProfile | null> {
    const profile = this.profiles.get(id);
    if (!profile) return null;
    const updated = { ...profile, ...data, updatedAt: new Date() };
    this.profiles.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.profiles.delete(id);
  }

  async slugExists(slug: string): Promise<boolean> {
    for (const profile of this.profiles.values()) {
      if (profile.slug === slug) return true;
    }
    return false;
  }
}

class InMemoryLoyaltyBusinessRepository implements ILoyaltyBusinessRepository {
  private businesses: Map<string, LoyaltyBusiness> = new Map();
  private nextId = 1;

  async create(
    business: Omit<LoyaltyBusiness, "id" | "createdAt" | "updatedAt">,
  ): Promise<LoyaltyBusiness> {
    const id = `loyalty_biz_${this.nextId++}`;
    const fullBusiness: LoyaltyBusiness = {
      ...business,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.businesses.set(id, fullBusiness);
    return fullBusiness;
  }

  async findById(id: string): Promise<LoyaltyBusiness | null> {
    return this.businesses.get(id) || null;
  }

  async findBySlug(slug: string): Promise<LoyaltyBusiness | null> {
    for (const business of this.businesses.values()) {
      if (business.slug === slug) return business;
    }
    return null;
  }

  async findByUserId(userId: string): Promise<LoyaltyBusiness[]> {
    const results: LoyaltyBusiness[] = [];
    for (const business of this.businesses.values()) {
      if (business.userId === userId) results.push(business);
    }
    return results;
  }

  async update(
    id: string,
    data: Partial<LoyaltyBusiness>,
  ): Promise<LoyaltyBusiness | null> {
    const business = this.businesses.get(id);
    if (!business) return null;
    const updated = { ...business, ...data, updatedAt: new Date() };
    this.businesses.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.businesses.delete(id);
  }

  async slugExists(slug: string): Promise<boolean> {
    for (const business of this.businesses.values()) {
      if (business.slug === slug) return true;
    }
    return false;
  }
}

class InMemoryLoyaltyCardRepository implements ILoyaltyCardRepository {
  private cards: Map<string, LoyaltyCard> = new Map();
  private nextId = 1;

  async create(
    card: Omit<LoyaltyCard, "id" | "createdAt" | "updatedAt">,
  ): Promise<LoyaltyCard> {
    const id = `card_${this.nextId++}`;
    const fullCard: LoyaltyCard = {
      ...card,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cards.set(id, fullCard);
    return fullCard;
  }

  async findById(id: string): Promise<LoyaltyCard | null> {
    return this.cards.get(id) || null;
  }

  async findByBusinessAndUser(
    businessId: string,
    userId: string,
  ): Promise<LoyaltyCard | null> {
    for (const card of this.cards.values()) {
      if (card.businessId === businessId && card.userId === userId) return card;
    }
    return null;
  }

  async findByBusinessId(businessId: string): Promise<LoyaltyCard[]> {
    const results: LoyaltyCard[] = [];
    for (const card of this.cards.values()) {
      if (card.businessId === businessId) results.push(card);
    }
    return results;
  }

  async findByUserId(userId: string): Promise<LoyaltyCard[]> {
    const results: LoyaltyCard[] = [];
    for (const card of this.cards.values()) {
      if (card.userId === userId) results.push(card);
    }
    return results;
  }

  async update(
    id: string,
    data: Partial<LoyaltyCard>,
  ): Promise<LoyaltyCard | null> {
    const card = this.cards.get(id);
    if (!card) return null;
    const updated = { ...card, ...data, updatedAt: new Date() };
    this.cards.set(id, updated);
    return updated;
  }

  async addPoints(id: string, points: number): Promise<LoyaltyCard | null> {
    const card = this.cards.get(id);
    if (!card) return null;
    const updated = {
      ...card,
      points: card.points + points,
      updatedAt: new Date(),
    };
    this.cards.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.cards.delete(id);
  }
}

// Initialize the in-memory database
export class InMemoryDatabase implements IDatabase {
  users: IUserRepository;
  nfcBusinessProfiles: INfcBusinessRepository;
  loyaltyBusinesses: ILoyaltyBusinessRepository;
  loyaltyCards: ILoyaltyCardRepository;

  constructor() {
    this.users = new InMemoryUserRepository();
    this.nfcBusinessProfiles = new InMemoryNfcBusinessRepository();
    this.loyaltyBusinesses = new InMemoryLoyaltyBusinessRepository();
    this.loyaltyCards = new InMemoryLoyaltyCardRepository();
  }
}

// Global database instance
let dbInstance: IDatabase | null = null;

export function getDatabase(): IDatabase {
  if (!dbInstance) {
    // For now, using in-memory database. Replace with real database when ready
    // dbInstance = new PostgresDatabase();
    // dbInstance = new MongoDatabase();
    dbInstance = new InMemoryDatabase();
  }
  return dbInstance;
}

export function setDatabase(db: IDatabase): void {
  dbInstance = db;
}
