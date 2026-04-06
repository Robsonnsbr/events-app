# Events App

A fullstack event management application with participant registration.

## Architecture

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS — runs on port **5000**
- **Backend**: Express 5, TypeScript, Prisma 7, PostgreSQL — runs on port **3001**
- **Database**: Replit built-in PostgreSQL (provisioned via Replit DB)

## Directory Structure

```
.
├── backend/          # Express API server
│   ├── prisma/       # Schema + migrations
│   └── src/          # Server source code
├── frontend/         # Next.js app
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   └── lib/          # API client + utilities
```

## Workflows

- **Start application** — `cd frontend && npm run dev` (port 5000, webview)
- **Backend API** — `cd backend && npm run dev` (port 3001, console)

## Environment Variables

- `DATABASE_URL` — Replit PostgreSQL connection string (auto-provisioned)
- `BACKEND_URL` — Backend API URL for Next.js server-side rewrites (defaults to http://localhost:3001)
- `PORT` — Backend port (3001)

## Running Locally

Both services start automatically via Replit workflows. The frontend proxies API calls through Next.js rewrites (`/api/*` → backend), so no CORS configuration is needed between frontend and backend.

## Security

- Backend rate limiting: 100 requests/min per IP (express-rate-limit)
- Request body size limit: 100KB max JSON payload
- Input validation with max lengths on all string fields
- Request logging middleware (method, path, status, duration)

## Database

Uses Replit's built-in PostgreSQL. Prisma migrations are applied on startup:

```bash
cd backend && npx prisma migrate deploy
```

## API Endpoints

- `GET /events` — List all events
- `POST /events` — Create an event
- `GET /events/:eventId` — Get event details
- `GET /events/:eventId/participants` — List event participants
- `POST /events/:eventId/participants` — Register participant to event
- `GET /participants` — List all participants
- `POST /participants` — Create a participant
