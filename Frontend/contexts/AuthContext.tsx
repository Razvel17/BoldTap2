"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  login as loginUser,
  register as registerUser,
  logout as logoutUser,
  getCurrentUser,
  isAuthenticated,
} from "@/contexts/lib/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await loginUser(email, password, rememberMe);
      if (response.success && response.user) {
        setUser(response.user);
        router.push("/dashboard");
        return { success: true };
      } else {
        return { success: false, error: response.error || "Login failed" };
      }
    } catch (error) {
      return { success: false, error: "An error occurred during login" };
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await registerUser(name, email, phone, password);
      if (response.success && response.user) {
        setUser(response.user);
        router.push("/dashboard");
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || "Registration failed",
        };
      }
    } catch (error) {
      return { success: false, error: "An error occurred during registration" };
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
