// Express application setup
// Configures middleware, CORS, routes, and error handling

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { FRONTEND_URL, NODE_ENV } from "./config/env";
import { sendError } from "./utils/errors";

// Routes
import authRoutes from "./routes/authRoutes";
import loyaltyCardRoutes from "./routes/loyaltyCardRoutes";
import nfcBusinessRoutes from "./routes/nfcBusinessRoutes";

const app = express();

// ============ MIDDLEWARE ============

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Request logging middleware (development)
if (NODE_ENV === "development") {
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${_req.method} ${_req.path}`);
    next();
  });
}

// ============ HEALTH CHECK ============
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============ API ROUTES ============
app.use("/auth", authRoutes);
app.use("/api/loyalty", loyaltyCardRoutes);
app.use("/api/nfc", nfcBusinessRoutes);

// Version endpoint
app.get("/version", (_req: Request, res: Response) => {
  res.json({
    version: "1.0.0",
    name: "BoldTap Backend API",
    environment: NODE_ENV,
  });
});

// API documentation endpoint
app.get("/api", (_req: Request, res: Response) => {
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
        getUserBusinesses:
          "GET /api/loyalty/user/businesses (requires authentication)",
        getBusinessBySlug: "GET /api/loyalty/business/:slug",
        createCard: "POST /api/loyalty/card (requires authentication)",
        getCard: "GET /api/loyalty/card/:cardId",
        getUserCards: "GET /api/loyalty/user/cards (requires authentication)",
        addPoints:
          "POST /api/loyalty/card/:cardId/points (requires authentication)",
        updateBusiness:
          "PUT /api/loyalty/business/:businessId (requires authentication)",
        deleteCard:
          "DELETE /api/loyalty/card/:cardId (requires authentication)",
      },
      nfc: {
        createProfile: "POST /api/nfc/profile (requires authentication)",
        getUserProfile: "GET /api/nfc/profile (requires authentication)",
        getProfileBySlug: "GET /api/nfc/profile/:slug",
        updateProfile:
          "PUT /api/nfc/profile/:profileId (requires authentication)",
        deleteProfile:
          "DELETE /api/nfc/profile/:profileId (requires authentication)",
        checkSlug: "GET /api/nfc/check-slug",
      },
    },
  });
});

// ============ 404 HANDLER ============
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `${_req.method} ${_req.path} not found`,
  });
});

// ============ ERROR HANDLING MIDDLEWARE ============
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  sendError(
    res,
    {
      name: err.name,
      message,
    },
    statusCode,
  );
});

export default app;
