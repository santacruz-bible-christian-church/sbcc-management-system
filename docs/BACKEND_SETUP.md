# Backend Setup Guide

Complete guide for setting up the Django backend for SBCC Management System.

## 📋 Prerequisites

- **Python 3.12** (NOT 3.13 - Django compatibility issues)
- **PostgreSQL** (using Neon Database)
- pip (Python package manager)
- Homebrew (for macOS)

## 🔧 Installation Steps

### 1. Install Python 3.12

**macOS:**
```bash
# Install Python 3.12 via Homebrew
brew install python@3.12

# Verify installation
python3.12 --version
```

**Note:** Python 3.13 has compatibility issues with Django 5.2.7. Use Python 3.12 instead.

### 2. Navigate to Backend Directory

```bash
cd backend
```

### 3. Create Virtual Environment with Python 3.12

```bash
# Remove old venv if it exists
rm -rf venv

# Create new venv with Python 3.12
python3.12 -m venv venv
```

### 4. Activate Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

**Verify Python version:**
```bash
python --version
# Should show: Python 3.12.x
```

### 5. Upgrade pip

```bash
pip install --upgrade pip setuptools wheel
```

### 6. Install Dependencies

```bash
pip install -r requirements.txt
```

### 7. Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Neon database credentials:
   ```env
   # Database Configuration (Neon PostgreSQL)
   DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/sbcc_db?sslmode=require

   # Django Settings
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1

   # CORS Settings
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

3. Generate a `SECRET_KEY`:
   ```bash
   python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
   ```

⚠️ **NEVER commit the `.env` file to git!**

### 8. Set Up Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project: "SBCC Management System"
3. Create a database: `sbcc_db`
4. Copy the connection string
5. Update `DATABASE_URL` in your `.env` file

### 9. Verify Django Installation

```bash
# Check Django works
python manage.py check

# Should show: System check identified no issues (0 silenced).
```

### 10. Create and Apply Migrations

```bash
# Create migrations for all apps (in dependency order)
python manage.py makemigrations authentication
python manage.py makemigrations ministries
python manage.py makemigrations members
python manage.py makemigrations events
python manage.py makemigrations attendance

# Apply all migrations
python manage.py migrate
```

### 11. Create Superuser

```bash
python manage.py createsuperuser
```

Follow the prompts:
- Username: `admin`
- Email: `your@email.com`
- Password: (choose a strong password)
- Role: `admin` (from choices: admin, pastor, ministry_leader, volunteer, member)

### 12. Run Development Server

```bash
python manage.py runserver
```

Server will start at: `http://localhost:8000`

### 13. Access Admin Panel

Navigate to: `http://localhost:8000/admin`

Login with your superuser credentials.

You should see:
- **Authentication:** Users
- **Ministries:** Ministries
- **Members:** Members
- **Events:** Events
- **Attendance:** Attendance

### 14. Test API Endpoints

Navigate to: `http://localhost:8000/api/`

Available endpoints:
- `/api/auth/` - Authentication (login, register, token)
- `/api/ministries/` - Church ministries management
- `/api/members/` - Church members management
- `/api/events/` - Church events management
- `/api/attendance/` - Attendance tracking
- `/api/dashboard/stats/` - Dashboard statistics
- `/api/dashboard/activities/` - Recent activities

## 📦 Installed Packages

| Package | Version | Purpose |
|---------|---------|---------|
| Django | 5.2.7 | Web framework |
| djangorestframework | 3.15.2 | REST API toolkit |
| djangorestframework-simplejwt | 5.4.1 | JWT authentication |
| django-cors-headers | 4.5.0 | CORS handling |
| django-filter | 24.3 | Filtering support |
| dj-database-url | 2.2.0 | Database URL parser |
| python-decouple | 3.8 | Environment variables |
| psycopg2-binary | 2.9.10 | PostgreSQL adapter |

## 🗂️ Project Structure

