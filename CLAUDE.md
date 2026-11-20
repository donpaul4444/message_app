# Message App

A simple SaaS messaging web application built on the MERN stack. Users sign in with Google and chat in real time, either one-to-one or in groups.

Scope: **web app only** for now. The backend is still a standalone REST + WebSocket API (no server-rendered pages), so other clients can be added later without a rewrite.

## MVP Features

**Auth**
- Sign in with Google only (no passwords, no phone/OTP)
- Persistent login via JWT in an httpOnly cookie; logout
- Admin approval: new users are `pending` after Google sign-in and see a "waiting for approval" page until an admin approves them. Admins (emails in `ADMIN_EMAILS`) are approved automatically.

**One-to-one chat** (any approved user can chat with any other approved user)
- Search approved users by name/email and start a chat
- Starting a chat with the same person reuses the existing conversation (no duplicates)
- Real-time send/receive
- Message history with cursor pagination ("load older")
- Unread count per conversation
- Chat list sorted by latest message

**Admin**
- Approve / reject sign-up requests, block / unblock users. Admins cannot read other users' chats.

Deliberately left out of the current UI (planned later): group chats, typing indicator, online / last-seen status, read receipts (ticks).
Also out of scope: images/files, message edit/delete, replies, reactions, push notifications, workspaces/organizations, billing, mobile app.

## Tech Stack

Language: TypeScript on the frontend; JavaScript (ES modules) on the backend. Node.js LTS.

### Backend (`backend/`)
| Library | Purpose |
|---|---|
| express | REST API |
| mongoose | MongoDB ODM |
| socket.io | Real-time messaging |
| google-auth-library | Verify Google ID tokens |
| jsonwebtoken | Issue/verify app JWTs |
| cookie-parser | Read auth cookie (REST + socket handshake) |
| cors | Allow the client origin with credentials |
| helmet | Security headers |
| express-rate-limit | Basic rate limiting |
| zod | Request / socket payload validation |
| dotenv | Environment variables |
| morgan | Request logging (dev) |
| nodemon (dev) | Auto-restart in development |

### Frontend (`frontend/`)
| Library | Purpose |
|---|---|
| react + vite + typescript | UI and build tooling |
| react-router-dom | Routing (Login, Chat) |
| @react-oauth/google | "Sign in with Google" button |
| axios | REST client (`withCredentials: true`) |
| socket.io-client | Real-time connection |
| zustand | Client state (auth, conversations, messages) |
| tailwindcss (v4, via @tailwindcss/vite) | Styling |
| shadcn/ui | UI components (copied into `src/components/ui/`, add with `npx shadcn@latest add <name>`) |
| lucide-react | Icons |
| date-fns | Timestamp formatting |

### Database
MongoDB (local or MongoDB Atlas).

## Architecture

### Communication rule
- **REST** for fetching and changing data: auth, profile, user search, chat list, message history, group management.
- **WebSocket (Socket.IO)** for anything that must reach other users instantly: sending/receiving messages, typing, presence, read updates.
- MongoDB is the source of truth. A message is always **saved first, then emitted**.

### Authentication flow
1. Client gets a Google **ID token** via `@react-oauth/google`.
2. Client sends it to `POST /api/v1/auth/google`.
3. Server verifies it with `google-auth-library` (audience = `GOOGLE_CLIENT_ID`), then finds or creates the user by `googleId`.
4. Server sets its own JWT in an httpOnly, `sameSite` cookie.
5. The same cookie authenticates REST requests (auth middleware) and the Socket.IO handshake (socket middleware).

### Sending a message
1. Client emits `message:send` with `{ conversationId, text, tempId }` and shows the message optimistically as "sending".
2. Server checks membership, saves the message, updates `conversation.lastMessage`.
3. Server responds via **ack callback** with the saved message; client replaces the temp message (matched by `tempId`).
4. Server emits `message:new` to the other members' `user:<id>` rooms, and to the sender's other tabs (with `tempId` so they can dedupe).

On socket reconnect, the client refetches the chat list and the open chat via REST, so nothing is lost.
A chat someone else started only appears in my list once it has a message; the client fetches it (`GET /conversations/:id`) when its first `message:new` arrives.

### Socket rooms
- On connect, each socket joins `user:<userId>`. 1:1 messages are delivered to members' user rooms, so there are no per-conversation rooms to maintain.
- Blocking a user (admin) disconnects their sockets immediately (`disconnectUser`).

## Data Model

