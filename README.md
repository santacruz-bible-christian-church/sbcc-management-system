# Santa Cruz Bible Christian Church Management System

A comprehensive web-based platform designed to streamline church operations including membership management, attendance tracking, event coordination, volunteer scheduling, pastoral care, and inventory management.

## 🎯 Project Overview

**Course:** CMSC 309 - Software Engineering I
**Client:** Santa Cruz Bible Christian Church
**Team Size:** 9 Developers
**Status:** Active Development

### Team Members
- **Lead Developer:** Jeremy M. Garin (emperuna)
- Agojo, Nigel
- Alberto, Marc Justin
- Aquino, Jose
- Eleazar, CJ
- Mendez, Jerick
- Mendoza, Nick Narry
- Nazareno, Ross Cedric
- Taquilid, Ella Edz

---

## ✨ Key Features

### Core Modules (Implemented)
- ✅ **Authentication** - JWT-based auth with role management
- ✅ **Membership** - Member profiles with ministry assignments
- ✅ **Ministries** - Ministry/department management with volunteer scheduling
- ✅ **Events** - Church calendar with event registration
- ✅ **Attendance** - Digital attendance tracking with sheets
- ✅ **Inventory** - Equipment and resource management
- ✅ **Dashboard** - Analytics and reporting

### Future Features
- 🔜 **Prayer Requests** - Digital submission and tracking
- 🔜 **Meeting Minutes** - Document management
- 🔜 **Announcements** - Church-wide communication
- 🔜 **Tasks** - Task assignment and tracking
- 🔜 **Volunteers** - Advanced volunteer management

### User Roles
- **Admin** - Full system access
- **Pastor** - Pastoral care, member management
- **Staff** - Ministry operations, event management
- **Member** - Self-service portal, event registration

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** React 19.1.1 with Vite 7.1.7
- **Styling:** Tailwind CSS 3.4.18
- **Component Library:** Flowbite React 0.12.10, Flowbite 3.1.2
- **Icons:** Lucide React 0.545.0, React Icons 5.5.0
- **HTTP Client:** Axios 1.12.2
- **State Management:** Zustand 5.0.8, TanStack Query 5.90.2
- **Routing:** React Router DOM 7.9.4
- **Forms:** React Hook Form 7.65.0, Zod 4.1.12
- **PDF Generation:** jsPDF 3.0.3
- **QR Codes:** qrcode.react 4.2.0
- **Date Utilities:** date-fns 4.1.0

### Backend
- **Framework:** Django 5.1.4
- **API:** Django REST Framework 3.15.2
- **Authentication:** djangorestframework-simplejwt 5.5.1
- **Database:** PostgreSQL via Neon (Serverless)
- **Database Driver:** psycopg2-binary 2.9.10
- **CORS:** django-cors-headers 4.5.0
- **Filtering:** django-filter 24.3
- **PDF Generation:** reportlab 4.2.5
- **Environment:** python-decouple 3.8

### Database
- **Provider:** Neon (Serverless PostgreSQL)
- **Connection Pooling:** dj-database-url 2.2.0
- **Features:** Auto-scaling, branching support, health checks

### Development Tools
- **Code Quality:** ESLint, Black (Python formatter)
- **Version Control:** Git, GitHub
- **API Testing:** Django REST Framework Browsable API

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL (Neon account recommended)

### Setup
```bash
# Clone repository
git clone https://github.com/emperuna/sbcc-management-system.git
cd sbcc-management-system

# Backend setup
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Configure your DATABASE_URL
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver  # http://localhost:8000

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev  # http://localhost:5173
```

For detailed setup instructions, see:
- [Backend Setup Guide](docs/BACKEND_SETUP.md)
- [Frontend Setup Guide](docs/FRONTEND_SETUP.md)

---

## 📁 Project Architecture

### High-Level Structure
```
sbcc-management-system/
├── backend/          # Django REST API
├── frontend/         # React SPA
└── docs/             # Documentation
```

### Backend (Feature-Based Architecture)
```
backend/apps/
├── authentication/   # ✅ User & JWT auth
├── members/          # ✅ Member management
├── ministries/       # ✅ Ministry & volunteer scheduling
├── events/           # ✅ Events & registration
├── attendance/       # ✅ Attendance tracking
├── inventory/        # ✅ Equipment tracking
├── prayer_requests/  # 🚧 In progress
├── meeting_minutes/  # 🚧 In progress
├── announcements/    # 🚧 In progress
└── tasks/            # 🚧 In progress
```

### Frontend (Feature-Based Architecture)
```
frontend/src/
├── features/         # Feature modules
│   ├── auth/        # Authentication
│   ├── members/     # Member management
│   ├── ministries/  # Ministry management
│   ├── events/      # Event management
│   ├── attendance/  # Attendance tracking
│   └── dashboard/   # Dashboard & analytics
├── components/      # Shared UI components
├── services/        # API services
├── store/           # State management
└── router/          # Routing configuration
```

For detailed structure, see [Backend Setup](docs/BACKEND_SETUP.md) and [Frontend Setup](docs/FRONTEND_SETUP.md).

---

## 🗄️ Database Schema

### Database Models

**Authentication:**
- `User` - Custom user model with role-based permissions

**Core Modules:**
- `Member` - Church member profiles (linked to User)
- `Ministry` - Church ministries/departments
- `MinistryMember` - Ministry membership relationships
- `Shift` - Volunteer shifts for ministry scheduling
- `Assignment` - Volunteer shift assignments
- `Event` - Church events with registration system
- `EventRegistration` - Event-specific member registrations
- `AttendanceSheet` - Attendance tracking sheets per event
- `Attendance` - Individual attendance records
- `InventoryTracking` - Equipment and resource tracking

