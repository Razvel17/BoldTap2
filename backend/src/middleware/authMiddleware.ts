// JWT authentication middleware for Express.js
// This middleware checks for a valid JWT token in the Authorization header
// If the token is valid, it attaches the decoded user information to the request object

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { db } from "../config/db";
import { AuthenticationError } from "../utils/errors";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    userId: string;
  };
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError("No authorization header provided");
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new AuthenticationError("Invalid authorization header format");
    }

    const token = parts[1];

    const decoded = jwt.verify(token, JWT_SECRET) as unknown as {
      userId: string;
      email: string;
    };

    // Verify user exists in database
    const user = await db.users.findById(decoded.userId);
    if (!user) {
      throw new AuthenticationError("User not found");
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: "Invalid token",
        message: error.message,
      });
      return;
    }

    if (error instanceof AuthenticationError) {
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
export function authorize(..._roles: string[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
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
