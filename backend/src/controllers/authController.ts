// Authentication Controller(handles registration and login logic(Register, LogIn and Logout, Get Current User, Update User Profile, Change Password, Forgot Password, Reset Password))
import type { Request, Response } from "express";
import * as authService from "../services/authServices";

export async function register(req: Request, res: Response) {
  const { name, email, phone, password } = req.body;
  const result = await authService.register(name, email, phone, password);
  res.status(result.success ? 200 : 400).json(result);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(result.success ? 200 : 400).json(result);
}

export async function logout(req: Request, res: Response) {
  // In JWT stateless auth, logout is handled client-side (delete token).
  res.json({ success: true, message: "Logged out" });
}

export async function getCurrentUser(req: Request, res: Response) {
  const user = (req as any).user;
  res.json({ success: true, user });
}
