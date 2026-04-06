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
- `NEXT_PUBLIC_API_URL` — Backend API URL (set to Replit dev domain on port 3001)
- `PORT` — Backend port (3001)

## Running Locally

Both services start automatically via Replit workflows. The frontend talks to the backend via `NEXT_PUBLIC_API_URL`.

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