### Key Relationships
```
User (1) ──→ (1) Member
Ministry (1) ──→ (*) MinistryMember ──→ (1) Member
Ministry (1) ──→ (*) Shift
Shift (1) ──→ (*) Assignment ──→ (1) User
Event (1) ──→ (*) EventRegistration ──→ (1) Member
Event (1) ──→ (*) AttendanceSheet ──→ (*) Attendance ──→ (1) Member
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (get JWT tokens)
- `POST /api/auth/refresh/` - Refresh access token
- `POST /api/auth/logout/` - Logout (blacklist token)
- `GET /api/auth/profile/` - Get current user profile

### Members
- `GET /api/members/` - List members
- `POST /api/members/` - Create member
- `GET /api/members/{id}/` - Retrieve member
- `PUT /api/members/{id}/` - Update member
- `DELETE /api/members/{id}/` - Delete member

### Ministries
- `GET /api/ministries/` - List ministries
- `POST /api/ministries/` - Create ministry
- `GET /api/ministries/{id}/` - Retrieve ministry
- `PUT /api/ministries/{id}/` - Update ministry
- `DELETE /api/ministries/{id}/` - Delete ministry
- `GET /api/ministries/members/` - List ministry members
- `POST /api/ministries/members/` - Add ministry member
- `GET /api/ministries/shifts/` - List ministry shifts
- `POST /api/ministries/shifts/` - Create ministry shift
- `GET /api/ministries/assignments/` - List shift assignments
- `POST /api/ministries/assignments/` - Create shift assignment
- `POST /api/ministries/assignments/rotate/` - Auto-rotate assignments

### Events
- `GET /api/events/` - List events
- `POST /api/events/` - Create event
- `GET /api/events/{id}/` - Retrieve event
- `PUT /api/events/{id}/` - Update event
- `DELETE /api/events/{id}/` - Delete event
- `POST /api/events/{id}/register/` - Register for event
- `DELETE /api/events/{id}/unregister/` - Unregister from event
- `GET /api/events/{id}/registrations/` - List event registrations

### Attendance
- `GET /api/attendance/sheets/` - List attendance sheets
- `POST /api/attendance/sheets/` - Create attendance sheet
- `GET /api/attendance/sheets/{id}/` - Retrieve attendance sheet
- `POST /api/attendance/sheets/{id}/mark_present/` - Mark member present
- `POST /api/attendance/sheets/{id}/update_attendances/` - Bulk update
- `GET /api/attendance/sheets/{id}/download/` - Download CSV
- `GET /api/attendance/records/` - List attendance records
- `GET /api/attendance/records/member_summary/` - Member summary
- `GET /api/attendance/records/ministry_report/` - Ministry report

### Inventory
- `GET /api/inventory/` - List inventory items
- `POST /api/inventory/` - Create inventory item
- `GET /api/inventory/{id}/` - Retrieve inventory item
- `PUT /api/inventory/{id}/` - Update inventory item
- `DELETE /api/inventory/{id}/` - Delete inventory item

### Dashboard
- `GET /api/dashboard/stats/` - Dashboard statistics
- `GET /api/dashboard/activities/` - Recent activities

---

## 🤝 Contributing

We follow a feature-based Git workflow with conventional commits.

**Branch naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation
- `design/` - UI/UX changes

**Commit format:**
```
feat: add new feature
fix: resolve bug
docs: update documentation
```

See [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md) for detailed guidelines.

---

## 📚 Documentation

- **[Backend Setup Guide](docs/BACKEND_SETUP.md)** - Django/DRF configuration, database setup, troubleshooting
- **[Frontend Setup Guide](docs/FRONTEND_SETUP.md)** - React/Vite configuration, API integration, styling
- **[Development Workflow](docs/DEVELOPMENT_WORKFLOW.md)** - Git workflow, code review, testing guidelines

---

## 📝 Development Status

### ✅ Completed Features
- ✅ Authentication system with JWT
- ✅ User management with role-based access
- ✅ Member management with filtering & search
- ✅ Ministry management with department structure
- ✅ Ministry member relationships
- ✅ Volunteer shift scheduling
- ✅ Event management with registration
- ✅ Attendance tracking with sheets
- ✅ Attendance reports (member & ministry)
- ✅ Inventory tracking system
- ✅ Dashboard analytics
- ✅ CSV import/export functionality
- ✅ PDF generation for reports
- ✅ QR code generation for members
- ✅ Birthday & anniversary tracking
- ✅ Responsive frontend UI

### 🚧 In Progress
- 🚧 Prayer request management
- 🚧 Meeting minutes system
- 🚧 Announcements module
- 🚧 Task assignment system
- 🚧 Advanced volunteer management

### 🔜 Planned Features
- 🔜 Email notifications
- 🔜 Advanced reporting & analytics
- 🔜 Data export tools

---

## 📝 License

This project is developed as part of CMSC 309 coursework at Laguna State Polytechnic University - Santa Cruz Campus.

**Copyright © 2025 SBCC Management System Team**
All rights reserved by the development team and Santa Cruz Bible Christian Church.

---

## 📞 Contact

**Project Lead:** Jeremy M. Garin
**GitHub:** [@emperuna](https://github.com/emperuna)
**Email:** garinjeremy6@gmail.com

**Instructor:** Prof. Reynalen Justo
**Course:** CMSC 309 - Software Engineering I

---

## 🙏 Acknowledgments

- Santa Cruz Bible Christian Church for trusting us with this project
- Prof. Reynalen Justo for guidance and mentorship
- All team members for their dedication and hard work
- Neon for providing serverless PostgreSQL hosting
- Open-source community for excellent tools and frameworks
