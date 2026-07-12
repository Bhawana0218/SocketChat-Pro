# SocketChat Pro

A production-ready real-time chat platform with persistent messaging, live presence indicators, typing events, delivery states, voice messages, video/voice calls, emoji, and stickers — powered by Socket.io, Express, and MongoDB.

> Built with React, TypeScript, Express.js, Socket.io, and MongoDB.

---

## Features

### Core (Assignment Requirements)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Send messages | Done | Socket.io `send_message` event + REST `POST /api/messages` |
| Receive messages instantly | Done | Socket.io `receive_message` broadcast |
| Chat history persistence | Done | MongoDB Atlas with Mongoose |
| Message timestamps | Done | Relative formatting (Just now, 2m ago, Yesterday) |
| REST APIs | Done | `GET /api/messages`, `POST /api/messages`, `GET /api/health` |
| Socket.io integration | Done | Real-time bidirectional communication |
| Handle connections/disconnections | Done | System messages ("X joined/left the chat") |
| Clean architecture | Done | Service layer, controllers, typed events |
| Error handling | Done | Global error middleware + socket error handling |

### Bonus Features (All Implemented)

| Feature | Status |
|---------|--------|
| Username-based login | Done |
| Typing indicator | Done |
| Online/offline user status | Done |
| Last seen timestamp | Done |
| Message delivered status (✓✓) | Done |
| Message read status (blue ✓✓) | Done |
| MongoDB persistence | Done |
| Connection status indicator | Done |
| Reconnection handling | Done |
| Loading skeletons | Done |
| Empty state UI | Done |
| Auto-scroll to latest message | Done |
| Scroll-to-bottom button | Done |
| Date separators | Done |
| Message grouping (Slack-style) | Done |
| User avatars (color-coded) | Done |
| Responsive mobile layout | Done |
| Rate limiting + security headers | Done |

### Extra Features (Production Polish)

| Feature | Description |
|---------|-------------|
| Private messaging | Direct messages between users |
| Emoji picker | Categorized emoji grid with search |
| Sticker picker | 4 sticker packs (Reactions, Animals, Food, Travel) |
| Voice messages | Record, preview, play with waveform |
| Video calls | WebRTC peer-to-peer via Socket.io signaling |
| Voice calls | WebRTC audio-only calls |
| About modal | Tech stack and features display |
| Join/leave system messages | Centered dividers with timestamps |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| State Management | Zustand |
| Real-time Client | Socket.io Client |
| HTTP Client | Axios |
| Icons | Lucide React |
| Backend | Node.js, Express, TypeScript |
| Real-time Server | Socket.io |
| Database | MongoDB Atlas, Mongoose |
| Security | Helmet, CORS, Express Rate Limiting |
| Calling | WebRTC with STUN servers |

---

## Project Structure

```
socketchat-pro/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                    # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── message.controller.ts    # Message REST handlers
│   │   │   └── health.controller.ts     # Health check endpoint
│   │   ├── middleware/
│   │   │   └── error.middleware.ts      # Global error handler
│   │   ├── models/
│   │   │   └── Message.ts              # Mongoose schema
│   │   ├── routes/
│   │   │   └── message.routes.ts       # API routes
│   │   ├── services/
│   │   │   ├── socket.service.ts       # Socket.io + call signaling
│   │   │   └── message.service.ts      # Business logic
│   │   ├── types/
│   │   │   └── socket.ts              # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── logger.ts             # Colored console logger
│   │   ├── app.ts                    # Express middleware setup
│   │   └── server.ts                 # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── chatApi.ts            # Axios REST client
│   │   ├── components/
│   │   │   ├── AboutModal.tsx         # App info modal
│   │   │   ├── CallModal.tsx          # Video/voice call UI
│   │   │   ├── ChatHeader.tsx         # Header with status
│   │   │   ├── DateSeparator.tsx      # Date dividers
│   │   │   ├── EmptyState.tsx         # No messages view
│   │   │   ├── EmojiPicker.tsx        # Emoji grid picker
│   │   │   ├── LoadingSkeleton.tsx    # Loading placeholders
│   │   │   ├── MessageBubble.tsx      # Message + voice display
│   │   │   ├── MessageInput.tsx       # Input with emoji/voice
│   │   │   ├── OnlineUsers.tsx        # Online user badges
│   │   │   ├── ScrollToBottom.tsx     # Scroll down button
│   │   │   ├── StickerPicker.tsx      # Sticker grid picker
│   │   │   ├── SystemMessage.tsx      # Join/leave messages
│   │   │   ├── TypingIndicator.tsx    # Typing dots
│   │   │   └── UserSidebar.tsx        # Left sidebar
│   │   ├── hooks/
│   │   │   └── useSocket.ts           # Socket + messages hooks
│   │   ├── pages/
│   │   │   ├── ChatPage.tsx           # Main chat view
│   │   │   ├── LoginPage.tsx          # Username entry
│   │   │   └── PrivateChatPage.tsx    # DM view
│   │   ├── services/
│   │   │   └── socket.ts             # Socket.io client setup
│   │   ├── store/
│   │   │   └── chatStore.ts          # Zustand state
│   │   ├── types/
│   │   │   └── chat.ts              # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── formatTime.ts        # Time formatting
│   │   ├── App.tsx                   # Root component
│   │   ├── main.tsx                  # Entry point
│   │   ├── index.css                 # Global styles
│   │   └── vite-env.d.ts            # Vite types
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
└── README.md
```

