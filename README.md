# Santa Cruz Bible Christian Church Management System

A comprehensive web-based platform designed to streamline church operations including membership management, attendance tracking, event coordination, volunteer scheduling, pastoral care, and inventory management.

## 🎯 Project Overview

**Course:** CMSC 309 - Software Engineering I  
**Client:** Santa Cruz Bible Christian Church  
**Team Size:** 9 Developers  

### Team Members
- Agojo, Nigel
- Alberto, Marc Justin
- Aquino, Jose
- Eleazar, CJ
- Garin, Jeremy
- Mendez, Jerick
- Mendoza, Nick Narry
- Nazareno, Ross Cedric
- Taquilid, Ella Edz

---

## ✨ Key Features

### Core Functionality
- 🔐 **Authentication & Security** - Role-based access control (Admin, Pastor, Ministry Leader, Volunteer, Member)
- 👥 **Membership Management** - Centralized member database with profiles, baptism records, and ministry assignments
- ✅ **Attendance Tracking** - Digital attendance recording for services and events
- 📅 **Event & Calendar System** - Church-wide calendar with event management
- 🤝 **Volunteer Management** - Automated scheduling and email notifications
- 🙏 **Prayer Requests** - Digital submission and pastoral care tracking
- 📦 **Inventory Tracking** - Equipment and resource management
- 📄 **Document Management** - Centralized storage for sermons, minutes, and resources
- 📢 **Communication Module** - Announcements and mass email functionality

### MVP Priority Features (Phase 1)
1. Authentication & User Management
2. Membership Database (CRUD operations)
3. Attendance Tracking
4. Event Calendar
5. Volunteer Scheduling
6. Email Notifications

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **Component Library:** Flowbite React
- **UI/UX Design:** Figma
- **State Management:** React Context API / TanStack Query

### Backend
- **Framework:** Django 5.1.2
- **API:** Django REST Framework 3.15.2
- **Database:** PostgreSQL (Neon - Serverless)
- **Authentication:** JWT (JSON Web Tokens)
- **Email:** Django Email Backend

### Database
- **Production:** PostgreSQL (Neon)
- **Features:** Serverless, auto-scaling, built-in branching
- **Connection:** `dj-database-url` for configuration

### DevOps
- **Version Control:** Git & GitHub
- **Deployment:** TBD (AWS, DigitalOcean, or Heroku)
- **CI/CD:** GitHub Actions (planned)

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git
- PostgreSQL (or Neon account)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/sbcc-management-system.git
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
   # Edit .env with your Neon database credentials
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

   Backend runs at: `http://localhost:8000`  
   Admin panel: `http://localhost:8000/admin`

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
   # Update with backend API URL
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend runs at: `http://localhost:5173`

---

## 📁 Project Structure

```
sbcc-management-system/
├── backend/                    # Django backend
│   ├── core/                   # Core app (models, views, serializers)
│   ├── sbcc/                   # Project settings
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   └── start-backend.sh
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── utils/             # Utility functions
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── docs/                       # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── FRONTEND_SETUP.md
│   └── BACKEND_SETUP.md
├── .gitignore
└── README.md
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest                          # Run all tests
pytest --cov                    # Run with coverage
pytest --cov --cov-report=html  # Generate HTML coverage report
```

**Coverage Target:** 80%

### Frontend Tests
```bash
cd frontend
npm run test              # Run unit tests
npm run test:coverage     # Run with coverage
npm run test:e2e          # Run end-to-end tests (Playwright)
```

**Coverage Target:** 70%

---

## 🔐 Environment Variables

### Backend (`.env`)
```env
# Database (Get from Neon dashboard)
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# Django
SECRET_KEY=your-secret-key-here
DEBUG=True

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=SBCC Management System
```

---

## 👥 User Roles & Permissions

| Role | Permissions |
|------|------------|
| **Super Admin** | Full system access, manage all data, user management |
| **Pastor/Elder** | Manage prayer requests, pastoral care, view all members |
| **Ministry Leader** | Manage their ministry, volunteer schedules, attendance |
| **Volunteer** | View schedules, submit availability, view public info |
| **Member** | Self-service portal, submit prayer requests, view events |

---

## 📊 Database Schema

### Core Models
- **User** - Authentication and authorization
- **Member** - Church member profiles
- **Ministry** - Ministry/department information
- **Event** - Church events and services
- **Attendance** - Attendance records
- **VolunteerSchedule** - Volunteer assignments
- **PrayerRequest** - Prayer request tracking
- **Inventory** - Equipment and resource tracking
- **Document** - File storage and versioning

See [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) for detailed ERD and relationships.

---

## 🤝 Contributing

### Git Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

3. **Push to GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**
   - Request code review from 1-2 team members
   - Address feedback
   - Merge when approved

### Commit Message Convention
```
feat: new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

### Code Style
- **Python:** Follow PEP 8 (use `black` for formatting)
- **JavaScript:** Follow Airbnb style guide (use `eslint`)
- **Components:** Use functional components with hooks

---

## 📚 Documentation

- [Backend Setup Guide](docs/BACKEND_SETUP.md)
- [Frontend Setup Guide](docs/FRONTEND_SETUP.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Testing Guide](docs/TESTING_PLAN.md)

---

## 🐛 Known Issues

- None yet (project in early development)

---

## 📝 License

This project is developed as part of CMSC 309 coursework at Laguna State Polytechnic University - Santa Cruz Campus.  
All rights reserved by the development team and Santa Cruz Bible Christian Church.

---

## 📞 Contact

**Project Lead:** Jeremy M. Garin  
**Email:** garinjeremy6@gmail.com

---

## 🙏 Acknowledgments

- Santa Cruz Bible Christian Church for the opportunity
- Prof. Reynalen Justo - CMSC 309 Instructor
- All team members for their dedication