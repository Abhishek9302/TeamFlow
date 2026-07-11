# Changelog

## [ABH-18] TeamFlow — 2026-07-11

### Added
- Full-stack Asana-like MVP: projects, sections, tasks, list/board views, and My Tasks.
- **Auth** — JWT register/login/session (`/api/auth/*`).
- **Projects** — create, list, open project detail.
- **Sections** — ordered columns per project (To do, In progress, Done).
- **Tasks** — CRUD with title, description, assignee, due date, completion, and section placement.
- **Views** — List and Board (Kanban) toggle on project pages.
- **My Tasks** — page showing all incomplete tasks assigned to the current user across projects.
- **Frontend** — Next.js 14 App Router, Tailwind CSS, standalone output.
- **Backend** — Express + TypeScript + `pg`, healthcheck with DB status, auto-applies `database/schema.sql` on boot.
- **Railway** — `railway.toml` with healthchecks for both frontend and backend.
