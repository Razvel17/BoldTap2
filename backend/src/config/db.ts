// Database initialization
// This file exports the database instance used throughout the application
// It's configured to use in-memory storage by default
// To use a real database (PostgreSQL, MongoDB, etc.), import and initialize it here

import { getDatabase } from "../lib/database";

// Export the database instance
export const db = getDatabase();

// Legacy export for backward compatibility
export const users = [];