---

## Setup Instructions

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **MongoDB Atlas** account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/socketchat-pro.git
cd socketchat-pro
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/socketchat-pro?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

The server will run on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Open in Browser

1. Open `http://localhost:5173` in one browser tab
2. Enter a username and click "Join Chat"
3. Open another tab to simulate a second user
4. Start chatting in real-time!

---

## API Design

### Send Message

```
POST /api/messages
Content-Type: application/json

{
  "username": "Bhawana",
  "message": "Hello world"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "username": "Bhawana",
    "message": "Hello world",
    "createdAt": "2026-07-12T08:30:00Z",
    "delivered": false,
    "read": false,
    "chatType": "public",
    "contentType": "text"
  }
}
```

### Fetch Chat History

```
GET /api/messages?limit=50
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "username": "Bhawana",
      "message": "Hello world",
      "createdAt": "2026-07-12T08:30:00Z",
      "delivered": true,
      "read": true,
      "chatType": "public",
      "contentType": "text"
    }
  ]
}
```

### Fetch Private Messages

```
GET /api/messages/private?user1=Bhawana&user2=Satakshi&limit=50
```

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 1243.5,
  "timestamp": "2026-07-12T08:30:00Z",
  "connections": 2,
  "uniqueUsers": 2
}
```

---

## Socket.io Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ username }` | User joins the chat room |
| `send_message` | `{ username, message, contentType }` | Send a public message |
| `send_private_message` | `{ username, recipient, message, contentType }` | Send a DM |
| `typing` | `{ username, chatType, recipient }` | User started typing |
| `stop_typing` | `{ username, chatType, recipient }` | User stopped typing |
| `join_private_chat` | `{ with: username }` | Join a private chat room |
| `mark_delivered` | `{ messageId }` | Mark message as delivered |
| `mark_read` | `{ messageId, chatType, recipient }` | Mark message as read |
| `call_invite` | `{ to, callType }` | Initiate voice/video call |
| `call_accept` | `{ to }` | Accept incoming call |
| `call_reject` | `{ to }` | Reject incoming call |
| `call_end` | `{ to }` | End active call |
| `call_signal` | `{ to, signal }` | WebRTC signaling (SDP/ICE) |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `receive_message` | `Message` | New public message received |
| `receive_private_message` | `Message` | New DM received |
| `system_message` | `Message` | Join/leave system message |
| `user_joined` | `{ username, onlineUsers }` | User joined notification |
| `user_left` | `{ username, onlineUsers }` | User left notification |
| `typing` | `{ username, chatType, recipient }` | User is typing |
| `stop_typing` | `{ username, chatType, recipient }` | User stopped typing |
| `online_users` | `UserPresence[]` | Updated user list with last seen |
| `message_delivered` | `{ messageId }` | Delivery confirmation |
| `message_read` | `{ messageId }` | Read receipt confirmation |
| `call_invite` | `{ from, callType }` | Incoming call notification |
| `call_accept` | `{ from }` | Call accepted |
| `call_reject` | `{ from }` | Call rejected |
| `call_end` | `{ from }` | Call ended |
| `call_signal` | `{ from, signal }` | WebRTC signal received |

