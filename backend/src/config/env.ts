// Environment Variables Configuration
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

export const PORT = parseInt(process.env.PORT || "3001", 10);
export const NODE_ENV = process.env.NODE_ENV || "development";

// Generate a secure default for development only
const getDefaultJwtSecret = () => {
  if (NODE_ENV === "production") {
    return "";
  }
  // Generate a cryptographically secure random string for dev
  return crypto.randomBytes(64).toString("hex");
};

export const JWT_SECRET = process.env.JWT_SECRET || getDefaultJwtSecret();

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required. Set it in your .env file or generate one: openssl rand -hex 64",
  );
}

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// Security: Use stronger JWT algorithm
export const JWT_ALGORITHM = "HS256";

export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

// Database configuration
export const DATABASE_URL = process.env.DATABASE_URL || "sqlite:./dev.db";
export const DATABASE_TYPE = process.env.DATABASE_TYPE || "in-memory";

// Rate limiting configuration
export const RATE_LIMIT_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS || "900000", // 15 minutes
  10,
);
export const RATE_LIMIT_MAX_REQUESTS = parseInt(
  process.env.RATE_LIMIT_MAX_REQUESTS || "100",
  10,
);
export const RATE_LIMIT_AUTH_MAX_REQUESTS = parseInt(
  process.env.RATE_LIMIT_AUTH_MAX_REQUESTS || "12",
  10,
); // increased from 5 to 12 to reduce false 'too many requests' on first-time registration

// Validation
if (NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required in production mode. Generate one: openssl rand -hex 64",
  );
}
