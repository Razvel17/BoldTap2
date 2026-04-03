// API Client for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Get auth token from storage
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  );
}

// Set auth token
export function setAuthToken(token: string, remember: boolean = false): void {
  if (typeof window === "undefined") return;
  if (remember) {
    localStorage.setItem("authToken", token);
  } else {
    sessionStorage.setItem("authToken", token);
  }
}

// Clear auth token
export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("authToken");
  sessionStorage.removeItem("authToken");
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  // Set content type for JSON
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Add authorization token if available
  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const isJsonResponse =
      response.status !== 204 &&
      response.headers.get("content-type")?.includes("application/json");
    const jsonData = isJsonResponse ? await response.json() : null;

    if (!response.ok) {
      return {
        success: false,
        error:
          jsonData?.error ||
          jsonData?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return {
      success: true,
      data: jsonData?.data !== undefined ? jsonData.data : jsonData,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Auth endpoints
export async function apiRegister(
  name: string,
  email: string,
  phone: string,
  password: string,
): Promise<ApiResponse<AuthResponse>> {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, phone, password }),
  });
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<ApiResponse<AuthResponse>> {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiLogout(): Promise<ApiResponse<null>> {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}

export async function apiGetCurrentUser(): Promise<ApiResponse<User>> {
  return apiRequest("/auth/me", {
    method: "GET",
  });
}

export async function apiUpdateProfile(
  data: Partial<User>,
): Promise<ApiResponse<User>> {
  return apiRequest("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function apiChangePassword(
  oldPassword: string,
  newPassword: string,
): Promise<ApiResponse<null>> {
  return apiRequest("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

// Loyalty Card endpoints with proper types
export async function apiCreateLoyaltyBusiness(
  businessName: string,
  slug: string,
  description?: string,
): Promise<ApiResponse<LoyaltyBusiness>> {
  return apiRequest("/api/loyalty/business", {
    method: "POST",
    body: JSON.stringify({ businessName, slug, description }),
  });
}

export async function apiGetUserLoyaltyBusinesses(): Promise<
  ApiResponse<LoyaltyBusiness[]>
> {
  return apiRequest("/api/loyalty/business", {
    method: "GET",
  });
}

export async function apiUpdateLoyaltyBusiness(
  businessId: string,
  updates: Partial<LoyaltyBusiness>,
): Promise<ApiResponse<LoyaltyBusiness>> {
  return apiRequest(`/api/loyalty/business/${businessId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function apiDeleteLoyaltyBusiness(
  businessId: string,
): Promise<ApiResponse<null>> {
  return apiRequest(`/api/loyalty/business/${businessId}`, {
    method: "DELETE",
  });
}

export async function apiIssueCard(
  businessId: string,
  customerId: string,
): Promise<ApiResponse<LoyaltyCard>> {
  return apiRequest("/api/loyalty/card", {
    method: "POST",
    body: JSON.stringify({ businessId, customerId }),
  });
}

export async function apiAddPoints(
  cardId: string,
  points: number,
): Promise<ApiResponse<LoyaltyCard>> {
  return apiRequest(`/api/loyalty/card/${cardId}/points`, {
    method: "POST",
    body: JSON.stringify({ points }),
  });
}

export async function apiGetUserCards(): Promise<ApiResponse<LoyaltyCard[]>> {
  return apiRequest("/api/loyalty/user/cards", {
    method: "GET",
  });
}

export async function apiGetBusinessCards(
  businessId: string,
): Promise<ApiResponse<LoyaltyCard[]>> {
  return apiRequest(`/api/loyalty/business/${businessId}/cards`, {
    method: "GET",
  });
}

// NFC Business endpoints with proper types
export async function apiCreateNfcProfile(
  businessName: string,
  slug: string,
  title?: string,
  phone?: string,
  email?: string,
  website?: string,
  socialLinks?: Record<string, string>,
): Promise<ApiResponse<NfcBusinessProfile>> {
  return apiRequest("/api/nfc/profile", {
    method: "POST",
    body: JSON.stringify({
      businessName,
      slug,
      title,
      phone,
      email,
      website,
      socialLinks,
    }),
  });
}

export async function apiGetUserNfcProfile(): Promise<
  ApiResponse<NfcBusinessProfile>
> {
  return apiRequest("/api/nfc/profile", {
    method: "GET",
  });
}

export async function apiUpdateNfcProfile(
  updates: Partial<NfcBusinessProfile>,
): Promise<ApiResponse<NfcBusinessProfile>> {
  return apiRequest("/api/nfc/profile", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function apiGetNfcProfileBySlug(
  slug: string,
): Promise<ApiResponse<NfcBusinessProfile>> {
  return apiRequest(`/api/nfc/profile/${slug}`, {
    method: "GET",
  });
}

export async function apiDeleteNfcProfile(): Promise<ApiResponse<null>> {
  return apiRequest("/api/nfc/profile", {
    method: "DELETE",
  });
}

// TODO: Implement /api/loyalty/check-slug endpoint on backend if needed
// export async function apiCheckLoyaltySlugAvailability(
//   slug: string,
// ): Promise<ApiResponse<{ available: boolean; slug: string }>> {
//   return apiRequest(
//     `/api/loyalty/check-slug?slug=${encodeURIComponent(slug)}`,
//     {
//       method: "GET",
//     },
//   );
// }

// Add these type definitions at the top of the file
export interface User {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoyaltyBusiness {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyCard {
  id: string;
  businessId: string;
  userId: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface NfcBusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "file" | "system";
  metadata?: Record<string, any>;
  edited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Conversation {
  id: string;
  title: string;
  description?: string;
  participants: User[];
  messages: ChatMessage[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Chat endpoints
export async function apiCreateConversation(
  title: string,
  participantIds: string[],
  description?: string,
): Promise<ApiResponse<Conversation>> {
  return apiRequest("/api/chat/conversations", {
    method: "POST",
    body: JSON.stringify({ title, participantIds, description }),
  });
}

export async function apiListConversations(): Promise<
  ApiResponse<Conversation[]>
> {
  return apiRequest("/api/chat/conversations", {
    method: "GET",
  });
}

export async function apiGetMessages(
  conversationId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<ApiResponse<ChatMessage[]>> {
  return apiRequest(
    `/api/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
    },
  );
}

export async function apiSendMessage(
  conversationId: string,
  content: string,
  type: "text" | "image" | "file" | "system" = "text",
  metadata?: Record<string, any>,
): Promise<ApiResponse<ChatMessage>> {
  return apiRequest(`/api/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content, type, metadata }),
  });
}

export async function apiEditMessage(
  conversationId: string,
  messageId: string,
  content: string,
): Promise<ApiResponse<ChatMessage>> {
  return apiRequest(
    `/api/chat/conversations/${conversationId}/messages/${messageId}`,
    {
      method: "PUT",
      body: JSON.stringify({ content }),
    },
  );
}

export async function apiDeleteMessage(
  conversationId: string,
  messageId: string,
): Promise<ApiResponse<null>> {
  return apiRequest(
    `/api/chat/conversations/${conversationId}/messages/${messageId}`,
    {
      method: "DELETE",
    },
  );
}

export async function apiAddParticipant(
  conversationId: string,
  userId: string,
): Promise<ApiResponse<Conversation>> {
  return apiRequest(`/api/chat/conversations/${conversationId}/participants`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function apiLeaveConversation(
  conversationId: string,
): Promise<ApiResponse<null>> {
  return apiRequest(`/api/chat/conversations/${conversationId}/leave`, {
    method: "DELETE",
  });
}

// WebSocket helper - export for real-time chat integration
import { wsService } from "./websocketContext";

export { wsService };

// WebSocket integration example:
// In components, use wsService for real-time updates:
//
// const unsubscribe = wsService.onMessage(conversationId, (message) => {
//   // Handle new message
// })
//
// wsService.sendMessage(conversationId, "Hello!")
// wsService.startTyping(conversationId)
// wsService.joinConversation(conversationId)
