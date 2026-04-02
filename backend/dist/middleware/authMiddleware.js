"use strict";
// JWT authentication middleware for Express.js
// This middleware checks for a valid JWT token in the Authorization header
// If the token is valid, it attaches the decoded user information to the request object
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new errors_1.AuthenticationError("No authorization header provided");
        }
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            throw new errors_1.AuthenticationError("Invalid authorization header format");
        }
        const token = parts[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.JWT_SECRET);
        // Verify user exists in database
        const user = await db_1.db.users.findById(decoded.userId);
        if (!user) {
            throw new errors_1.AuthenticationError("User not found");
        }
        // Attach user info to request
        req.user = {
            id: user.id,
            userId: user.id,
            email: user.email,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                error: "Invalid token",
                message: error.message,
            });
            return;
        }
        if (error instanceof errors_1.AuthenticationError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.message,
                message: error.message,
            });
            return;
        }
        res.status(401).json({
            success: false,
            error: "Authentication failed",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
}
// Optional: Verify user is admin or has certain role
function authorize(..._roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "No user information",
            });
            return;
        }
        // TODO: Implement role checking when user roles are added to schema
        next();
    };
}
//# sourceMappingURL=authMiddleware.js.map