"use strict";
// Authentication services
// Handles business logic for registration, login, and user management
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getUserById = getUserById;
exports.updateProfile = updateProfile;
exports.changePassword = changePassword;
exports.verifyToken = verifyToken;
exports.emailExists = emailExists;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
// Register a new user
async function register(input) {
    try {
        // Validate input
        if (!input.name || !input.email || !input.password) {
            return {
                success: false,
                error: "Name, email, and password are required",
            };
        }
        // Validate email format
        if (!(0, errors_1.validateEmail)(input.email)) {
            return {
                success: false,
                error: "Invalid email format",
            };
        }
        // Validate password strength
        const passwordValidation = (0, errors_1.validatePassword)(input.password);
        if (!passwordValidation.valid) {
            return {
                success: false,
                error: passwordValidation.error,
            };
        }
        // Check if user already exists
        const existingUser = await db_1.db.users.findByEmail(input.email);
        if (existingUser) {
            return {
                success: false,
                error: "Email already registered",
            };
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(input.password, 10);
        // Create user
        const user = await db_1.db.users.create({
            name: input.name,
            email: input.email,
            phone: input.phone,
            password: hashedPassword,
        });
        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
        });
        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
            token,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Registration failed",
        };
    }
}
// Login user
async function login(input) {
    try {
        // Validate input
        if (!input.email || !input.password) {
            return {
                success: false,
                error: "Email and password are required",
            };
        }
        // Find user by email
        const user = await db_1.db.users.findByEmail(input.email);
        if (!user) {
            return {
                success: false,
                error: "Invalid email or password",
            };
        }
        // Compare passwords
        const passwordMatch = await bcrypt_1.default.compare(input.password, user.password);
        if (!passwordMatch) {
            return {
                success: false,
                error: "Invalid email or password",
            };
        }
        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
        });
        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
            token,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Login failed",
        };
    }
}
// Get user by ID
async function getUserById(userId) {
    try {
        const user = await db_1.db.users.findById(userId);
        if (!user)
            return null;
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
        };
    }
    catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}
// Update user profile
async function updateProfile(userId, data) {
    try {
        const updated = await db_1.db.users.update(userId, {
            name: data.name,
            phone: data.phone,
            password: "",
        });
        if (!updated) {
            return { success: false, error: "User not found" };
        }
        return {
            success: true,
            user: {
                id: updated.id,
                name: updated.name,
                email: updated.email,
                phone: updated.phone,
            },
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Update failed",
        };
    }
}
// Change password
async function changePassword(userId, oldPassword, newPassword) {
    try {
        // Find user
        const user = await db_1.db.users.findById(userId);
        if (!user) {
            return { success: false, error: "User not found" };
        }
        // Verify old password
        const passwordMatch = await bcrypt_1.default.compare(oldPassword, user.password);
        if (!passwordMatch) {
            return { success: false, error: "Incorrect current password" };
        }
        // Validate new password
        const validation = (0, errors_1.validatePassword)(newPassword);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }
        // Hash and save new password
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await db_1.db.users.update(userId, { password: hashedPassword });
        return { success: true };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Password change failed",
        };
    }
}
// Verify token
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.JWT_SECRET);
        return decoded;
    }
    catch {
        return null;
    }
}
// Generate JWT token
function generateToken(data) {
    return jsonwebtoken_1.default.sign(data, env_1.JWT_SECRET, { expiresIn: env_1.JWT_EXPIRES_IN });
}
// Check if email exists
async function emailExists(email) {
    const user = await db_1.db.users.findByEmail(email);
    return !!user;
}
//# sourceMappingURL=authServices.js.map