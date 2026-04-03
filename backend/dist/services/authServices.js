"use strict";
// Authentication services
// Handles business logic for registration, login, and user management
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getUserById = getUserById;
exports.updateProfile = updateProfile;
exports.changePassword = changePassword;
exports.verifyToken = verifyToken;
exports.generateTokenForExport = generateTokenForExport;
exports.emailExists = emailExists;
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const cache_1 = require("../utils/cache");
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
        // Hash password with secure salt rounds
        const { default: bcrypt } = await Promise.resolve().then(() => __importStar(require("bcrypt")));
        const hashedPassword = await bcrypt.hash(input.password, errors_1.BCRYPT_SALT_ROUNDS);
        // Create user
        const user = await db_1.db.users.create({
            name: input.name,
            email: input.email,
            phone: input.phone,
            password: hashedPassword,
        });
        // Generate token
        const token = await generateToken({
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
        const { default: bcrypt } = await Promise.resolve().then(() => __importStar(require("bcrypt")));
        const passwordMatch = await bcrypt.compare(input.password, user.password);
        if (!passwordMatch) {
            return {
                success: false,
                error: "Invalid email or password",
            };
        }
        // Generate token
        const token = await generateToken({
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
        const cacheKey = `user:${userId}`;
        const cached = cache_1.cache.get(cacheKey);
        if (cached)
            return cached;
        const user = await db_1.db.users.findById(userId);
        if (!user)
            return null;
        const profile = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
        };
        cache_1.cache.set(cacheKey, profile);
        return profile;
    }
    catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}
// Update user profile
async function updateProfile(userId, data) {
    try {
        const updates = {};
        if (data.name !== undefined) {
            updates.name = data.name;
        }
        if (data.phone !== undefined) {
            updates.phone = data.phone;
        }
        const updated = Object.keys(updates).length > 0
            ? await db_1.db.users.update(userId, updates)
            : await db_1.db.users.findById(userId);
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
        const { default: bcrypt } = await Promise.resolve().then(() => __importStar(require("bcrypt")));
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) {
            return { success: false, error: "Incorrect current password" };
        }
        // Validate new password
        const validation = (0, errors_1.validatePassword)(newPassword);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }
        // Hash and save new password with secure salt rounds
        const hashedPassword = await bcrypt.hash(newPassword, errors_1.BCRYPT_SALT_ROUNDS);
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
async function verifyToken(token) {
    try {
        const { default: jwt } = await Promise.resolve().then(() => __importStar(require("jsonwebtoken")));
        const decoded = jwt.verify(token, env_1.JWT_SECRET);
        return decoded;
    }
    catch {
        return null;
    }
}
// Generate JWT token (exported for use in other services)
async function generateTokenForExport(data) {
    const { default: jwt } = await Promise.resolve().then(() => __importStar(require("jsonwebtoken")));
    return jwt.sign(data, env_1.JWT_SECRET, {
        expiresIn: env_1.JWT_EXPIRES_IN,
        algorithm: env_1.JWT_ALGORITHM,
    });
}
// Generate JWT token
async function generateToken(data) {
    return generateTokenForExport(data);
}
// Check if email exists
async function emailExists(email) {
    const user = await db_1.db.users.findByEmail(email);
    return !!user;
}
//# sourceMappingURL=authServices.js.map