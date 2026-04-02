"use strict";
// Error handling and response utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
exports.sendCreated = sendCreated;
exports.sendNoContent = sendNoContent;
exports.sendPaginated = sendPaginated;
exports.validateRequiredFields = validateRequiredFields;
exports.validateEmail = validateEmail;
exports.validatePassword = validatePassword;
class AppError extends Error {
    constructor(statusCode, message, code = "INTERNAL_ERROR") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = "AppError";
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message) {
        super(400, message, "VALIDATION_ERROR");
        this.name = "ValidationError";
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = "Authentication required") {
        super(401, message, "AUTHENTICATION_ERROR");
        this.name = "AuthenticationError";
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = "Access denied") {
        super(403, message, "AUTHORIZATION_ERROR");
        this.name = "AuthorizationError";
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(resource) {
        super(404, `${resource} not found`, "NOT_FOUND");
        this.name = "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message) {
        super(409, message, "CONFLICT");
        this.name = "ConflictError";
    }
}
exports.ConflictError = ConflictError;
// Response helpers
function sendSuccess(res, data, message = "Success", statusCode = 200) {
    const response = {
        success: true,
        data,
        message,
    };
    return res.status(statusCode).json(response);
}
function sendError(res, error, statusCode = 500) {
    if (error instanceof AppError) {
        const response = {
            success: false,
            error: error.message,
            message: error.message,
        };
        return res.status(error.statusCode).json(response);
    }
    if (typeof error === "string") {
        const response = {
            success: false,
            error,
            message: error,
        };
        return res.status(statusCode).json(response);
    }
    const response = {
        success: false,
        error: error.message || "Internal server error",
        message: error.message || "Internal server error",
    };
    return res.status(statusCode).json(response);
}
function sendCreated(res, data, message = "Resource created") {
    return sendSuccess(res, data, message, 201);
}
function sendNoContent(res) {
    return res.status(204).send();
}
function sendPaginated(res, data, total, page, limit, statusCode = 200) {
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
function validateRequiredFields(data, fields) {
    const missing = fields.filter((field) => !data[field]);
    if (missing.length > 0) {
        return new ValidationError(`Missing required fields: ${missing.join(", ")}`);
    }
    return null;
}
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function validatePassword(password) {
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
//# sourceMappingURL=errors.js.map