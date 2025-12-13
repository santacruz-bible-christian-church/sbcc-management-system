# Docker Setup Guide

Guide for running SBCC Management System with Docker.

## For Existing Developers

> **Already have the project set up locally?** Docker is an **alternative** setup method. You don't need to switch if your current setup works.

### When to Use Docker

| Scenario | Recommendation |
|----------|----------------|
| Current local setup works fine | Keep using it |
| Fresh machine / new developer | Use Docker |
| Environment issues | Try Docker |
| Testing production build | Use Docker |

### Key Differences

| Local Setup | Docker Setup |
|-------------|--------------|
| Run `python manage.py runserver` | Run `docker compose up` |
| Run `npm run dev` | Included in `docker compose up` |
| Activate venv manually | Not needed |
| Install dependencies manually | Automatic |

### Switching Between Methods

You can use both methods. They don't conflict.

```bash
# Using Docker
docker compose up

# Using local setup (stop Docker first)
docker compose down
cd backend && source venv/bin/activate && python manage.py runserver
cd frontend && npm run dev
```

---

## What is Docker?

Docker runs applications in isolated containers. Instead of installing Python, Node.js, and databases manually, Docker handles everything automatically.

**Benefits:**
- Same environment for all developers
- No "works on my machine" issues
- One command to start everything

## Prerequisites

### Install Docker Desktop

1. Download [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Install and launch the application
3. Verify installation:

```bash
docker --version
docker compose version
```

## Quick Start (New Setup)

### 1. Set Up Environment

```bash
# If you don't have .env yet
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your database credentials (same as local setup).

### 2. Start the Application

```bash
docker compose up --build
```

**First run takes a few minutes** (downloading images).

### 3. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api/ |
| Admin Panel | http://localhost:8000/admin/ |

### 4. Create Admin User (if needed)

```bash
docker compose exec backend python manage.py createsuperuser
```

## Common Commands

### Start/Stop

```bash
docker compose up           # Start (with logs)
docker compose up -d        # Start in background
docker compose down         # Stop
docker compose restart      # Restart
```

### View Logs

```bash
docker compose logs -f              # All services
docker compose logs -f backend      # Backend only
docker compose logs -f frontend     # Frontend only
```

### Django Commands

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py shell
docker compose exec backend python manage.py test
```

### Rebuild After Dependency Changes

```bash
# After updating requirements.txt or package.json
docker compose up --build
```

## Command Comparison

| Task | Local | Docker |
|------|-------|--------|
| Start backend | `python manage.py runserver` | `docker compose up` |
| Start frontend | `npm run dev` | (included above) |
| Run migrations | `python manage.py migrate` | `docker compose exec backend python manage.py migrate` |
| Create superuser | `python manage.py createsuperuser` | `docker compose exec backend python manage.py createsuperuser` |
| Run tests | `python manage.py test` | `docker compose exec backend python manage.py test` |
| Install deps | `pip install -r requirements.txt` | `docker compose up --build` |

## Services Overview

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| backend | sbcc-backend | 8000 | Django REST API |
| frontend | sbcc-frontend | 5173 | React + Vite |

## Troubleshooting

### "Port already in use"

Your local servers might still be running.

```bash
# Stop local servers first, or stop Docker
docker compose down

# Or change ports in docker-compose.yml
```

### "Cannot connect to Docker daemon"

Open Docker Desktop and wait for it to start.

### Container keeps restarting

```bash
docker compose logs backend
```

Common issues:
- Missing `.env` file
- Invalid `DATABASE_URL`

### Changes not reflecting

- **Frontend:** Should auto-reload (Vite HMR)
- **Backend:** Restart container: `docker compose restart backend`

### Reset everything

```bash
docker compose down -v
docker compose up --build
```

## Without Docker

Prefer manual setup? See:
- [Backend Setup Guide](BACKEND_SETUP.md)
- [Frontend Setup Guide](FRONTEND_SETUP.md)

---

**Last Updated:** December 5, 2025
