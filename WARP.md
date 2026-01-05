# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

SBCC Management System is a production Django + React application for church management (members, ministries, events, attendance, inventory, tasks, announcements, etc.).

- **Backend:** Django 5.1 REST API in `backend/` (PostgreSQL, SimpleJWT, DRF)
- **Frontend:** React 19 + Vite SPA in `frontend/`
- **Database:** PostgreSQL (Neon serverless in docs), configured via `DATABASE_URL`
- **Local vs Docker:** Developers can run services either directly (Python/Node) or via `docker compose` (see `docs/DOCKER_GUIDE.md`).

Key documentation:
- `README.md` – high-level overview, quick start, API summary
- `docs/BACKEND_SETUP.md` – backend setup, environment, commands
- `docs/FRONTEND_SETUP.md` – frontend setup, environment, commands
- `docs/DEVELOPMENT_WORKFLOW.md` – branching, commit conventions
- `docs/DOCKER_GUIDE.md` – Docker-based workflow

## Local Development Commands

### Backend (Django API)

**Environment & dependencies**

```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate  # macOS/Linux
# On Windows: venv\Scripts\activate

pip install -r requirements.txt
pip install -r requirements-dev.txt

cp .env.example .env  # then edit DATABASE_URL, SECRET_KEY, etc.
```

**Run dev server**

```bash
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py runserver
# API root: http://localhost:8000/api/
# Admin:    http://localhost:8000/admin/
```

**Django management commands (common)**

```bash
python manage.py migrate
python manage.py makemigrations
python manage.py createsuperuser
python manage.py shell
python manage.py check
```

### Backend Testing & Linting

Backend tests are written with `pytest` + `pytest-django` and configured in `backend/pyproject.toml` (DJANGO_SETTINGS_MODULE, test discovery, options).

**Run full test suite (preferred)**

```bash
cd backend
source venv/bin/activate
pytest
```

Pytest is already wired to the Django settings module; no extra env vars are required beyond the usual `.env`/`DATABASE_URL`.

**Run tests with coverage (matches CI job)**

```bash
cd backend
source venv/bin/activate
pytest --cov=apps --cov-report=xml --cov-report=term-missing --tb=short
```

**Run a subset / single test**

Use standard pytest node selection:

```bash
cd backend
source venv/bin/activate
# Single file
pytest tests/authentication/test_login.py

# Single test function (file::TestClass::test_name)
pytest tests/authentication/test_login.py::TestLoginAPI::test_login_success

# By keyword expression
pytest -k "login and success"
```

The shared test configuration lives in `backend/tests/conftest.py` and `backend/tests/fixtures/`. Most API tests use DRF's `APIClient` and JWT fixtures from there.

**Code formatting & linting (Python)**

The backend uses Black, isort, Flake8, Bandit, and additional tooling (see `backend/pyproject.toml` and `backend/requirements-dev.txt`). CI runs Black, isort, Flake8, and Bandit.

Typical local checks:

```bash
cd backend
source venv/bin/activate

# Format
black .
isort .

# Lint
flake8 .

# Security scan (Bandit config is in pyproject.toml)
bandit -c pyproject.toml -r .
```

If you are aligning with CI exactly, mirror the `backend-ci.yml` steps.

### Frontend (React + Vite)

**Environment & dependencies**

```bash
cd frontend
npm install
cp .env.example .env.local  # then edit VITE_API_URL, etc.
```

`docs/FRONTEND_SETUP.md` documents the expected env variables, e.g. `VITE_API_URL=http://localhost:8000/api`.

**Run dev server**

```bash
cd frontend
npm run dev
# Frontend: http://localhost:5173
```

**Lint, build, preview**

These correspond to the CI workflow in `.github/workflows/frontend-ci.yml`:

```bash
cd frontend

npm run lint    # ESLint over the source tree
npm run build   # Vite production build
npm run preview # Preview the built app
```

No frontend test runner is configured in `frontend/package.json` as of this snapshot; adding tests will require introducing appropriate scripts.

## Docker-Based Workflow

For a fully containerized setup (no local Python/Node toolchain required), the project provides a Docker Compose workflow (see `docs/DOCKER_GUIDE.md`).

**First-time Docker setup**

```bash
# Ensure backend/.env exists
cp backend/.env.example backend/.env
# Then edit backend/.env with your PostgreSQL DATABASE_URL and other settings.
```

**Start all services**

```bash
docker compose up --build
```

Key URLs (defaults):
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api/`
- Admin: `http://localhost:8000/admin/`

**Common Docker commands**

```bash
# Lifecycle
docker compose up           # start (foreground)
docker compose up -d        # start detached
docker compose down         # stop

docker compose logs -f              # all services
docker compose logs -f backend      # backend only
docker compose logs -f frontend     # frontend only

# Django via Docker
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py test
```

Refer to `docs/DOCKER_GUIDE.md` for more scenarios and troubleshooting.

## Backend Architecture (Django)

The backend is a fairly standard Django REST project with a domain-driven app layout and centralized configuration.

### High-level layout

- `backend/sbcc/`
  - `settings.py` – global Django settings (installed apps, REST framework config, JWT, email, CORS, etc.)
  - `urls.py` – main URL router
  - `public_urls.py` – public (unauthenticated) API routes
  - `brevo_backend.py`, `email_backend.py` – email integration backends
- `backend/apps/` – domain-specific Django apps
  - `authentication/` – user model, auth endpoints, JWT handling
  - `members/`, `ministries/`, `events/`, `attendance/`, `inventory/`, `announcements/`, `prayer_requests/`, `visitors/`, `tasks/`, `meeting_minutes/`, `settings/`
  - Each app follows the usual Django structure: `models.py`, `serializers.py`, `views.py`, `urls.py`, potentially `filters.py` or submodules
