# TeamFlow

TeamFlow is a lightweight, full-stack work tracker inspired by Asana. It helps teams manage projects, organize tasks into sections, and track work across list and board views.

## Features

- **Authentication** — JWT-based register / login / session
- **Projects** — create and browse projects
- **Sections** — each project has ordered columns (To do, In progress, Done)
- **Tasks** — title, description, assignee, due date, completion status, and section placement
- **Views** — toggle between List and Board (Kanban) on any project
- **My Tasks** — see all incomplete tasks assigned to you across projects

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, PostCSS |
| Backend | Express + TypeScript + `pg` (PostgreSQL) |
| Database | PostgreSQL (schema in `database/schema.sql`) |
| Deploy | Railway monorepo with `railway.toml` per app |

## Project Structure

```
database/schema.sql       — Postgres schema (users, projects, sections, tasks)
apps/frontend/            — Next.js app (standalone output)
apps/backend/             — Express API server
```

## Environment Variables

### Frontend
- `NEXT_PUBLIC_API_URL` — backend base URL (e.g. `https://teamflow-api.up.railway.app`)

### Backend
- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET` — secret for signing tokens
- `ALLOWED_ORIGINS` — CORS origins (comma-separated)
- `PORT` — server port (default `3000`)

## API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/health`
- `GET|POST /api/projects`
- `GET|PATCH|DELETE /api/projects/:id`
- `GET|POST /api/projects/:id/sections`
- `GET|POST /api/tasks`
- `GET|PATCH|DELETE /api/tasks/:id`
- `GET /api/me/tasks`

## Running Locally

1. Start Postgres and run `database/schema.sql`.
2. In `apps/backend`: `npm install && npm run dev` (requires env vars above).
3. In `apps/frontend`: `npm install && npm run dev`.
4. Open `http://localhost:3000` (or the port Next.js reports).

## Deploying to Railway

- Push to a branch; Railway reads `railway.toml` in each app folder.
- Frontend healthcheck: `GET /api/health`
- Backend healthcheck: `GET /health`
