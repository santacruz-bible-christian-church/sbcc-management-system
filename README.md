<div align="center">

# 🏛️ SBCC Management System

**A comprehensive church management platform for Santa Cruz Bible Christian Church**

[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)]()
[![Django](https://img.shields.io/badge/Django-5.1-092E20?logo=django&logoColor=white)]()
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)]()
[![Status](https://img.shields.io/badge/Status-Production-brightgreen)]()

</div>

---

## 📋 Overview

SBCC Management System is a modern, full-stack web application designed to streamline church operations. Built with **Django REST Framework** and **React**, it provides a robust solution for managing memberships, events, attendance, volunteers, and more.

<div align="center">

|           🎯 **Client**           |           📚 **Course**           |    🏫 **Institution**    |
| :-------------------------------: | :-------------------------------: | :----------------------: |
| Santa Cruz Bible Christian Church | CMSC 309 - Software Engineering I | LSPU - Santa Cruz Campus |

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 👥 Core Modules

- **Authentication** — JWT-based auth with role management
- **Members** — Profiles, birthdays, anniversaries
- **Ministries** — Volunteer scheduling & rotation
- **Events** — Calendar with registration
- **Attendance** — Digital tracking & reports

</td>
<td width="50%">

### 📊 Management Tools

- **Inventory** — Equipment & resource tracking
- **Dashboard** — Analytics & insights
- **Tasks** — Assignment with timeline
- **Announcements** — Church-wide communication
- **Prayer Requests** — Digital submission

</td>
</tr>
<tr>
<td>

### 📁 Document Management

- **Meeting Minutes** — Version-controlled documents
- **Visitors** — Tracking & conversion pipeline
- **Settings** — System configuration & branding

</td>
<td>

### 🌐 Public API

- Public announcements endpoint
- Public events listing
- Prayer request submission
- Church information API

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="25%">

**Frontend**

![React](https://img.shields.io/badge/-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/-Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

</td>
<td align="center" width="25%">

**Backend**

![Django](https://img.shields.io/badge/-Django_5.1-092E20?style=flat-square&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/-REST_Framework-ff1709?style=flat-square&logo=django&logoColor=white)
![Python](https://img.shields.io/badge/-Python_3.12-3776AB?style=flat-square&logo=python&logoColor=white)

</td>
<td align="center" width="25%">

**Database**

![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Neon](https://img.shields.io/badge/-Neon-00E599?style=flat-square&logo=neon&logoColor=black)

</td>
<td align="center" width="25%">

**Auth & Security**

![JWT](https://img.shields.io/badge/-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![SimpleJWT](https://img.shields.io/badge/-SimpleJWT-092E20?style=flat-square&logo=django&logoColor=white)

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

- Python 3.12
- Node.js 18+
- PostgreSQL (or Neon account)

### Installation

```bash
# Clone the repository
git clone https://github.com/emperuna/sbcc-management-system.git
cd sbcc-management-system
```

<details>
<summary><b>🔧 Backend Setup</b></summary>

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

</details>

<details>
<summary><b>⚛️ Frontend Setup</b></summary>

```bash
cd frontend
npm install
npm run dev
```

</details>

### Access Points

| Service        | URL                          |
| -------------- | ---------------------------- |
| 🖥️ Frontend    | http://localhost:5173        |
| ⚙️ Backend API | http://localhost:8000/api/   |
| 🔐 Admin Panel | http://localhost:8000/admin/ |

---

## 📁 Project Structure

```
sbcc-management-system/
├── 📂 backend/                 # Django REST API
│   ├── 📂 apps/               # Feature modules (12 apps)
│   ├── 📂 common/             # Shared utilities
│   ├── 📂 core/               # Dashboard aggregation
│   ├── 📂 tests/              # Test suites (35 test files)
│   └── 📂 sbcc/               # Django settings
├── 📂 frontend/               # React SPA
│   ├── 📂 src/features/       # Feature modules (16 features)
│   ├── 📂 src/components/     # Shared components
│   └── 📂 src/hooks/          # Custom hooks
└── 📂 docs/                   # Documentation
```

---

## 📚 Documentation

| Document                                                | Description                         |
| :------------------------------------------------------ | :---------------------------------- |
| 📘 [Backend Setup](docs/BACKEND_SETUP.md)               | Django installation & configuration |
| 📗 [Frontend Setup](docs/FRONTEND_SETUP.md)             | React setup & API integration       |
| 📙 [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md) | Git workflow & conventions          |
| 📕 [Product Requirements](docs/SBCC_PRD.md)             | Full specifications                 |

---

## 🔌 API Reference

<details>
<summary><b>View All Endpoints</b></summary>

| Endpoint                | Description                             |
| ----------------------- | --------------------------------------- |
| `/api/auth/`            | Authentication (login, register, token) |
| `/api/members/`         | Member CRUD operations                  |
| `/api/ministries/`      | Ministry and volunteer management       |
| `/api/events/`          | Event and registration management       |
| `/api/attendance/`      | Attendance tracking and reports         |
| `/api/inventory/`       | Inventory management                    |
| `/api/dashboard/`       | Statistics and activities               |
| `/api/announcements/`   | Church announcements                    |
| `/api/prayer-requests/` | Prayer request management               |
| `/api/visitors/`        | Visitor tracking                        |
| `/api/settings/`        | System configuration                    |
| `/api/tasks/`           | Task management                         |
| `/api/meeting-minutes/` | Meeting minutes and documents           |
| `/api/public/*`         | Public APIs (no auth required)          |

</details>

---

## 📄 License

<div align="center">

**PROPRIETARY SOFTWARE**

Copyright © 2025-2026 Santa Cruz Bible Christian Church. All rights reserved.

Unauthorized copying, modification, or distribution is strictly prohibited.

---

**Instructor:** Prof. Reynalen Justo
**Institution:** Laguna State Polytechnic University - Santa Cruz Campus

</div>