- `backend/core/`
  - Aggregated/dashboards logic that composes data from multiple `apps.*` modules
  - Typically used for high-level stats and combined endpoints visible on the main dashboard
- `backend/common/`
  - Shared utilities and helpers (e.g., base viewsets, common mixins, pagination, permissions)
  - Cross-cutting concerns reused by multiple apps
- `backend/config/`
  - Additional configuration helpers (e.g., environment-loading, third-party integrations) to keep `settings.py` lean
- `backend/tests/`
  - Pytest-based test suite organized by domain (`announcements/`, `authentication/`, `meeting_minutes/`, `ministries/`, `prayer_requests/`, `settings/`, `tasks/`, `visitors/`)
  - Root `conftest.py` defines shared fixtures (users, JWT tokens, `APIClient`, DB connection handling)
  - `fixtures/` contains reusable factory/fixture modules
  - `test_public_api.py` covers the public API surface not tied to a single app

### Testing & configuration details

- Pytest is configured via `[tool.pytest.ini_options]` in `backend/pyproject.toml`:
  - `DJANGO_SETTINGS_MODULE = "sbcc.settings"`
  - `testpaths = ["tests"]`, `python_files` and `python_functions` patterns tuned for the suite
  - Extra warning filters for Django and reportlab deprecations
- Tests commonly rely on JWT-based auth fixtures (`auth_client`, `admin_client`, `super_admin_client`) and factory-style user creators from `tests/fixtures`.
- CI uses SQLite (`DATABASE_URL=sqlite:///db.sqlite3`) for test runs; local development can do the same if you want to avoid provisioning PostgreSQL for tests.

When adding new backend functionality, follow the existing pattern:
1. Create/extend a domain app in `backend/apps/<domain>/` (models → serializers → views → urls).
2. Wire URLs into either the domain app router or the main `sbcc/urls.py`/`public_urls.py`.
3. Add tests under `backend/tests/<domain>/` using shared fixtures.

## Frontend Architecture (React + Vite)

The frontend is a React 19 SPA built with Vite, Tailwind CSS, Flowbite, Zustand, and TanStack Query. It is organized by feature rather than by technical layer.

High-level structure (also documented in `docs/FRONTEND_SETUP.md`):

- `frontend/src/api/`
  - Axios instance configuration (base URL, interceptors for auth/JWT, error handling)
  - Low-level HTTP utilities shared across features
- `frontend/src/features/`
  - Feature modules (authentication, members, ministries, events, attendance, inventory, dashboard, announcements, prayer-requests, visitors, tasks, meeting-minutes, settings, etc.)
  - Each feature typically contains pages, feature-specific components, hooks, and API bindings
- `frontend/src/components/`
  - Shared UI building blocks (buttons, inputs, layout components, navigation, etc.) used across features
- `frontend/src/router/`
  - React Router configuration: route tree, protected routes, feature wiring
  - Connects URL paths to feature pages and handles layout/shell components
- `frontend/src/services/`
  - Higher-level API service functions grouped by domain, usually wrapping `api/` helpers and returning typed data
- `frontend/src/store/`
  - Zustand-based global state (e.g., auth state, UI preferences)
  - Often combined with TanStack Query for server state
- `frontend/src/hooks/`
  - Reusable React hooks (form helpers, query hooks, auth guards, layout helpers)
- `frontend/src/styles/` and `frontend/src/utils/`
  - Tailwind setup, global CSS
  - General-purpose utility functions and helpers shared across the app

The frontend depends heavily on the backend REST API; `VITE_API_URL` must point to the Django API root (commonly `http://localhost:8000/api`). When adjusting endpoints or payloads on the backend, be prepared to update corresponding service functions and query hooks on the frontend.

## CI Expectations

GitHub Actions workflows in `.github/workflows/` encode the minimum quality gates that changes should pass:

- **Backend CI (`backend-ci.yml`)**
  - Installs `requirements.txt` and `requirements-dev.txt`
  - Runs Black (check), isort (check-only), Flake8, Bandit
  - Executes pytest with coverage against `apps` and uploads coverage
- **Frontend CI (`frontend-ci.yml`)**
  - Uses Node 22
  - Installs dependencies via `npm ci`
  - Runs `npm run lint`
  - Runs `npm run build` with a production `VITE_API_URL`

When making changes, try to mirror these steps locally before expecting CI to pass.

## Git & Workflow Conventions

From `docs/DEVELOPMENT_WORKFLOW.md`:

- Long-lived branches:
  - `main` – production-ready
  - `dev` – integration branch for feature work
- Short-lived branch prefixes (from `dev`): `feature/`, `fix/`, `hotfix/`, `docs/`, `design/`, `refactor/`, `chore/`.
- Commit messages follow **Conventional Commits**, e.g.:
  - `feat(members): add member search functionality`
  - `fix(attendance): resolve duplicate check-in issue`

If you are ever asked to create branches or suggest commit messages, follow these conventions.

## MCP / Tooling Notes

The `.mcp/` directory contains MCP server configuration for external tools (e.g., GitHub Copilot / MCP-compatible clients):

- Node-based servers are defined in `.mcp/servers/` for React analysis, Notion integration, database access, etc.
- Dependencies and scripts are defined in `.mcp/package.json` (`npm install` inside `.mcp` to set up).
- Secrets (database URL, GitHub token, Notion API key) are expected to live in the editor's **user settings**, not in this repo; workspace settings reference them by key.

Warp itself does not require these settings to run the application, but be aware that some teammates may rely on these MCP servers for additional context and automation.
