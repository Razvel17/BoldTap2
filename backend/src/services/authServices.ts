// Authentication services
// Handles business logic for registration, login, and user management

import type jwt from "jsonwebtoken";
import { db } from "../config/db";
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_ALGORITHM } from "../config/env";
import {
  validatePassword,
  validateEmail,
  BCRYPT_SALT_ROUNDS,
} from "../utils/errors";
import { cache } from "../utils/cache";
import type { UserProfile } from "../types/index";

interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  token?: string;
  error?: string;
}

interface TokenData {
  userId: string;
  email: string;
}

// Register a new user
export async function register(input: RegisterInput): Promise<AuthResponse> {
  try {
    // Validate input
    if (!input.name || !input.email || !input.password) {
      return {
        success: false,
        error: "Name, email, and password are required",
      };
    }

    // Validate email format
    if (!validateEmail(input.email)) {
      return {
        success: false,
        error: "Invalid email format",
      };
    }

    // Validate password strength
    const passwordValidation = validatePassword(input.password);
    if (!passwordValidation.valid) {
      return {
        success: false,
        error: passwordValidation.error,
      };
    }

    // Check if user already exists
    const existingUser = await db.users.findByEmail(input.email);
    if (existingUser) {
      return {
        success: false,
        error: "Email already registered",
      };
    }

    // Hash password with secure salt rounds
    const { default: bcrypt } = await import("bcrypt");
    const hashedPassword = await bcrypt.hash(
      input.password,
      BCRYPT_SALT_ROUNDS,
    );

    // Create user
    const user = await db.users.create({
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
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    };
  }
}

// Login user
export async function login(input: LoginInput): Promise<AuthResponse> {
  try {
    // Validate input
    if (!input.email || !input.password) {
      return {
        success: false,
        error: "Email and password are required",
      };
    }

    // Find user by email
    const user = await db.users.findByEmail(input.email);
    if (!user) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Compare passwords
    const { default: bcrypt } = await import("bcrypt");
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
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failed",
    };
  }
}

// Get user by ID
export async function getUserById(userId: string): Promise<UserProfile | null> {
  try {
    const cacheKey = `user:${userId}`;
    const cached = cache.get<UserProfile>(cacheKey);
    if (cached) return cached;

    const user = await db.users.findById(userId);
    if (!user) return null;

    const profile: UserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    cache.set(cacheKey, profile);
    return profile;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

// Update user profile
export async function updateProfile(
  userId: string,
  data: { name?: string; phone?: string },
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const updates: { name?: string; phone?: string } = {};
    if (data.name !== undefined) {
      updates.name = data.name;
    }
    if (data.phone !== undefined) {
      updates.phone = data.phone;
    }

    const updated =
      Object.keys(updates).length > 0
        ? await db.users.update(userId, updates)
        : await db.users.findById(userId);

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
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}

// Change password
export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find user
    const user = await db.users.findById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify old password
    const { default: bcrypt } = await import("bcrypt");
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      return { success: false, error: "Incorrect current password" };
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Hash and save new password with secure salt rounds
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    await db.users.update(userId, { password: hashedPassword });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Password change failed",
    };
  }
}

// Verify token
export async function verifyToken(token: string): Promise<TokenData | null> {
  try {
    const { default: jwt } = await import("jsonwebtoken");
    const decoded = jwt.verify(token, JWT_SECRET) as TokenData;
    return decoded;
  } catch {
    return null;
  }
}

// Generate JWT token (exported for use in other services)
export async function generateTokenForExport(data: TokenData): Promise<string> {
  const { default: jwt } = await import("jsonwebtoken");
  return jwt.sign(
    data,
    JWT_SECRET as string,
    {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: JWT_ALGORITHM as jwt.Algorithm,
    } as jwt.SignOptions,
  );
}

// Generate JWT token
async function generateToken(data: TokenData): Promise<string> {
  return generateTokenForExport(data);
}

// Check if email exists
export async function emailExists(email: string): Promise<boolean> {
  const user = await db.users.findByEmail(email);
  return !!user;
}

