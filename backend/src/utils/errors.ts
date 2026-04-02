// Error handling and response utilities

import type { Response } from "express";
import type { ApiResponse } from "../types/index";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = "INTERNAL_ERROR",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(401, message, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(403, message, "AUTHORIZATION_ERROR");
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, "CONFLICT");
    this.name = "ConflictError";
  }
}

// Response helpers
export function sendSuccess<T = any>(
  res: Response,
  data?: T,
  message: string = "Success",
  statusCode: number = 200,
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  error: Error | AppError | string,
  statusCode: number = 500,
): Response {
  if (error instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: error.message,
      message: error.message,
    };
    return res.status(error.statusCode).json(response);
  }

  if (typeof error === "string") {
    const response: ApiResponse = {
      success: false,
      error,
      message: error,
    };
    return res.status(statusCode).json(response);
  }

  const response: ApiResponse = {
    success: false,
    error: error.message || "Internal server error",
    message: error.message || "Internal server error",
  };
  return res.status(statusCode).json(response);
}

export function sendCreated<T = any>(
  res: Response,
  data: T,
  message: string = "Resource created",
): Response {
  return sendSuccess(res, data, message, 201);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  statusCode: number = 200,
): Response {
  const response = {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
  return res.status(statusCode).json(response);
}

// Request validation helper
export function validateRequiredFields(
  data: Record<string, any>,
  fields: string[],
): ValidationError | null {
  const missing = fields.filter((field) => !data[field]);
  if (missing.length > 0) {
    return new ValidationError(
      `Missing required fields: ${missing.join(", ")}`,
    );
  }
  return null;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (password.length < 8) {
    return {
      valid: false,
      error: "Password must be at least 8 characters long",
    };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one letter",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one digit",
    };
  }
  return { valid: true };
}
