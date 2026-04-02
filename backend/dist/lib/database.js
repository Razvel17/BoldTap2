"use strict";
// Database abstraction layer with repository pattern
// This allows easy switching between in-memory storage and real database
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryDatabase = void 0;
exports.getDatabase = getDatabase;
exports.setDatabase = setDatabase;
// In-memory implementations for development (without real database)
class InMemoryUserRepository {
    constructor() {
        this.users = new Map();
        this.nextId = 1;
    }
    async create(user) {
        const id = `user_${this.nextId++}`;
        const fullUser = {
            ...user,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(id, fullUser);
        return fullUser;
    }
    async findById(id) {
        return this.users.get(id) || null;
    }
    async findByEmail(email) {
        for (const user of this.users.values()) {
            if (user.email === email)
                return user;
        }
        return null;
    }
    async update(id, data) {
        const user = this.users.get(id);
        if (!user)
            return null;
        const updated = { ...user, ...data, updatedAt: new Date() };
        this.users.set(id, updated);
        return updated;
    }
    async delete(id) {
        return this.users.delete(id);
    }
    async list(limit = 10, offset = 0) {
        return Array.from(this.users.values()).slice(offset, offset + limit);
    }
    async count() {
        return this.users.size;
    }
}
class InMemoryNfcBusinessRepository {
    constructor() {
        this.profiles = new Map();
        this.nextId = 1;
    }
    async create(profile) {
        const id = `nfc_${this.nextId++}`;
        const fullProfile = {
            ...profile,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.profiles.set(id, fullProfile);
        return fullProfile;
    }
    async findById(id) {
        return this.profiles.get(id) || null;
    }
    async findBySlug(slug) {
        for (const profile of this.profiles.values()) {
            if (profile.slug === slug)
                return profile;
        }
        return null;
    }
    async findByUserId(userId) {
        for (const profile of this.profiles.values()) {
            if (profile.userId === userId)
                return profile;
        }
        return null;
    }
    async update(id, data) {
        const profile = this.profiles.get(id);
        if (!profile)
            return null;
        const updated = { ...profile, ...data, updatedAt: new Date() };
        this.profiles.set(id, updated);
        return updated;
    }
    async delete(id) {
        return this.profiles.delete(id);
    }
    async slugExists(slug) {
        for (const profile of this.profiles.values()) {
            if (profile.slug === slug)
                return true;
        }
        return false;
    }
}
class InMemoryLoyaltyBusinessRepository {
    constructor() {
        this.businesses = new Map();
        this.nextId = 1;
    }
    async create(business) {
        const id = `loyalty_biz_${this.nextId++}`;
        const fullBusiness = {
            ...business,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.businesses.set(id, fullBusiness);
        return fullBusiness;
    }
    async findById(id) {
        return this.businesses.get(id) || null;
    }
    async findBySlug(slug) {
        for (const business of this.businesses.values()) {
            if (business.slug === slug)
                return business;
        }
        return null;
    }
    async findByUserId(userId) {
        const results = [];
        for (const business of this.businesses.values()) {
            if (business.userId === userId)
                results.push(business);
        }
        return results;
    }
    async update(id, data) {
        const business = this.businesses.get(id);
        if (!business)
            return null;
        const updated = { ...business, ...data, updatedAt: new Date() };
        this.businesses.set(id, updated);
        return updated;
    }
    async delete(id) {
        return this.businesses.delete(id);
    }
    async slugExists(slug) {
        for (const business of this.businesses.values()) {
            if (business.slug === slug)
                return true;
        }
        return false;
    }
}
class InMemoryLoyaltyCardRepository {
    constructor() {
        this.cards = new Map();
        this.nextId = 1;
    }
    async create(card) {
        const id = `card_${this.nextId++}`;
        const fullCard = {
            ...card,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.cards.set(id, fullCard);
        return fullCard;
    }
    async findById(id) {
        return this.cards.get(id) || null;
    }
    async findByBusinessAndUser(businessId, userId) {
        for (const card of this.cards.values()) {
            if (card.businessId === businessId && card.userId === userId)
                return card;
        }
        return null;
    }
    async findByBusinessId(businessId) {
        const results = [];
        for (const card of this.cards.values()) {
            if (card.businessId === businessId)
                results.push(card);
        }
        return results;
    }
    async findByUserId(userId) {
        const results = [];
        for (const card of this.cards.values()) {
            if (card.userId === userId)
                results.push(card);
        }
        return results;
    }
    async update(id, data) {
        const card = this.cards.get(id);
        if (!card)
            return null;
        const updated = { ...card, ...data, updatedAt: new Date() };
        this.cards.set(id, updated);
        return updated;
    }
    async addPoints(id, points) {
        const card = this.cards.get(id);
        if (!card)
            return null;
        const updated = {
            ...card,
            points: card.points + points,
            updatedAt: new Date(),
        };
        this.cards.set(id, updated);
        return updated;
    }
    async delete(id) {
        return this.cards.delete(id);
    }
}
// Initialize the in-memory database
class InMemoryDatabase {
    constructor() {
        this.users = new InMemoryUserRepository();
        this.nfcBusinessProfiles = new InMemoryNfcBusinessRepository();
        this.loyaltyBusinesses = new InMemoryLoyaltyBusinessRepository();
        this.loyaltyCards = new InMemoryLoyaltyCardRepository();
    }
}
exports.InMemoryDatabase = InMemoryDatabase;
// Global database instance
let dbInstance = null;
function getDatabase() {
    if (!dbInstance) {
        // For now, using in-memory database. Replace with real database when ready
        // dbInstance = new PostgresDatabase();
        // dbInstance = new MongoDatabase();
        dbInstance = new InMemoryDatabase();
    }
    return dbInstance;
}
function setDatabase(db) {
    dbInstance = db;
}
//# sourceMappingURL=database.js.map