# Discord Clone — MVP

A real-time chat application inspired by Discord, built with modern technologies.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT (JSON Web Tokens)

## Features

- User registration & login
- Create and join servers via invite codes
- Create text channels within servers
- Real-time messaging with Socket.io
- Typing indicators
- Message history with pagination
- Discord-inspired dark UI

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a cloud instance)
- npm or yarn

## Quick Start

### 1. Clone and install dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install server and client dependencies
cd server && npm install && cd ../client && npm install && cd ..
```

### 2. Setup the database

Make sure PostgreSQL is running. Then configure your connection:

```bash
# Edit server/.env with your PostgreSQL credentials
# DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/discord_clone?schema=public"
```

Run the migration and seed:

```bash
cd server
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```

### 3. Start both servers

```bash
# From the root directory — starts both server (:4000) and client (:3000)
npm run dev
```

### 4. Open the app

Go to [http://localhost:3000](http://localhost:3000)

**Test accounts** (from seed data):
- `alice@example.com` / `password123`
- `bob@example.com` / `password123`

## Project Structure

```
discord-clone/
├── client/                 # Next.js frontend
│   └── src/
│       ├── app/            # App Router pages
│       ├── components/     # React components
│       ├── hooks/          # Custom hooks
│       ├── lib/            # API client, socket, utils
│       ├── providers/      # Auth & Socket context providers
│       └── types/          # TypeScript interfaces
├── server/                 # Express backend
│   ├── prisma/             # Schema & seed
│   └── src/
│       ├── config/         # Environment, CORS, Prisma
│       ├── controllers/    # Request handlers
│       ├── middleware/      # Auth, error handling
│       ├── routes/         # Express routes
│       ├── services/       # Business logic
│       └── socket/         # Socket.io setup & handlers
└── package.json            # Root scripts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/servers | Get user's servers |
| POST | /api/servers | Create server |
| POST | /api/servers/join | Join by invite code |
| GET | /api/servers/:id | Get server details |
| GET | /api/channels/:serverId | Get channels |
| POST | /api/channels/:serverId | Create channel |
| GET | /api/messages/:channelId | Get message history |

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| channel:join | Client → Server | Join a channel room |
| channel:leave | Client → Server | Leave a channel room |
| message:send | Client → Server | Send a message |
| message:new | Server → Client | New message broadcast |
| message:typing | Both | Typing indicator |
| message:delete | Both | Delete a message |