```
backend/
├── venv/                    # Virtual environment (not in git)
├── apps/                    # Django apps (feature-based architecture)
│   ├── authentication/      # ✅ User model & JWT auth
│   │   ├── models.py       # User (with role-based access)
│   │   ├── views.py        # Login, register, token endpoints
│   │   ├── serializers.py  # UserSerializer
│   │   └── urls.py         # /api/auth/
│   ├── ministries/         # ✅ Ministry management
│   │   ├── models.py       # Ministry
│   │   ├── views.py        # MinistryViewSet
│   │   ├── serializers.py  # MinistrySerializer
│   │   ├── admin.py        # Admin config
│   │   └── urls.py         # /api/ministries/
│   ├── members/            # ✅ Member management
│   │   ├── models.py       # Member
│   │   ├── views.py        # MemberViewSet
│   │   ├── serializers.py  # MemberSerializer
│   │   ├── admin.py        # Admin config
│   │   └── urls.py         # /api/members/
│   ├── events/             # ✅ Event management
│   │   ├── models.py       # Event
│   │   ├── views.py        # EventViewSet
│   │   ├── serializers.py  # EventSerializer
│   │   ├── admin.py        # Admin config
│   │   └── urls.py         # /api/events/
│   ├── attendance/         # ✅ Attendance tracking
│   │   ├── models.py       # Attendance
│   │   ├── views.py        # AttendanceViewSet
│   │   ├── serializers.py  # AttendanceSerializer
│   │   ├── admin.py        # Admin config
│   │   └── urls.py         # /api/attendance/
│   ├── volunteers/         # 🚧 Future: Volunteer scheduling
│   ├── prayer_requests/    # 🚧 Future: Prayer tracking
│   ├── inventory/          # 🚧 Future: Equipment management
│   ├── tasks/              # 🚧 Future: Task assignments
│   ├── meeting_minutes/    # 🚧 Future: Meeting records
│   └── announcements/      # 🚧 Future: Communications
├── common/                  # Shared utilities
│   ├── permissions.py      # Custom permissions
│   ├── validators.py       # Custom validators
│   ├── utils.py            # Helper functions
│   └── exceptions.py       # Custom exceptions
├── config/                  # App configuration
│   └── apps.py
├── core/                    # Dashboard aggregation (NO models)
│   ├── views.py            # dashboard_stats, recent_activities
│   └── urls.py             # /api/dashboard/
├── sbcc/                    # Django project settings
│   ├── settings.py         # Main settings
│   ├── urls.py             # Root URL configuration
│   ├── wsgi.py             # WSGI config
│   └── asgi.py             # ASGI config
├── tests/                   # Test suite
│   ├── conftest.py         # Pytest configuration
│   └── __init__.py
├── .env                     # Environment variables (not in git)
├── .env.example            # Example environment file
├── .gitignore              # Git ignore rules
├── manage.py               # Django management script
├── requirements.txt        # Python dependencies
└── start-backend.sh        # Startup script
```

## 🏗️ Architecture Overview

### Feature-Based Architecture

The project follows a **domain-driven, feature-based architecture**:

1. **`apps/authentication/`** - User model with role-based access (admin, pastor, ministry_leader, volunteer, member)
2. **`apps/ministries/`** - Ministry/department management
3. **`apps/members/`** - Church member profiles (depends on User, Ministry)
4. **`apps/events/`** - Event management (depends on User, Ministry)
5. **`apps/attendance/`** - Attendance tracking (depends on Member, Event)
6. **`core/`** - Dashboard aggregation functions (imports from all apps)

### Model Dependencies

```
User (authentication)
 ↓
Ministry (ministries)
 ↓                    ↓
Member (members)    Event (events)
 ↓                    ↓
 └──→ Attendance (attendance) ←──┘
```

### URL Structure

```
/api/
├── auth/
│   ├── login/
│   ├── register/
│   ├── token/refresh/
│   └── logout/
├── ministries/          # CRUD for ministries
├── members/             # CRUD for members
├── events/              # CRUD for events
├── attendance/          # CRUD for attendance
└── dashboard/
    ├── stats/           # Aggregate statistics
    └── activities/      # Recent activities
```

## 🔑 Key Configuration

### Custom User Model

```python
# settings.py
AUTH_USER_MODEL = 'authentication.User'  # Changed from 'core.User'
```

### Installed Apps Order (Dependency Chain)

```python
# settings.py
INSTALLED_APPS = [
    # ... Django apps ...
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    
    # Local apps (in dependency order)
    'apps.authentication',      # User model
    'apps.ministries',          # Ministry model
    'apps.members',             # Member (depends on User, Ministry)
    'apps.events',              # Event (depends on User, Ministry)
    'apps.attendance',          # Attendance (depends on Member, Event)
    
    # Core (dashboard only - no models)
    'core',
    
    # Future apps
    'apps.announcements',
    'apps.inventory',
    'apps.meeting_minutes',
    'apps.prayer_requests',
    'apps.tasks',
    'apps.volunteers',
]
```

### Database Configuration (Neon PostgreSQL)

```python
# settings.py
DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}
```

### JWT Authentication Settings

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### CORS Settings

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # React dev server
    "http://localhost:3000",  # Alternative React port
]

CORS_ALLOW_CREDENTIALS = True
```

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'apps.ministries'"

**Cause:** Incorrect `apps.py` configuration

**Solution:**
```python
# apps/ministries/apps.py
class MinistriesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.ministries'  # Must include 'apps.' prefix
```

### "AUTH_USER_MODEL refers to model 'core.User' that has not been installed"

**Cause:** AUTH_USER_MODEL not updated

**Solution:**
```python
# settings.py
AUTH_USER_MODEL = 'authentication.User'  # Not 'core.User'
```

### "django.db.migrations.exceptions.InconsistentMigrationHistory"

**Cause:** Migration conflicts after refactoring

**Solution:**
```bash
# Drop all tables in Neon console
# Delete all migration files
find ./apps -path "*/migrations/*.py" -not -name "__init__.py" -delete
find ./core -path "*/migrations/*.py" -not -name "__init__.py" -delete