```
User
  googleId (unique), email (unique), name, avatar, lastSeen, timestamps
  role: "user" | "admin"  // emails in ADMIN_EMAILS are promoted to admin on Google sign-in
  status: "pending" | "approved" | "blocked"   // new sign-ups are pending until an admin approves

Conversation
  type: "direct"          // "group" planned later
  members: [{ user: ObjectId<User>, lastReadAt: Date }]
  directKey: "idA:idB"    // sorted member ids, unique → one conversation per pair, even under races
  createdBy: ObjectId<User>
  lastMessage: { text, sender, createdAt }   // denormalized for fast chat list
  timestamps
  indexes: { "members.user": 1, updatedAt: -1 }, { directKey: 1 } unique sparse

Message
  conversation: ObjectId<Conversation>
  sender: ObjectId<User>
  type: "text"            // extend later: "image" | "file" | ...
  text (max 4000)
  timestamps
  indexes: { conversation: 1, _id: -1 }   // history paginates by _id ("before" cursor)
```

Notes:
- One `Conversation` model is meant to handle direct and (later) group chats, so messaging features work for both.
- Unread count = messages in the conversation with `createdAt > members[me].lastReadAt`.
- Messages live in their own collection (never embedded) to avoid the 16MB document limit.

## API (v1)

All routes are prefixed with `/api/v1`. All except `auth/google` require authentication.

```
POST   /auth/google                       sign in with Google ID token
GET    /auth/me                           current user
POST   /auth/logout                       clear cookie

GET    /users/search?q=                   search approved users by name/email (excludes me)

GET    /conversations                     list my conversations (+ unread counts)
POST   /conversations/direct              { userId } → get or create 1:1 chat (other user must be approved)
GET    /conversations/:id                 conversation details (404 if not a member)

GET    /conversations/:id/messages?before=<messageId>&limit=30   paginated history
POST   /conversations/:id/read            mark as read (updates lastReadAt)

# admin only (requireAuth + requireAdmin)
GET    /admin/users?q=                    list all users
PATCH  /admin/users/:userId/status        { status: "approved" | "blocked" } → approve/unblock or reject/block (not self, not admins)
```

Error response format: `{ "error": { "code": "STRING_CODE", "message": "Human readable" } }`

## Socket Events

| Event | Direction | Payload |
|---|---|---|
| `message:send` | client → server (with ack) | `{ conversationId, text, tempId }` → ack `{ ok: true, message }` or `{ ok: false, error: { code, message } }` |
| `message:new` | server → client | `{ message, tempId? }` (`tempId` only to the sender's other tabs) |

Socket handshake errors: `UNAUTHORIZED`, `NOT_APPROVED`. Mark-as-read uses REST (`POST /conversations/:id/read`).
Planned later: `typing`, `presence`, `conversation:read` broadcasts (for ticks).

## Project Structure

```
message_app/
  frontend/
    src/
      main.tsx       app entry
      App.tsx        routes
      api/           axios instance + endpoint functions
      socket/        socket client setup
      store/         zustand stores
      pages/         Login, Chat
      components/    layout/, chat-list/, chat-window/, modals/, ui/ (shadcn)
      lib/           utils.ts (shadcn `cn` helper)
      hooks/
      types/         shared TS types (User, Conversation, Message, ...)
      utils/
      assets/
    .env.example
  backend/
    src/
      config/        env, db connection, google client
      models/        User, Conversation, Message
      validators/    zod schemas shared by REST and socket handlers
      routes/        auth, users, conversations, messages (index.js mounts under /api/v1, has /health)
      controllers/
      services/      business logic shared by REST and socket handlers
      middleware/    auth, validate, rateLimit, errorHandler
      socket/        io setup, auth middleware, event handlers
      utils/         AppError
      app.js         express app
      server.js      http server + socket.io bootstrap
    .env.example
```

`frontend/` and `backend/` are independent projects, each with its own `package.json`. Run each with `npm run dev` from inside its folder.

## Environment Variables

**backend/.env**
```
PORT=5000
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=
CLIENT_URL=http://localhost:5173
NODE_ENV=development
ADMIN_EMAILS=           # comma-separated; these users get role "admin" on sign-in
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=
```

## Conventions
- Frontend imports use the `@/` alias for `src/` (e.g. `@/components/ui/button`).
- Use shadcn theme tokens (`bg-background`, `text-foreground`, `bg-primary`, ...) instead of hard-coded colors.
- Business logic goes in `services/`; controllers and socket handlers stay thin and call services.
- Backend is Express 5: async route handlers can throw directly (no asyncHandler wrapper). Throw `AppError` for expected errors; `errorHandler` formats every error.
- `validate(schema)` puts parsed `{ body, query, params }` on `req.validated` (Express 5's `req.query` is read-only).
- Validate every REST body and socket payload with zod.
- Always check conversation membership on the server before reading or sending messages.
- Never trust client-sent `sender` IDs; take the user from the authenticated token/socket.
- Protect app routes with `requireAuth` (signed in **and** approved). `requireSession` also lets pending users through, and is only for `GET /auth/me`. The Socket.IO auth middleware must reject non-approved users too.
- Paginate messages by cursor (`before` messageId), never by page number.
