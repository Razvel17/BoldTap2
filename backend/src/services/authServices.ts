// Business logic (hashing, token generation, etc.) for authentication (registration, login, logout, get current user, update user profile, change password, forgot password, reset password)
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { users } from "../config/db";
import type { User } from "../models/user";
import validatePassword from "../utils/validatePassword";
import { JWT_SECRET } from "../config/env";

export async function register(name: string, email: string, phone: string, password: string) {
  const validation = validatePassword(password);
  if (!validation.valid) return { success: false, error: validation.error };

  if (users.some((u) => u.email === email)) {
    return { success: false, error: "Email already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User = { id: Date.now().toString(), name, email, phone, password: hashedPassword };
  users.push(newUser);

  const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "1h" });

  return { success: true, user: { id: newUser.id, name, email: newUser.email, phone: newUser.phone }, token };
}

export async function login(email: string, password: string) {
  const user = users.find((u) => u.email === email);
  if (!user) return { success: false, error: "Invalid email or password" };

  const match = await bcrypt.compare(password, user.password);
  if (!match) return { success: false, error: "Invalid email or password" };

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

  return { success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone }, token };
}
