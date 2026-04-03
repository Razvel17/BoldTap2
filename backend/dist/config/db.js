"use strict";
// Database initialization and export
// This file initializes the PostgreSQL database connection via TypeORM
// and exports the database instance used throughout the application
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initializeDb = initializeDb;
exports.cleanupDb = cleanupDb;
require("reflect-metadata");
const database_1 = require("./database");
const PostgresUserRepository_1 = require("../repositories/PostgresUserRepository");
const User_1 = require("../entities/User");
const database_2 = require("../lib/database");
// PostgreSQL-backed database wrapper
class PostgresDatabase {
    constructor() {
        // Initialize PostgreSQL repositories
        this.users = new PostgresUserRepository_1.PostgresUserRepository(database_1.AppDataSource.getRepository(User_1.User));
        // For now, use in-memory implementations for NFC/Loyalty features until they're migrated
        const inMemDb = new database_2.InMemoryDatabase();
        this.nfcBusinessProfiles = inMemDb.nfcBusinessProfiles;
        this.loyaltyBusinesses = inMemDb.loyaltyBusinesses;
        this.loyaltyCards = inMemDb.loyaltyCards;
    }
}
// Global database instance - initialized lazily
let dbInstance = null;
// Get or initialize database
const dbModule = {
    get instance() {
        if (!dbInstance) {
            dbInstance = new PostgresDatabase();
        }
        return dbInstance;
    },
};
// Export as both default and named - support old code that does `import { db }` or `import db`
exports.db = dbModule.instance;
exports.default = exports.db;
// Async initialization function called from server.ts
async function initializeDb() {
    try {
        if (!database_1.AppDataSource.isInitialized) {
            await database_1.AppDataSource.initialize();
            console.log("✓ Database connection established");
            // Ensure db instance is created
            void dbModule.instance;
        }
    }
    catch (error) {
        console.warn("⚠ Database connection failed, falling back to in-memory:", error.message);
        // Fall back entirely to in-memory database
        if (!dbInstance) {
            dbInstance = new database_2.InMemoryDatabase();
        }
    }
}
// Cleanup function
async function cleanupDb() {
    try {
        if (database_1.AppDataSource.isInitialized) {
            await database_1.AppDataSource.destroy();
            console.log("✓ Database connection closed");
        }
    }
    catch (error) {
        console.error("✗ Error closing database:", error);
    }
}
//# sourceMappingURL=db.js.map