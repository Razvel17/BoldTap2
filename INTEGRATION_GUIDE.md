# BoldTap Frontend-Backend Integration Guide

## ✅ Status: Successfully Connected

The frontend and backend are now fully connected and working together.

---

## 🚀 Running Servers

### Backend Server

- **URL**: http://localhost:3001
- **Status**: ✅ Running
- **Test**: `curl http://localhost:3001/health`

### Frontend Server

- **URL**: http://localhost:3000
- **Status**: ✅ Running
- **Access**: http://localhost:3000

---

## 📋 What Was Configured

### 1. **API Client Setup**

Created [Frontend/contexts/api.ts](Frontend/contexts/api.ts) with:

- Centralized API endpoint management
- Automatic JWT token handling
- Error handling and response parsing
- Type-safe API functions for all backend endpoints

### 2. **Environment Configuration**

Updated [Frontend/.env.local](Frontend/.env.local):

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. **Authentication System**

Updated [Frontend/contexts/lib/auth.ts](Frontend/contexts/lib/auth.ts):

- Replaced localStorage-based mock auth with real backend API calls
- Integrated token management with automatic Bearer token headers
- User data now fetched from backend instead of local storage
- Password validation still done client-side for UX

### 4. **API Functions Available**

#### Authentication Endpoints

- `apiRegister(name, email, phone, password)` → `POST /auth/register`
- `apiLogin(email, password)` → `POST /auth/login`
- `apiLogout()` → `POST /auth/logout`
- `apiGetCurrentUser()` → `GET /auth/me` (Protected)
- `apiUpdateProfile(data)` → `PUT /auth/profile` (Protected)
- `apiChangePassword(oldPassword, newPassword)` → `POST /auth/change-password` (Protected)
- `apiCheckEmailAvailability(email)` → `GET /auth/check-email`

#### Loyalty Card Endpoints

- `apiCreateLoyaltyBusiness(...)` → `POST /api/loyalty/business` (Protected)
- `apiGetLoyaltyBusiness(slug)` → `GET /api/loyalty/business/:slug`
- `apiGetUserLoyaltyBusinesses()` → `GET /api/loyalty/user/businesses` (Protected)
- `apiCreateLoyaltyCard(businessId, userId)` → `POST /api/loyalty/card` (Protected)
- `apiGetLoyaltyCard(cardId)` → `GET /api/loyalty/card/:cardId`
- `apiGetUserLoyaltyCards()` → `GET /api/loyalty/user/cards` (Protected)
- `apiAddPointsToCard(cardId, points)` → `POST /api/loyalty/card/:cardId/points` (Protected)
- `apiUpdateLoyaltyBusiness(businessId, data)` → `PUT /api/loyalty/business/:businessId` (Protected)
- `apiDeleteLoyaltyCard(cardId)` → `DELETE /api/loyalty/card/:cardId` (Protected)
- `apiGetBusinessLoyaltyCards(businessId)` → `GET /api/loyalty/business/:businessId/cards` (Protected)

#### NFC Business Endpoints

- `apiCreateNfcProfile(...)` → `POST /api/nfc/profile` (Protected)
- `apiGetNfcProfile(slug)` → `GET /api/nfc/profile/:slug`
- `apiGetUserNfcProfile()` → `GET /api/nfc/profile` (Protected)
- `apiUpdateNfcProfile(profileId, data)` → `PUT /api/nfc/profile/:profileId` (Protected)
- `apiDeleteNfcProfile(profileId)` → `DELETE /api/nfc/profile/:profileId` (Protected)
- `apiCheckNfcSlugAvailability(slug)` → `GET /api/nfc/check-slug`

#### Chat Endpoints ✨ NEW (2026)

All chat endpoints require authentication:

- `apiCreateConversation(title, participantIds, description?)` → `POST /api/chat/conversations`
- `apiListConversations()` → `GET /api/chat/conversations`
- `apiGetMessages(conversationId, limit, offset)` → `GET /api/chat/conversations/:conversationId/messages`
- `apiSendMessage(conversationId, content, type?, metadata?)` → `POST /api/chat/conversations/:conversationId/messages`
- `apiEditMessage(conversationId, messageId, content)` → `PUT /api/chat/conversations/:conversationId/messages/:messageId`
- `apiDeleteMessage(conversationId, messageId)` → `DELETE /api/chat/conversations/:conversationId/messages/:messageId`
- `apiAddParticipant(conversationId, userId)` → `POST /api/chat/conversations/:conversationId/participants`
- `apiLeaveConversation(conversationId)` → `DELETE /api/chat/conversations/:conversationId/leave`

