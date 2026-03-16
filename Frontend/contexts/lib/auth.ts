// Authentication utility functions

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Validate password strength
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return {
      valid: false,
      error: "Password must be at least 8 characters long",
    };
  }

  // Check for at least one letter (character)
  if (!/[a-zA-Z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one letter",
    };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  return { valid: true };
}

// Register a new user
export async function register(
  name: string,
  email: string,
  phone: string,
  password: string
): Promise<AuthResponse> {
  await delay(1000); // Simulate API call

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return {
      success: false,
      error: passwordValidation.error,
    };
  }

  // Check if user already exists (in a real app, this would be a backend check)
  const existingUsers = JSON.parse(
    localStorage.getItem("users") || "[]"
  ) as Array<{ email: string }>;

  if (existingUsers.some((user) => user.email === email)) {
    return {
      success: false,
      error: "An account with this email already exists",
    };
  }

  // Create new user
  const newUser: User & { password: string } = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    password, // In production, this would be hashed
  };

  // Save user to localStorage (in production, this would be a backend API call)
  const users = [...existingUsers, newUser];
  localStorage.setItem("users", JSON.stringify(users));

  // Generate token (in production, this would come from backend)
  const token = btoa(JSON.stringify({ userId: newUser.id, email: newUser.email }));

  // Save token
  localStorage.setItem("authToken", token);
  localStorage.setItem("currentUser", JSON.stringify({ id: newUser.id, email: newUser.email, name: newUser.name, phone: newUser.phone }));

  return {
    success: true,
    user: { id: newUser.id, email: newUser.email, name: newUser.name, phone: newUser.phone },
    token,
  };
}

// Login user
export async function login(
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<AuthResponse> {
  await delay(1000); // Simulate API call

  // Get users from localStorage (in production, this would be a backend API call)(Data would be stored in a database and password would be hashed)
  const users = JSON.parse(
    localStorage.getItem("users") || "[]"
  ) as Array<User & { password: string }>;

  // Find user
  const user = users.find((u) => u.email === email);

  if (!user) {
    return {
      success: false,
      error: "Invalid email or password",
    };
  }

  // Check password (in production, this would be hashed comparison)
  if (user.password !== password) {
    return {
      success: false,
      error: "Invalid email or password",
    };
  }

  // Generate token
  const token = btoa(JSON.stringify({ userId: user.id, email: user.email }));

  // Save token
  if (rememberMe) {
    localStorage.setItem("authToken", token);
    localStorage.setItem("currentUser", JSON.stringify({ id: user.id, email: user.email, name: user.name, phone: user.phone }));
  } else {
    sessionStorage.setItem("authToken", token);
    sessionStorage.setItem("currentUser", JSON.stringify({ id: user.id, email: user.email, name: user.name, phone: user.phone }));
  }

  return {
    success: true,
    user: { id: user.id, email: user.email, name: user.name, phone: user.phone },
    token,
  };
}

// Logout user
export function logout(): void {
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("currentUser");
}

// Get current user
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  return !!token;
}

// Get auth token
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
}
