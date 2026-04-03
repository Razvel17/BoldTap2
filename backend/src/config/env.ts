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

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

// Security: Use stronger JWT algorithm
export const JWT_ALGORITHM = "HS256";

export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

// Database configuration (PostgreSQL)
export const DATABASE_TYPE = process.env.DATABASE_TYPE || "postgres";
export const DATABASE_HOST = process.env.DATABASE_HOST || "localhost";
export const DATABASE_PORT = parseInt(process.env.DATABASE_PORT || "5432", 10);
export const DATABASE_NAME = process.env.DATABASE_NAME || "boldtap";
export const DATABASE_USER = process.env.DATABASE_USER || "postgres";
export const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || "postgres";
export const DATABASE_URL = process.env.DATABASE_URL ||
  `postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`;

// Email Configuration (SendGrid)
export const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "sendgrid";
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
export const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || "noreply@boldtap.com";
export const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || "BoldTap";

// Frontend URLs for email links
export const FRONTEND_RESET_PASSWORD_URL = process.env.FRONTEND_RESET_PASSWORD_URL ||
  `${FRONTEND_URL}/auth/reset-password`;
export const FRONTEND_VERIFY_EMAIL_URL = process.env.FRONTEND_VERIFY_EMAIL_URL ||
  `${FRONTEND_URL}/auth/verify-email`;

// OAuth Configuration - Google
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL ||
  `${BACKEND_URL}/auth/google/callback`;

// OAuth Configuration - GitHub
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
export const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL ||
  `${BACKEND_URL}/auth/github/callback`;

// Stripe Configuration
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

// Stripe Pricing IDs
export const STRIPE_PRICE_STARTER = process.env.STRIPE_PRICE_STARTER || "";
export const STRIPE_PRICE_PRO = process.env.STRIPE_PRICE_PRO || "";
export const STRIPE_PRICE_ENTERPRISE = process.env.STRIPE_PRICE_ENTERPRISE || "";

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

