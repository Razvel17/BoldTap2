// Database initialization and export
// This file initializes the PostgreSQL database connection via TypeORM
// and exports the database instance used throughout the application

import "reflect-metadata";
import { AppDataSource } from "./database";
import { PostgresUserRepository } from "../repositories/PostgresUserRepository";
import { User } from "../entities/User";
import { InMemoryDatabase } from "../lib/database";
import type { IDatabase, IUserRepository, INfcBusinessRepository, ILoyaltyBusinessRepository, ILoyaltyCardRepository } from "../lib/database";

// PostgreSQL-backed database wrapper
class PostgresDatabase implements IDatabase {
  users: IUserRepository;
  nfcBusinessProfiles: INfcBusinessRepository;
  loyaltyBusinesses: ILoyaltyBusinessRepository;
  loyaltyCards: ILoyaltyCardRepository;

  constructor() {
    // Initialize PostgreSQL repositories
    this.users = new PostgresUserRepository(AppDataSource.getRepository(User));

    // For now, use in-memory implementations for NFC/Loyalty features until they're migrated
    const inMemDb = new InMemoryDatabase();
    this.nfcBusinessProfiles = inMemDb.nfcBusinessProfiles;
    this.loyaltyBusinesses = inMemDb.loyaltyBusinesses;
    this.loyaltyCards = inMemDb.loyaltyCards;
  }
}

// Global database instance - initialized lazily
let dbInstance: IDatabase | null = null;

// Get or initialize database
const dbModule = {
  get instance(): IDatabase {
    if (!dbInstance) {
      dbInstance = new PostgresDatabase();
    }
    return dbInstance;
  },
};

// Export as both default and named - support old code that does `import { db }` or `import db`
export const db = dbModule.instance;

export default db;

// Async initialization function called from server.ts
export async function initializeDb() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✓ Database connection established");
      // Ensure db instance is created
      void dbModule.instance;
    }
  } catch (error) {
    console.warn("⚠ Database connection failed, falling back to in-memory:", (error as Error).message);
    // Fall back entirely to in-memory database
    if (!dbInstance) {
      dbInstance = new InMemoryDatabase();
    }
  }
}

// Cleanup function
export async function cleanupDb() {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("✓ Database connection closed");
    }
  } catch (error) {
    console.error("✗ Error closing database:", error);
  }
}


