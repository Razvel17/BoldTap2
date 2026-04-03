"use strict";
// Express application setup
// Configures middleware, CORS, routes, and error handling
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata"); // TypeORM requires this at the top
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const env_1 = require("./config/env");
const errors_1 = require("./utils/errors");
const passport_2 = __importDefault(require("./config/passport"));
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const loyaltyCardRoutes_1 = __importDefault(require("./routes/loyaltyCardRoutes"));
const nfcBusinessRoutes_1 = __importDefault(require("./routes/nfcBusinessRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const app = (0, express_1.default)();
// ============ SECURITY MIDDLEWARE ============
// Security headers with helmet
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", env_1.FRONTEND_URL],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
// CORS configuration
const corsOptions = {
    origin: env_1.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: [
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
    ],
};
app.use((0, cors_1.default)(corsOptions));
// ============ RATE LIMITING ============
// General rate limiter
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.RATE_LIMIT_WINDOW_MS,
    max: env_1.RATE_LIMIT_MAX_REQUESTS,
    message: {
        success: false,
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(generalLimiter);
// Stricter rate limiter for auth endpoints
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.RATE_LIMIT_WINDOW_MS,
    max: env_1.RATE_LIMIT_AUTH_MAX_REQUESTS,
    message: {
        success: false,
        error: "Too many requests",
        message: "Too many authentication attempts. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count failed attempts too
});
// ============ BODY PARSING ============
// Body parsing middleware with size limits
app.use(express_1.default.json({
    limit: "10mb",
    strict: true, // Only accept arrays and objects
}));
app.use(express_1.default.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 50, // Limit number of parameters
}));
// ============ SESSION & OAUTH MIDDLEWARE ============
// Session middleware for OAuth
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: env_1.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
}));
// Passport middleware
passport_2.default;
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// ============ REQUEST LOGGING (DEV ONLY) ============
if (env_1.NODE_ENV === "development") {
    app.use((req, _res, next) => {
        const start = Date.now();
        _res.on("finish", () => {
            const duration = Date.now() - start;
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${_res.statusCode} - ${duration}ms`);
        });
        next();
    });
}
// ============ HEALTH CHECK ============
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// ============ API ROUTES ============
// Apply auth limiter to authentication routes
app.use("/auth", authLimiter, authRoutes_1.default);
app.use("/api/loyalty", loyaltyCardRoutes_1.default);
app.use("/api/nfc", nfcBusinessRoutes_1.default);
app.use("/api/payments", paymentRoutes_1.default);
app.use("/api/chat", chatRoutes_1.default);
// ============ VERSION & INFO ENDPOINTS ============
app.get("/version", (_req, res) => {
    res.json({
        version: "1.0.0",
        name: "BoldTap Backend API",
        environment: env_1.NODE_ENV,
    });
});
// API documentation endpoint
app.get("/api", (_req, res) => {
    res.json({
        name: "BoldTap Backend API",
        version: "1.0.0",
        endpoints: {
            auth: {
                register: "POST /auth/register",
                login: "POST /auth/login",
                logout: "POST /auth/logout",
                me: "GET /auth/me (requires authentication)",
                updateProfile: "PUT /auth/profile (requires authentication)",
                changePassword: "POST /auth/change-password (requires authentication)",
                checkEmail: "GET /auth/check-email",
            },
            loyalty: {
                createBusiness: "POST /api/loyalty/business (requires authentication)",
                getUserBusinesses: "GET /api/loyalty/user/businesses (requires authentication)",
                getBusinessBySlug: "GET /api/loyalty/business/:slug",
                createCard: "POST /api/loyalty/card (requires authentication)",
                getCard: "GET /api/loyalty/card/:cardId",
                getUserCards: "GET /api/loyalty/user/cards (requires authentication)",
                addPoints: "POST /api/loyalty/card/:cardId/points (requires authentication)",
                updateBusiness: "PUT /api/loyalty/business/:businessId (requires authentication)",
                deleteCard: "DELETE /api/loyalty/card/:cardId (requires authentication)",
            },
            nfc: {
                createProfile: "POST /api/nfc/profile (requires authentication)",
                getUserProfile: "GET /api/nfc/profile (requires authentication)",
                getProfileBySlug: "GET /api/nfc/profile/:slug",
                updateProfile: "PUT /api/nfc/profile/:profileId (requires authentication)",
                deleteProfile: "DELETE /api/nfc/profile/:profileId (requires authentication)",
                checkSlug: "GET /api/nfc/check-slug",
            },
            chat: {
                createConversation: "POST /api/chat/conversations (requires authentication)",
                listConversations: "GET /api/chat/conversations (requires authentication)",
                getMessages: "GET /api/chat/conversations/:conversationId/messages (requires authentication)",
                sendMessage: "POST /api/chat/conversations/:conversationId/messages (requires authentication)",
                editMessage: "PUT /api/chat/conversations/:conversationId/messages/:messageId (requires authentication)",
                deleteMessage: "DELETE /api/chat/conversations/:conversationId/messages/:messageId (requires authentication)",
                addParticipant: "POST /api/chat/conversations/:conversationId/participants (requires authentication)",
                leaveConversation: "DELETE /api/chat/conversations/:conversationId/leave (requires authentication)",
            },
        },
    });
});
// ============ 404 HANDLER ============
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
        message: `${_req.method} ${_req.path} not found`,
    });
});
// ============ ERROR HANDLING MIDDLEWARE ============
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    (0, errors_1.sendError)(res, {
        name: err.name,
        message,
    }, statusCode);
});
exports.default = app;
//# sourceMappingURL=app.js.map