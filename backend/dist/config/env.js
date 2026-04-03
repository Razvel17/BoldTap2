"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMIT_AUTH_MAX_REQUESTS = exports.RATE_LIMIT_MAX_REQUESTS = exports.RATE_LIMIT_WINDOW_MS = exports.AIRTEL_MONEY_BUSINESS_ID = exports.AIRTEL_MONEY_API_KEY = exports.AIRTEL_MONEY_STATUS_URL = exports.AIRTEL_MONEY_API_URL = exports.YAS_BUSINESS_ID = exports.YAS_API_KEY = exports.YAS_STATUS_URL = exports.YAS_API_URL = exports.MPESA_BUSINESS_ID = exports.MPESA_API_KEY = exports.MPESA_STATUS_URL = exports.MPESA_API_URL = exports.STRIPE_PRICE_ENTERPRISE = exports.STRIPE_PRICE_PRO = exports.STRIPE_PRICE_STARTER = exports.STRIPE_WEBHOOK_SECRET = exports.STRIPE_PUBLISHABLE_KEY = exports.STRIPE_SECRET_KEY = exports.GITHUB_CALLBACK_URL = exports.GITHUB_CLIENT_SECRET = exports.GITHUB_CLIENT_ID = exports.GOOGLE_CALLBACK_URL = exports.GOOGLE_CLIENT_SECRET = exports.GOOGLE_CLIENT_ID = exports.FRONTEND_VERIFY_EMAIL_URL = exports.FRONTEND_RESET_PASSWORD_URL = exports.SMTP_FROM_NAME = exports.SMTP_FROM_EMAIL = exports.SENDGRID_API_KEY = exports.EMAIL_PROVIDER = exports.DATABASE_URL = exports.DATABASE_PASSWORD = exports.DATABASE_USER = exports.DATABASE_NAME = exports.DATABASE_PORT = exports.DATABASE_HOST = exports.DATABASE_TYPE = exports.BACKEND_URL = exports.FRONTEND_URL = exports.JWT_ALGORITHM = exports.REFRESH_TOKEN_EXPIRY = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.NODE_ENV = exports.PORT = void 0;
// Environment Variables Configuration
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config();
exports.PORT = parseInt(process.env.PORT || "3001", 10);
exports.NODE_ENV = process.env.NODE_ENV || "development";
// Generate a secure default for development only
const getDefaultJwtSecret = () => {
    if (exports.NODE_ENV === "production") {
        return "";
    }
    // Generate a cryptographically secure random string for dev
    return crypto_1.default.randomBytes(64).toString("hex");
};
exports.JWT_SECRET = process.env.JWT_SECRET || getDefaultJwtSecret();
if (!exports.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required. Set it in your .env file or generate one: openssl rand -hex 64");
}
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
exports.REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";
// Security: Use stronger JWT algorithm
exports.JWT_ALGORITHM = "HS256";
exports.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
exports.BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
// Database configuration (PostgreSQL)
exports.DATABASE_TYPE = process.env.DATABASE_TYPE || "postgres";
exports.DATABASE_HOST = process.env.DATABASE_HOST || "localhost";
exports.DATABASE_PORT = parseInt(process.env.DATABASE_PORT || "5432", 10);
exports.DATABASE_NAME = process.env.DATABASE_NAME || "boldtap";
exports.DATABASE_USER = process.env.DATABASE_USER || "postgres";
exports.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || "postgres";
exports.DATABASE_URL = process.env.DATABASE_URL ||
    `postgresql://${exports.DATABASE_USER}:${exports.DATABASE_PASSWORD}@${exports.DATABASE_HOST}:${exports.DATABASE_PORT}/${exports.DATABASE_NAME}`;
// Email Configuration (SendGrid)
exports.EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "sendgrid";
exports.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
exports.SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || "noreply@boldtap.com";
exports.SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || "BoldTap";
// Frontend URLs for email links
exports.FRONTEND_RESET_PASSWORD_URL = process.env.FRONTEND_RESET_PASSWORD_URL ||
    `${exports.FRONTEND_URL}/auth/reset-password`;
exports.FRONTEND_VERIFY_EMAIL_URL = process.env.FRONTEND_VERIFY_EMAIL_URL ||
    `${exports.FRONTEND_URL}/auth/verify-email`;
// OAuth Configuration - Google
exports.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
exports.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
exports.GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL ||
    `${exports.BACKEND_URL}/auth/google/callback`;
// OAuth Configuration - GitHub
exports.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
exports.GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
exports.GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL ||
    `${exports.BACKEND_URL}/auth/github/callback`;
// Stripe Configuration
exports.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
exports.STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || "";
exports.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
// Stripe Pricing IDs
exports.STRIPE_PRICE_STARTER = process.env.STRIPE_PRICE_STARTER || "";
exports.STRIPE_PRICE_PRO = process.env.STRIPE_PRICE_PRO || "";
exports.STRIPE_PRICE_ENTERPRISE = process.env.STRIPE_PRICE_ENTERPRISE || "";
// Mobile Money Provider Configuration
exports.MPESA_API_URL = process.env.MPESA_API_URL || "";
exports.MPESA_STATUS_URL = process.env.MPESA_STATUS_URL || "";
exports.MPESA_API_KEY = process.env.MPESA_API_KEY || "";
exports.MPESA_BUSINESS_ID = process.env.MPESA_BUSINESS_ID || "";
exports.YAS_API_URL = process.env.YAS_API_URL || "";
exports.YAS_STATUS_URL = process.env.YAS_STATUS_URL || "";
exports.YAS_API_KEY = process.env.YAS_API_KEY || "";
exports.YAS_BUSINESS_ID = process.env.YAS_BUSINESS_ID || "";
exports.AIRTEL_MONEY_API_URL = process.env.AIRTEL_MONEY_API_URL || "";
exports.AIRTEL_MONEY_STATUS_URL = process.env.AIRTEL_MONEY_STATUS_URL || "";
exports.AIRTEL_MONEY_API_KEY = process.env.AIRTEL_MONEY_API_KEY || "";
exports.AIRTEL_MONEY_BUSINESS_ID = process.env.AIRTEL_MONEY_BUSINESS_ID || "";
// Rate limiting configuration
exports.RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", // 15 minutes
10);
exports.RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10);
exports.RATE_LIMIT_AUTH_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS || "12", 10); // increased from 5 to 12 to reduce false 'too many requests' on first-time registration
// Validation
if (exports.NODE_ENV === "production" && !process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required in production mode. Generate one: openssl rand -hex 64");
}
//# sourceMappingURL=env.js.map