# Recreate migrations
python manage.py makemigrations authentication
python manage.py makemigrations ministries
python manage.py makemigrations members
python manage.py makemigrations events
python manage.py makemigrations attendance
python manage.py migrate
```

### "ImportError: cannot import name 'Event' from 'apps.members.models'"

**Cause:** Wrong imports in admin.py or views.py

**Solution:**
```python
# apps/members/admin.py (CORRECT)
from .models import Member  # Not Event

# apps/events/admin.py (CORRECT)
from .models import Event
```

### "ModuleNotFoundError: No module named 'django.db.migrations.migration'"

**Cause:** Using Python 3.13 (not compatible with Django 5.2.7)

**Solution:**
```bash
# Uninstall Python 3.13, install Python 3.12
brew uninstall python@3.13
brew install python@3.12

# Recreate venv
cd backend
rm -rf venv
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### "psycopg2.OperationalError: could not connect to server"

**Cause:** Incorrect Neon database URL or network issue

**Solution:**
- Check `DATABASE_URL` in `.env`
- Ensure it includes `?sslmode=require`
- Test connection: `python manage.py dbshell`

## 📝 Common Commands

```bash
# Check for issues
python manage.py check

# Run development server
python manage.py runserver

# Create migrations (in dependency order)
python manage.py makemigrations authentication
python manage.py makemigrations ministries
python manage.py makemigrations members
python manage.py makemigrations events
python manage.py makemigrations attendance

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Access database shell
python manage.py dbshell

# Django shell
python manage.py shell

# Collect static files (production)
python manage.py collectstatic
```

## 🚀 Quick Start Script

Create `setup.sh` for automated setup:

```bash
#!/bin/bash
set -e

echo "🔹 Setting up SBCC Backend..."

# Remove old venv
rm -rf venv

# Create fresh venv
python3.12 -m venv venv

# Activate venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Check installation
python manage.py check

echo "✅ Setup complete!"
echo "Next steps:"
echo "  1. Update .env with your Neon database URL"
echo "  2. python manage.py makemigrations authentication"
echo "  3. python manage.py makemigrations ministries"
echo "  4. python manage.py makemigrations members"
echo "  5. python manage.py makemigrations events"
echo "  6. python manage.py makemigrations attendance"
echo "  7. python manage.py migrate"
echo "  8. python manage.py createsuperuser"
echo "  9. python manage.py runserver"
```

Run with:
```bash
chmod +x setup.sh
./setup.sh
```

## 🔐 Security Notes

- ✅ Never commit `.env` file
- ✅ Keep `SECRET_KEY` secure and random
- ✅ Set `DEBUG=False` in production
- ✅ Use strong database passwords
- ✅ Regularly update dependencies
- ✅ Use environment variables for all secrets
- ✅ Enable SSL for database connections (Neon uses SSL by default)
- ✅ JWT tokens expire after 60 minutes
- ✅ Refresh tokens rotate and blacklist after use

## 🎯 Verification Checklist

After setup, verify everything works:

- [ ] `python --version` shows Python 3.12.x
- [ ] `python manage.py check` shows no issues
- [ ] `python manage.py showmigrations` shows all migrations applied
- [ ] Admin panel loads at http://localhost:8000/admin
- [ ] API root loads at http://localhost:8000/api/
- [ ] Can create/view Users in apps.authentication admin
- [ ] Can create/view Ministries in apps.ministries admin
- [ ] Can create/view Members in apps.members admin
- [ ] Can create/view Events in apps.events admin
- [ ] Can create/view Attendance in apps.attendance admin
- [ ] Dashboard stats endpoint works: `/api/dashboard/stats/`
- [ ] Dashboard activities endpoint works: `/api/dashboard/activities/`

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- [Neon Database Docs](https://neon.tech/docs/introduction)
- [Python-Decouple](https://github.com/HBNetwork/python-decouple)

## 🆘 Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Review DEVELOPMENT_WORKFLOW.md
3. Check Django/DRF documentation
4. Ask team lead for help

## 📅 Development Roadmap

**Completed:**
- ✅ User authentication with JWT
- ✅ Ministry management
- ✅ Member management
- ✅ Event management
- ✅ Attendance tracking
- ✅ Dashboard statistics
- ✅ Role-based access control

**Next Steps:**
1. ✅ Implement permission-based views
2. ✅ Add sample data fixtures
3. ✅ Connect frontend to backend APIs
4. ✅ Implement remaining app modules (volunteers, prayer requests, etc.)
5. ✅ Add comprehensive test coverage

---

**Last Updated:** October 22, 2024
**Django Version:** 5.2.7
**Python Version:** 3.12.x
**Database:** Neon PostgreSQL
**Architecture:** Feature-based, Domain-driven