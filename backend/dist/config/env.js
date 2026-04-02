"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATABASE_TYPE = exports.DATABASE_URL = exports.BACKEND_URL = exports.FRONTEND_URL = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.NODE_ENV = exports.PORT = void 0;
// Environment Variables Configuration
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = parseInt(process.env.PORT || "3001", 10);
exports.NODE_ENV = process.env.NODE_ENV || "development";
exports.JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
exports.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
exports.BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
// Database configuration (when you add a real database)
exports.DATABASE_URL = process.env.DATABASE_URL || "sqlite:./dev.db";
exports.DATABASE_TYPE = process.env.DATABASE_TYPE || "in-memory"; // in-memory, postgres, mongodb
// Validation
if (!process.env.JWT_SECRET && exports.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production mode");
}
//# sourceMappingURL=env.js.map