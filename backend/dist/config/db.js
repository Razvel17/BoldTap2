"use strict";
// Database initialization
// This file exports the database instance used throughout the application
// It's configured to use in-memory storage by default
// To use a real database (PostgreSQL, MongoDB, etc.), import and initialize it here
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = exports.db = void 0;
const database_1 = require("../lib/database");
// Export the database instance
exports.db = (0, database_1.getDatabase)();
// Legacy export for backward compatibility
exports.users = [];
//# sourceMappingURL=db.js.map