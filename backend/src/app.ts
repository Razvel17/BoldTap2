// Express application setup
// Configures middleware, CORS, routes, and error handling

import "reflect-metadata"; // TypeORM requires this at the top
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import passport from "passport";
import {
  FRONTEND_URL,
  NODE_ENV,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_AUTH_MAX_REQUESTS,
} from "./config/env";
import { sendError } from "./utils/errors";
import "./config/passport";

// Routes
import authRoutes from "./routes/authRoutes";
import loyaltyCardRoutes from "./routes/loyaltyCardRoutes";
import nfcBusinessRoutes from "./routes/nfcBusinessRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import chatRoutes from "./routes/chatRoutes";

const app = express();

// ============ SECURITY MIDDLEWARE ============

// Security headers with helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", FRONTEND_URL],
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
  }),
);

// CORS configuration
const corsOptions = {
  origin: FRONTEND_URL,
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
app.use(cors(corsOptions));

// ============ RATE LIMITING ============

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
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
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_AUTH_MAX_REQUESTS,
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
app.use(
  express.json({
    limit: "10mb",
    strict: true, // Only accept arrays and objects
  }),
);
app.use(
  express.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 50, // Limit number of parameters
  }),
);

// ============ SESSION & OAUTH MIDDLEWARE ============

// Session middleware for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// ============ REQUEST LOGGING (DEV ONLY) ============

if (NODE_ENV === "development") {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const start = Date.now();
    _res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.path} ${_res.statusCode} - ${duration}ms`,
      );
    });
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

// Apply auth limiter to authentication routes
app.use("/auth", authLimiter, authRoutes);
app.use("/api/loyalty", loyaltyCardRoutes);
app.use("/api/nfc", nfcBusinessRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);

// ============ VERSION & INFO ENDPOINTS ============

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
      chat: {
        createConversation:
          "POST /api/chat/conversations (requires authentication)",
        listConversations:
          "GET /api/chat/conversations (requires authentication)",
        getMessages:
          "GET /api/chat/conversations/:conversationId/messages (requires authentication)",
        sendMessage:
          "POST /api/chat/conversations/:conversationId/messages (requires authentication)",
        editMessage:
          "PUT /api/chat/conversations/:conversationId/messages/:messageId (requires authentication)",
        deleteMessage:
          "DELETE /api/chat/conversations/:conversationId/messages/:messageId (requires authentication)",
        addParticipant:
          "POST /api/chat/conversations/:conversationId/participants (requires authentication)",
        leaveConversation:
          "DELETE /api/chat/conversations/:conversationId/leave (requires authentication)",
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