---

## 💬 Chat System Integration

### Message Types & Structure

Message types include:
- `text`: Plain text message
- `image`: Image attachment
- `file`: File attachment
- `system`: System message (auto-generated)

### Conversation Usage

```typescript
import {
  apiCreateConversation,
  apiSendMessage,
  apiListConversations
} from "@/contexts/api";

// Create a new conversation with participants
const newConv = await apiCreateConversation(
  "Team Discussion",
  ["user-id-1", "user-id-2"],
  "Discussing Q2 roadmap"
);

// Get all conversations for current user
const conversations = await apiListConversations();

// Get messages with pagination
const messages = await apiGetMessages(conversationId, 50, 0);

// Send a message
const msg = await apiSendMessage(conversationId, "Hello team!");

// Edit a message (sets edited=true)
await apiEditMessage(conversationId, messageId, "Updated message");

// Delete a message (soft delete via deletedAt)
await apiDeleteMessage(conversationId, messageId);
```

### Message Types in TypeScript

```typescript
interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: "text" | "image" | "file" | "system"
  metadata?: Record<string, any>
  edited: boolean
  editedAt?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

interface Conversation {
  id: string
  title: string
  description?: string
  participants: User[]
  messages: ChatMessage[]
  createdBy: string
  createdAt: string
  updatedAt: string
}
```

---

1. **Login/Register**: Credentials sent to backend
2. **Token Receipt**: Backend returns JWT token
3. **Token Storage**: Token saved to localStorage (or sessionStorage if "Remember Me" unchecked)
4. **API Requests**: All subsequent requests include `Authorization: Bearer {token}` header
5. **Token Refresh**: Token maintained across page reloads

---

## 🛠️ How to Use the API Client

### In Components

```typescript
import { apiGetUserLoyaltyCards, apiCreateLoyaltyCard } from "@/contexts/api";

// Fetch user's loyalty cards
const response = await apiGetUserLoyaltyCards();
if (response.success) {
  const cards = response.data?.cards;
}

// Create a new loyalty card
const createResponse = await apiCreateLoyaltyCard(businessId, userId);
```

### Error Handling

```typescript
const response = await apiLogin(email, password);
if (!response.success) {
  console.error(response.error); // Error message from backend
}
```

---

## 📝 Next Steps

1. **Update frontend components** to use new chat API:
   - Create chat UI components
   - Integrate message display
   - Add conversation list
   - Implement real-time message updates

2. **Add WebSocket support** (Optional but recommended):
   - Install Socket.io: `npm install socket.io-client`
   - Add WebSocket handler in backend
   - Replace polling with real-time events for new messages

3. **Add more features**:
   - NFC scanning and QR code reading
   - Image uploads for profiles & messages
   - Real-time notifications
   - Typing indicators
   - User presence

4. **Add error boundaries** in components for better error handling

5. **Implement request caching** using SWR hooks (already installed)

---

## 🧪 Testing the Connection

Try logging in with test credentials:

1. **Register**: Create an account at http://localhost:3000/register
2. **Login**: Try logging in at http://localhost:3000/login
3. **Dashboard**: Access dashboard after login

---

## 📚 File Locations

| File                                                                   | Purpose                |
| ---------------------------------------------------------------------- | ---------------------- |
| [Frontend/contexts/api.ts](Frontend/contexts/api.ts)                   | API client & endpoints |
| [Frontend/contexts/lib/auth.ts](Frontend/contexts/lib/auth.ts)         | Authentication logic   |
| [Frontend/.env.local](Frontend/.env.local)                             | Environment variables  |
| [Frontend/contexts/AuthContext.tsx](Frontend/contexts/AuthContext.tsx) | Auth state management  |

---

## ⚠️ Important Notes

- **CORS**: Backend needs CORS enabled for requests from `http://localhost:3000` (already configured)
- **JWT Secret**: Keep `JWT_SECRET` environment variable secure in production
- **Token Expiry**: Tokens expire after 24 hours (configurable in backend)
- **Development**: Both servers run in development mode for hot-reload

---

## 🔧 Troubleshooting

### "Network error" when making requests

- Check if backend is running: `curl http://localhost:3001/health`
- Verify port 3001 is not blocked
- Check browser console for CORS errors

### "Invalid token" errors

- Logout and login again to get a fresh token
- Check if token is correctly saved in localStorage

### Frontend not loading

- Verify frontend is running: `npm run dev` in Frontend directory
- Check if port 3000 is available

---

Generated: April 2, 2026

Updated: April 3, 2026 - Chat system added
