# SBCC Management System

A web-based church management platform for Santa Cruz Bible Christian Church.

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)]()
[![Python](https://img.shields.io/badge/python-3.12-blue.svg)]()
[![Django](https://img.shields.io/badge/django-5.1.4-green.svg)]()
[![React](https://img.shields.io/badge/react-19.1.1-blue.svg)]()

## Overview

SBCC Management System streamlines church operations including membership management, attendance tracking, event coordination, volunteer scheduling, and inventory management.

**Course:** CMSC 309 - Software Engineering I
**Client:** Santa Cruz Bible Christian Church
**Status:** Active Development

## Features

| Module | Status | Description |
|--------|--------|-------------|
| Authentication | ✅ Complete | JWT-based auth with role management |
| Members | ✅ Complete | Member profiles, birthdays, anniversaries |
| Ministries | ✅ Complete | Ministry management, volunteer scheduling |
| Events | ✅ Complete | Event calendar with registration |
| Attendance | ✅ Complete | Digital tracking with reports |
| Inventory | ✅ Complete | Equipment and resource tracking |
| Dashboard | ✅ Complete | Analytics and reporting |
| Prayer Requests | 🚧 In Progress | Digital submission and tracking |
| Meeting Minutes | 🚧 In Progress | Document management |
| Announcements | 🚧 In Progress | Church-wide communication |
| Tasks | 🚧 In Progress | Task assignment system |

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite, Tailwind CSS, Flowbite React |
| Backend | Django 5.1, Django REST Framework |
| Database | PostgreSQL (Neon Serverless) |
| Auth | JWT (SimpleJWT) |

## Quick Start

```bash
# Clone
git clone https://github.com/emperuna/sbcc-management-system.git
cd sbcc-management-system

# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

**Backend:** http://localhost:8000
**Frontend:** http://localhost:5173

## Documentation

| Document | Description |
|----------|-------------|
| [Backend Setup](docs/BACKEND_SETUP.md) | Django installation, configuration, troubleshooting |
| [Frontend Setup](docs/FRONTEND_SETUP.md) | React setup, API integration, styling |
| [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md) | Git workflow, conventions, code review |
| [Product Requirements](docs/SBCC_PRD.md) | Full project requirements and specifications |

## Project Structure

```
sbcc-management-system/
├── backend/              # Django REST API
│   ├── apps/             # Feature modules
│   ├── common/           # Shared utilities
│   ├── core/             # Dashboard aggregation
│   └── sbcc/             # Django settings
├── frontend/             # React SPA
│   ├── src/features/     # Feature modules
│   ├── src/components/   # Shared components
│   └── src/services/     # API services
└── docs/                 # Documentation
```

## API Reference

| Endpoint | Description |
|----------|-------------|
| `/api/auth/` | Authentication (login, register, token) |
| `/api/members/` | Member CRUD operations |
| `/api/ministries/` | Ministry and volunteer management |
| `/api/events/` | Event and registration management |
| `/api/attendance/` | Attendance tracking and reports |
| `/api/inventory/` | Inventory management |
| `/api/dashboard/` | Statistics and activities |

## Team

**Lead Developer:** Jeremy M. Garin ([@emperuna](https://github.com/emperuna))

| Member | Member |
|--------|--------|
| Agojo, Nigel | Mendez, Jerick |
| Alberto, Marc Justin | Mendoza, Nick Narry |
| Aquino, Jose | Nazareno, Ross Cedric |
| Eleazar, CJ | Taquilid, Ella Edz |

## Contributing

1. Create a feature branch: `feature/your-feature`
2. Follow [conventional commits](https://www.conventionalcommits.org/)
3. Submit a pull request

See [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md) for details.

## License

Copyright © 2025 SBCC Management System Team
Developed for Santa Cruz Bible Christian Church as part of CMSC 309 coursework.

---

**Instructor:** Prof. Reynalen Justo
**Institution:** Laguna State Polytechnic University - Santa Cruz Campus
