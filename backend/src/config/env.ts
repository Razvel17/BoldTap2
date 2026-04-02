// Environment Variables Configuration
import dotenv from "dotenv";

dotenv.config();

export const PORT = parseInt(process.env.PORT || "3001", 10);
export const NODE_ENV = process.env.NODE_ENV || "development";
export const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

// Database configuration (when you add a real database)
export const DATABASE_URL = process.env.DATABASE_URL || "sqlite:./dev.db";
export const DATABASE_TYPE = process.env.DATABASE_TYPE || "in-memory"; // in-memory, postgres, mongodb

// Validation
if (!process.env.JWT_SECRET && NODE_ENV === "production") {
  throw new Error(
    "JWT_SECRET environment variable is required in production mode",
  );
}
