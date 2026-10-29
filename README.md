# TaskFlow – Task Management App

Full-stack task manager: **React + Vite + Tailwind CSS** frontend, **ASP.NET Core (.NET 10)** Web API, **PostgreSQL** database.

## Features

- **Dashboard** – totals, in-progress / completed / overdue counts, completion rate, status & priority breakdowns, upcoming deadlines, recently updated tasks
- **Tasks** – full CRUD, search, status/priority filters, responsive table (desktop) / cards (mobile)
- **Task details** – full info, edit, delete, one-click status change
- **Team members** – team directory
- Sample data: 12 tasks (all statuses/priorities) and 5 team members, seeded automatically and never duplicated on restart

> Task assignment is intentionally **not** implemented: tasks and team members are independent (no relationship in the database, API or UI).

## Project structure

```
ai-task-manager/
├── backend/
│   ├── TaskManager.slnx
│   └── TaskManager.Api/
│       ├── Controllers/    TasksController, TeamMembersController, DashboardController
│       ├── Services/       Business logic, DTO mapping, domain exceptions
│       ├── Repositories/   EF Core data access
│       ├── DTOs/           Request/response contracts with validation attributes
│       ├── Models/         Entities + enums
│       ├── Data/           AppDbContext, DbSeeder
│       ├── Middleware/     GlobalExceptionHandler (ProblemDetails)
│       └── Migrations/     EF Core migrations
├── frontend/
│   └── src/  api/  components/  hooks/  lib/  pages/
└── database/
    └── setup.sql           Creates the DB user and database
```

## Prerequisites

| Tool | Version used |
|------|--------------|
| .NET SDK | 10.0 |
| Node.js | 20.19+ (tested on 24) |
| PostgreSQL | 14+ (tested on 18) |

## 1. PostgreSQL setup

Create the application user and database (run once, as the `postgres` superuser):

```bash
psql -U postgres -h localhost -f database/setup.sql
```

This creates user `taskmanager_user` (password `taskmanager_pass`) and database `taskmanager`.
The script is idempotent – safe to run again.

Tables are created automatically by EF Core migrations when the API starts.

**Using different credentials?** Override the connection string without editing files:

```powershell
# PowerShell
$env:ConnectionStrings__DefaultConnection = "Host=localhost;Port=5432;Database=taskmanager;Username=...;Password=..."
```

or use user-secrets:

```bash
cd backend/TaskManager.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=taskmanager;Username=...;Password=..."
```

## 2. Start the backend

```bash
cd backend
dotnet run --project TaskManager.Api --launch-profile http
```

- API: http://localhost:5094
- OpenAPI document (Development): http://localhost:5094/openapi/v1.json
- Health check: http://localhost:5094/api/health

On startup the API applies migrations, then seeds sample data **only into empty tables** – restarting never
creates duplicates, and sample rows you delete are not re-created. Unique indexes on task title and member
email are an extra safeguard.

## 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` to `http://localhost:5094`
(change with `VITE_API_PROXY_TARGET`, see `frontend/.env.example`).

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/tasks?status=&priority=&search=` | List / filter tasks |
| GET | `/api/tasks/{id}` | Task details |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| GET | `/api/team-members` | List team members |
| GET | `/api/team-members/{id}` | Team member details |

Enums are sent as strings – status: `Todo`, `InProgress`, `InReview`, `Done`; priority: `Low`, `Medium`, `High`, `Critical`.

Example request body:

```json
{
  "title": "Prepare sprint demo",
  "description": "Optional, up to 2000 characters",
  "status": "Todo",
  "priority": "High",
  "dueDate": "2026-11-15"
}
```

Validation: title required (3–200 chars, unique), description ≤ 2000 chars, status and priority required and valid.
Errors use RFC 7807 ProblemDetails: `400` validation, `404` not found, `409` duplicate title.

## Build commands

```bash
cd backend  && dotnet build
cd frontend && npm run build && npm run lint
```

## Resetting sample data

```sql
-- as taskmanager_user, in database taskmanager
TRUNCATE tasks, team_members RESTART IDENTITY;
```

Restart the API and the sample data is seeded again.

## Troubleshooting

### API fails at startup: `password authentication failed for user "taskmanager_user"`

The database user is missing or has a different password. Run `database/setup.sql` (step 1), then make sure
the password matches the connection string – `setup.sql` does not change the password of an existing user:

```bash
psql -U postgres -h localhost -c "ALTER ROLE taskmanager_user WITH LOGIN PASSWORD 'taskmanager_pass';"
```

### API fails at startup: `permission denied for schema public`

The `taskmanager` database already existed and is owned by `postgres`, so `setup.sql` skipped creating it.
Since PostgreSQL 15, only the database owner can create tables in the `public` schema, so migrations fail.
Make `taskmanager_user` the owner:

```bash
psql -U postgres -h localhost -d taskmanager -c "ALTER DATABASE taskmanager OWNER TO taskmanager_user; ALTER SCHEMA public OWNER TO taskmanager_user;"
```

### Windows: `npm` fails with "running scripts is disabled on this system"

PowerShell's default execution policy (`Restricted`) blocks `npm.ps1`. Allow local scripts for your user
(no admin rights needed), then reopen the terminal:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Alternatively, without changing the policy, call `npm.cmd` instead: `npm.cmd install`, `npm.cmd run dev`.

Also check you run npm commands inside `frontend/` – the repository root has no `package.json`.
