# Santa Cruz Bible Christian Church Management System

A comprehensive web-based platform designed to streamline church operations including membership management, attendance tracking, event coordination, volunteer scheduling, pastoral care, and inventory management.

## 🎯 Project Overview

**Course:** CMSC 309 - Software Engineering I  
**Client:** Santa Cruz Bible Christian Church  
**Team Size:** 9 Developers  
**Target Deadline:** November 9, 2025 (Prototype Demo)

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

### Phase 1: Core Modules (Prototype - Nov 9, 2025)
- 🔐 **Authentication** - JWT-based auth with role management
- 👥 **Membership** - Member profiles with ministry assignments
- 🏛️ **Ministries** - Ministry/department management
- 📅 **Events** - Church calendar with event registration
- ✅ **Attendance** - Digital attendance tracking

### Phase 2: Extended Features (Post-Prototype)
- 🤝 **Volunteer Scheduling** - Automated rotational scheduling
- 🙏 **Prayer Requests** - Digital submission and tracking
- 📦 **Inventory** - Equipment and resource management
- 📄 **Meeting Minutes** - Document management
- 📢 **Announcements** - Church-wide communication
- 📊 **Dashboard** - Analytics and reporting

### User Roles
- **Admin** - Full system access
- **Pastor** - Pastoral care, member management
- **Staff** - Ministry operations, event management
- **Member** - Self-service portal, event registration

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** React 18.3.1 with Vite 5.4.11
- **Styling:** Tailwind CSS 3.4.14
- **Component Library:** Flowbite React 0.10.2
- **Icons:** React Icons 5.3.0, Heroicons
- **HTTP Client:** Axios 1.7.7
- **State Management:** Zustand 5.0.1
- **Routing:** React Router DOM 6.28.0

### Backend
- **Framework:** Django 5.1.4
- **API:** Django REST Framework 3.15.2
- **Authentication:** djangorestframework-simplejwt 5.5.1
- **Database:** PostgreSQL via Neon (Serverless)
- **Database Driver:** psycopg2-binary 2.9.10
- **CORS:** django-cors-headers 4.5.0
- **Filtering:** django-filter 24.3
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

## 🚀 Getting Started

### Prerequisites
- **Python:** 3.12+ (Project uses Python 3.12)
- **Node.js:** 18+
- **Git:** Latest version
- **Database:** Neon PostgreSQL account (or local PostgreSQL)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/emperuna/sbcc-management-system.git
   cd sbcc-management-system/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   # Or use the convenience script:
   ./start-backend.sh
   ```

   **Backend URLs:**
   - API: `http://localhost:8000/api/`
   - Admin: `http://localhost:8000/admin/`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   **Frontend URL:** `http://localhost:5173`

---

## 📁 Project Structure

```
sbcc-management-system/
├── backend/                    # Django REST API
│   ├── apps/                   # Django applications
│   │   ├── authentication/     # User auth & JWT
│   │   ├── members/            # Member profiles
│   │   ├── ministries/         # Ministry management
│   │   ├── events/             # Event & registration system
│   │   ├── attendance/         # Attendance tracking
│   │   ├── announcements/      # Announcements (future)
│   │   ├── inventory/          # Inventory (future)
│   │   ├── meeting_minutes/    # Minutes (future)
│   │   ├── prayer_requests/    # Prayer requests (future)
│   │   ├── tasks/              # Task management (future)
│   │   └── volunteers/         # Volunteer system (future)
│   ├── common/                 # Shared utilities
│   │   ├── exceptions.py       # Custom exceptions
│   │   ├── permissions.py      # DRF permissions
│   │   ├── utils.py            # Helper functions
│   │   └── validators.py       # Custom validators
│   ├── core/                   # Dashboard aggregation
│   ├── sbcc/                   # Django settings
│   │   ├── settings.py         # Configuration
│   │   ├── urls.py             # URL routing
│   │   └── wsgi.py             # WSGI config
│   ├── tests/                  # Test suite
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/                   # React application
│   ├── src/
│   │   ├── api/                # API client modules
│   │   ├── components/         # Reusable components
│   │   │   ├── forms/          # Form components
│   │   │   ├── layout/         # Layout components
│   │   │   └── ui/             # UI primitives
│   │   ├── features/           # Feature modules
│   │   │   ├── auth/           # Authentication
│   │   │   ├── dashboard/      # Dashboard
│   │   │   ├── events/         # Events management
│   │   │   ├── members/        # Member management
│   │   │   └── attendance/     # Attendance tracking
│   │   ├── hooks/              # Custom React hooks
│   │   ├── router/             # Routing configuration
│   │   ├── services/           # Business logic
│   │   ├── store/              # State management (Zustand)
│   │   ├── styles/             # Global styles
│   │   ├── utils/              # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── docs/                       # Documentation
│   ├── BACKEND_SETUP.md
│   ├── FRONTEND_SETUP.md
│   └── DEVELOPMENT_WORKFLOW.md
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🔐 Environment Variables

### Backend (`.env`)
```env
# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# CORS (Frontend URL)
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Email (Optional - for future notifications)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_HOST_USER=your-email@gmail.com
# EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🗄️ Database Schema

