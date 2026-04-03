# BoldTap WebSocket Real-Time Chat Guide

## Overview

The chat system now includes real-time capabilities using Socket.io for instant message delivery, typing indicators, and user presence.

## Architecture

### Backend WebSocket Service
- **Location**: `backend/src/services/websocketService.ts`
- **Framework**: Socket.io with TypeORM database
- **Port**: 3001 (same as REST API)
- **Transport**: WebSocket (primary) + polling (fallback)

### Frontend WebSocket Client
- **Location**: `Frontend/contexts/websocketContext.ts`
- **Framework**: Socket.io-client
- **Auto-reconnect**: Yes (5 seconds, max 5 attempts)

## Real-Time Events

### Message Events

**Client → Server:**
- `message:send` - Send new message
- `message:edit` - Edit existing message
- `message:delete` - Delete message

**Server → Clients:**
- `message:new` - New message received
- `message:updated` - Message edited
- `message:deleted` - Message deleted

### Typing Indicators

**Client → Server:**
- `typing:start` - User started typing
- `typing:stop` - User stopped typing

**Server → Clients:**
- `typing:started` - Another user is typing
- `typing:stopped` - User stopped typing

### Presence Events

**Client → Server:**
- `presence:online` - User is online
- `presence:offline` - User went offline

**Server → Clients:**
- `presence:user-online` - User came online
- `presence:user-offline` - User went offline
- `user:disconnected` - User disconnected from all conversations

### Room Management

**Client → Server:**
- `join-conversation` - Join conversation room
- `leave-conversation` - Leave conversation room

## Usage Examples

### Backend: Initialize WebSocket

```typescript
// Automatic with new server setup
// In server.ts:
import { WebSocketService } from "./services/websocketService";

const server = createServer(app);
const wsService = new WebSocketService(server);
```

### Frontend: Connect WebSocket

```typescript
import { wsService } from "@/contexts/websocketContext";

// Connect when user logs in
await wsService.connect(userId);

// Check if connected
if (wsService.isConnected()) {
  console.log("✓ WebSocket connected");
}
```

### Frontend: Listen to Messages

```typescript
// Subscribe to real-time messages in a conversation
const unsubscribe = wsService.onMessage(conversationId, (message) => {
  console.log("New message:", message);
  // Update UI with new message
});

// Cleanup when unmounting
return () => unsubscribe();
```

### Frontend: Send Message Real-Time

```typescript
// Send message via WebSocket (instant delivery)
wsService.sendMessage(conversationId, "Hello world!");

// Still save to database via REST API for persistence
const response = await apiSendMessage(conversationId, "Hello world!");
```

### Frontend: Typing Indicators

```typescript
// Show that user is typing
wsService.startTyping(conversationId);

// Clear after 3 seconds or when message sent
setTimeout(() => wsService.stopTyping(conversationId), 3000);

// Listen for other users typing
wsService.onTyping(conversationId, (data) => {
  console.log(`${data.userId} is typing...`);
});
```

### Frontend: Presence

```typescript
// Signal user is online
wsService.setOnline(conversationId);

// Listen for presence changes
wsService.onPresence(conversationId, (data) => {
  console.log(`${data.userId} is ${data.presence}`);
});

// Signal offline when leaving
wsService.setOffline(conversationId);
```

## Integration Pattern

### Step 1: Connect on App Load
```typescript
// In main layout or auth context
useEffect(() => {
  if (user?.id) {
    wsService.connect(user.id).catch(err => {
      console.error("WebSocket connection failed:", err);
      // Fallback to polling
    });
  }
}, [user]);
```

### Step 2: Join Conversation
```typescript
// When opening a chat
useEffect(() => {
  wsService.joinConversation(conversationId);
  
  return () => {
    wsService.leaveConversation(conversationId);
  };
}, [conversationId]);
```

