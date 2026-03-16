// JWT authentication middleware for Express.js. This middleware checks for a valid JWT token in the Authorization header of incoming requests and verifies it. If the token is valid, it attaches the decoded user information to the request object and allows the request to proceed. If the token is missing or invalid, it responds with a 401 Unauthorized error.
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { users } from "../config/db";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ success: false, error: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ success: false, error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as {
      userId: string;
      email: string;
    };
    const user = users.find((u) => u.id === decoded.userId);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    (req as any).user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
}