### Current Models (Phase 1)

**Authentication:**
- `User` - Custom user model with role-based permissions

**Core Modules:**
- `Member` - Church member profiles (linked to User)
- `Ministry` - Church ministries/departments
- `Event` - Church events with registration system
- `EventRegistration` - Event-specific member registrations
- `Attendance` - General attendance tracking

### Relationships
```
User (1) ──→ (1) Member
User (1) ──→ (*) Ministry (as leader)
Ministry (1) ──→ (*) Member
Ministry (1) ──→ (*) Event
Event (1) ──→ (*) EventRegistration
Member (1) ──→ (*) EventRegistration
Event (1) ──→ (*) Attendance
Member (1) ──→ (*) Attendance
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

### Events
- `GET /api/events/` - List events
- `POST /api/events/` - Create event
- `GET /api/events/{id}/` - Retrieve event
- `PUT /api/events/{id}/` - Update event
- `DELETE /api/events/{id}/` - Delete event
- `POST /api/events/{id}/register/` - Register for event
- `DELETE /api/events/{id}/unregister/` - Unregister from event
- `GET /api/events/{id}/registrations/` - List event registrations
- `GET /api/events/{id}/attendance_report/` - Get attendance report

### Attendance
- `GET /api/attendance/` - List attendance records
- `POST /api/attendance/` - Record attendance
- `GET /api/attendance/{id}/` - Retrieve attendance record

---

## 🤝 Contributing

### Git Workflow

1. **Create feature branch from main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

3. **Keep branch updated**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

4. **Push to GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Use PR template (if available)
   - Request review from lead developer
   - Address feedback promptly
   - Ensure CI checks pass
   - Merge only when approved

### Branch Naming Convention
- `feature/` - New features (e.g., `feature/event-registration`)
- `fix/` - Bug fixes (e.g., `fix/login-validation`)
- `refactor/` - Code refactoring (e.g., `refactor/events-module`)
- `docs/` - Documentation (e.g., `docs/api-endpoints`)
- `design/` - UI/UX changes (e.g., `design/events-page`)

### Commit Message Convention
```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: restructure code
test: add tests
chore: maintenance tasks
```

### Code Style Guidelines

**Python (Backend):**
- Follow PEP 8
- Use `black` for formatting
- Maximum line length: 100 characters
- Use type hints where applicable

**JavaScript (Frontend):**
- Use ESLint configuration
- Prefer functional components with hooks
- Use meaningful variable names
- Keep components small and focused

### Code Review Checklist
- [ ] Code follows project style guidelines
- [ ] No cache files (`__pycache__`, `.pyc`) committed
- [ ] Environment variables used (no hard-coded credentials)
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated (if needed)
- [ ] PR description is clear and complete
- [ ] Branch is up-to-date with main
- [ ] All CI checks passing

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test                    # Run all tests
python manage.py test apps.events       # Test specific app
pytest --cov                             # Run with coverage (if pytest installed)
```

### Frontend Tests
```bash
cd frontend
npm run test              # Run unit tests
npm run test:coverage     # Generate coverage report
```

**Note:** Comprehensive test suite to be implemented in Phase 2.

---

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check Python version: `python --version` (should be 3.12+)
- Verify virtual environment is activated
- Ensure all dependencies installed: `pip install -r requirements.txt`
- Check `DATABASE_URL` in `.env` is correct

**Frontend won't start:**
- Check Node version: `node --version` (should be 18+)
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

**Database connection errors:**
- Verify Neon database is active
- Check `DATABASE_URL` format and credentials
- Test connection manually with `psql` or database client

**CORS errors:**
- Verify `CORS_ALLOWED_ORIGINS` in backend settings
- Check frontend API URL matches backend URL

---

## 📚 Documentation

- [Backend Setup Guide](docs/BACKEND_SETUP.md) - Detailed backend configuration
- [Frontend Setup Guide](docs/FRONTEND_SETUP.md) - Detailed frontend configuration
- [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md) - Team collaboration guidelines

---

## 📝 Development Status

### Phase 1: Prototype (Target: Nov 9, 2025)
- ✅ Authentication system
- ✅ Member management
- ✅ Ministry management
- ✅ Event system with registration
- ✅ Attendance tracking
- ✅ Frontend UI/UX for core modules
- 🚧 Dashboard analytics (in progress)

### Phase 2: Extended Features (Post-Prototype)
- ⏳ Volunteer scheduling
- ⏳ Prayer request management
- ⏳ Inventory tracking
- ⏳ Meeting minutes
- ⏳ Announcements system
- ⏳ Email notifications
- ⏳ Advanced reporting

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