### Step 3: Listen for Events
```typescript
const [messages, setMessages] = useState([]);

useEffect(() => {
  // Real-time messages
  const unsubMessage = wsService.onMessage(conversationId, (msg) => {
    setMessages(prev => [...prev, msg]);
  });

  // Typing indicators
  const unsubTyping = wsService.onTyping(conversationId, (data) => {
    setTypingUsers(prev => new Set([...prev, data.userId]));
    setTimeout(() => {
      setTypingUsers(prev => {
        prev.delete(data.userId);
        return new Set(prev);
      });
    }, 3000);
  });

  return () => {
    unsubMessage();
    unsubTyping();
  };
}, [conversationId]);
```

### Step 4: Send Messages
```typescript
async function handleSendMessage(content: string) {
  // Send via WebSocket for real-time
  wsService.sendMessage(conversationId, content);
  
  // Also save to database
  const response = await apiSendMessage(conversationId, content);
  if (!response.success) {
    showError(response.error);
  }
}
```

## Error Handling

### Connection Errors
```typescript
wsService.connect(userId).catch((error) => {
  console.error("Failed to connect:", error);
  // Fall back to REST API polling
  useFallbackPoll();
});
```

### Message Errors
```typescript
wsService.onEvent("error", (data) => {
  console.error("Message error:", data.error);
  showNotification(data.message);
});
```

## Performance Considerations

1. **Debounce Typing**: Don't emit typing events on every keystroke
   ```typescript
   const debounceTyping = debounce(() => wsService.startTyping(convId), 300);
   ```

2. **Batch Updates**: Group multiple events when possible
   ```typescript
   const messages = [msg1, msg2, msg3];
   messages.forEach(msg => addToUI(msg)); // Batch UI updates
   ```

3. **Memory Management**: Unsubscribe from events when done
   ```typescript
   const unsub = wsService.onMessage(convId, handler);
   // Later...
   unsub(); // Prevent memory leaks
   ```

4. **Connection Pooling**: One connection per user (not per conversation)
   ```typescript
   // Good: One connection for all conversations
   wsService.connect(userId);
   wsService.joinConversation(conv1);
   wsService.joinConversation(conv2);
   
   // Bad: Don't create multiple connections
   // wsService.connect() multiple times
   ```

## Fallback Strategy

If WebSocket connection fails:
1. Automatic reconnection (up to 5 attempts)
2. Fall back to polling via REST API
3. Get last 50 messages via `apiGetMessages()`
4. Poll for new messages every 5 seconds

```typescript
// Fallback polling
setInterval(async () => {
  const response = await apiGetMessages(conversationId, 1, 0);
  if (response.success && response.data?.messages) {
    // Check for new messages
  }
}, 5000);
```

## Testing WebSocket

### Manual Testing
```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Test connection
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  http://localhost:3001/socket.io/?EIO=4&transport=websocket
```

### Browser Console
```javascript
// Connect
const socket = io('http://localhost:3001', {
  query: { userId: 'test-user-123' }
});

// Send message
socket.emit('message:send', {
  conversationId: 'conv-123',
  content: 'Hello!',
  type: 'text'
});

// Listen
socket.on('message:new', (message) => {
  console.log('New message:', message);
});
```

## Deployment Notes

1. **HTTPS Required**: WebSocket over secure connection (WSS)
   ```typescript
   // Auto-detect in frontend
   const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
   ```

2. **CORS Configuration**: Already configured in backend
   ```typescript
   cors: {
     origin: FRONTEND_URL,
     methods: ["GET", "POST"],
     credentials: true
   }
   ```

3. **Load Balancing**: Use sticky sessions to route same user to same server
   ```nginx
   # nginx example
   upstream backend {
     server 3001 weight=1;
     server 3002 weight=1;
   }
   ```

4. **Redis Adapter** (for multi-server scaling):
   ```bash
   npm install socket.io-redis
   ```

## Next Steps

- ✅ WebSocket implementation complete
- 📌 Add Redis adapter for scaling
- 📌 Implement message encryption
- 📌 Add file upload support
- 📌 Create chat UI components
- 📌 Add message search
- 📌 Implement message reactions/emojis

