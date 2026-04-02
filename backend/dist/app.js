"use strict";
// Express application setup
// Configures middleware, CORS, routes, and error handling
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const errors_1 = require("./utils/errors");
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const loyaltyCardRoutes_1 = __importDefault(require("./routes/loyaltyCardRoutes"));
const nfcBusinessRoutes_1 = __importDefault(require("./routes/nfcBusinessRoutes"));
const app = (0, express_1.default)();
// ============ MIDDLEWARE ============
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
const corsOptions = {
    origin: env_1.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cors_1.default)(corsOptions));
// Body parsing middleware
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ limit: "10mb", extended: true }));
// Request logging middleware (development)
if (env_1.NODE_ENV === "development") {
    app.use((_req, _res, next) => {
        console.log(`[${new Date().toISOString()}] ${_req.method} ${_req.path}`);
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
app.use("/auth", authRoutes_1.default);
app.use("/api/loyalty", loyaltyCardRoutes_1.default);
app.use("/api/nfc", nfcBusinessRoutes_1.default);
// Version endpoint
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