---

## Database Schema

```typescript
{
  _id: ObjectId,
  username: String,        // Sender's username
  message: String,         // Message content (text, base64 audio, or sticker)
  createdAt: Date,         // Timestamp (auto-generated)
  updatedAt: Date,         // Last update timestamp
  delivered: Boolean,      // Has been delivered to recipients
  read: Boolean,           // Has been read by recipients
  chatType: String,        // "public" | "private"
  recipient: String|null,  // DM recipient username
  messageType: String,     // "message" | "system"
  event: String|null,      // "user_joined" | "user_left" | null
  contentType: String      // "text" | "voice" | "sticker"
}
```

---

## Design Decisions

1. **Zustand over Redux**: Lightweight state management with minimal boilerplate. Better for real-time updates where state changes frequently.

2. **Custom Socket Hook (`useSocket`)**: Encapsulates all Socket.io logic with `useRefCallback` pattern to prevent reconnection cycles from React re-renders.

3. **Service Layer Pattern**: Backend separates concerns — `MessageService` handles DB operations, `SocketService` handles real-time events, `MessageController` handles HTTP.

4. **Ref-based Socket Connection**: Socket connects once via `useRef` and `connectedRef`, preventing React StrictMode from causing duplicate connections.

5. **WebRTC with Socket.io Signaling**: Uses Socket.io as the signaling server for WebRTC calls. Google STUN servers for NAT traversal.

6. **Vite Proxy Configuration**: Frontend proxies `/api` and `/socket.io` to backend in development, eliminating CORS issues.

7. **Relative Time Formatting**: Custom utility that shows "Just now", "2m ago", "Yesterday", etc. for a modern chat feel.

8. **Color-coded Avatars**: Deterministic gradient colors based on username hash — no image uploads needed.

9. **Message Content Types**: Single message model supports text, voice (base64 audio), and stickers (emoji) via `contentType` field.

---

## Assumptions

- Users self-identify with a username (no password authentication required for this scope).
- Messages are stored permanently in MongoDB for persistence across sessions.
- Online status is tracked via Socket.io connection state with last-seen timestamps.
- Delivered/read status is broadcast to all clients (simplified — no per-user read receipts).
- Voice messages are stored as base64 in MongoDB (acceptable for assignment scope; production would use cloud storage).
- WebRTC calls use Google STUN servers (works on localhost; production needs TURN servers for NAT traversal).
- Join/leave system messages are deduplicated by tracking connected usernames, not socket IDs.

---

## Environment Variables

### Backend

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | Yes | — |
| `CLIENT_URL` | Frontend URL for CORS | No | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | No | `development` |

### Frontend

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend REST API URL | No | `http://localhost:5000` |
| `VITE_SOCKET_URL` | Backend Socket.io URL | No | `http://localhost:5000` |

---

## How to Verify All Requirements

### Functional Checklist

| # | Requirement | How to Test |
|---|-------------|-------------|
| 1 | Two users can join simultaneously | Open two browser tabs, join with different usernames |
| 2 | Messages appear instantly | Send a message in tab 1, verify it appears in tab 2 |
| 3 | Refreshing preserves chat history | Refresh the page, all messages are still there |
| 4 | Typing indicator works | Type in tab 1, see "X is typing..." in tab 2 |
| 5 | Typing indicator disappears | Stop typing for 2 seconds, indicator disappears |
| 6 | Online user count updates | Join/leave tabs, count updates in sidebar |
| 7 | Last seen updates after disconnect | Close tab 2, see "Last seen just now" in sidebar |
| 8 | Reconnection works | Stop backend, restart it, app reconnects automatically |
| 9 | Mobile layout works | Resize browser to phone width |
| 10 | No duplicate users | Join same username twice, only one entry in online list |
| 11 | No duplicate join messages | Reconnect, no duplicate "X joined" messages |

---

## Deployment

### Backend (Render)

1. Push code to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Set environment variables:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `CLIENT_URL` = your Vercel frontend URL
   - `NODE_ENV` = production
4. Deploy

### Frontend (Vercel)

1. Push code to GitHub
2. Import repository on [Vercel](https://vercel.com)
3. Set environment variables:
   - `VITE_API_URL` = your Render backend URL
   - `VITE_SOCKET_URL` = your Render backend URL
4. Deploy

---

## License

MIT
