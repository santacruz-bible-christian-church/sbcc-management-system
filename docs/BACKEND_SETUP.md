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
# Create migrations for core app
python manage.py makemigrations core

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

### 12. Run Development Server

```bash
python manage.py runserver
```

Server will start at: `http://localhost:8000`

### 13. Access Admin Panel

Navigate to: `http://localhost:8000/admin`

Login with your superuser credentials.

You should see:
- Users
- Ministries
- Members
- Events
- Attendance

### 14. Test API Endpoints

Navigate to: `http://localhost:8000/api/`

Available endpoints:
- `/api/ministries/` - Church ministries
- `/api/members/` - Church members
- `/api/events/` - Church events
- `/api/attendance/` - Attendance records

## 📦 Installed Packages

| Package | Version | Purpose |
|---------|---------|---------|
| Django | 5.2.7 | Web framework |
| djangorestframework | 3.15.2 | REST API toolkit |
| django-cors-headers | 4.5.0 | CORS handling |
| django-filter | 24.3 | Filtering support |
| dj-database-url | 2.2.0 | Database URL parser |
| python-decouple | 3.8 | Environment variables |
| psycopg2-binary | 2.9.10 | PostgreSQL adapter |

## 🗂️ Project Structure

```
backend/
├── venv/                    # Virtual environment (not in git)
├── apps/                    # Future app modules (placeholders)
│   ├── authentication/     # JWT authentication (to implement)
│   ├── members/            # Extended member features
│   ├── attendance/         # Advanced attendance
│   ├── events/             # Event management
│   ├── volunteers/         # Volunteer scheduling
│   ├── prayer_requests/    # Prayer tracking
│   ├── inventory/          # Equipment management
│   ├── tasks/              # Task assignments
│   ├── meeting_minutes/    # Meeting records
│   └── announcements/      # Communications
├── common/                  # Shared utilities
│   ├── permissions.py      # Custom permissions
│   ├── validators.py       # Custom validators
│   ├── utils.py            # Helper functions
│   └── exceptions.py       # Custom exceptions
├── config/                  # App configuration
│   └── apps.py
├── core/                    # Main Django app (ACTIVE)
│   ├── models.py           # User, Ministry, Member, Event, Attendance
│   ├── views.py            # API ViewSets
│   ├── serializers.py      # DRF serializers
│   ├── urls.py             # API routes
│   ├── admin.py            # Admin configuration
│   └── migrations/         # Database migrations
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

## 🔑 Key Configuration

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

### Custom User Model

```python
# settings.py
AUTH_USER_MODEL = 'core.User'
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

### REST Framework Settings

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}
```

## 🐛 Troubleshooting

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

### "django.core.exceptions.ImproperlyConfigured: Requested setting DATABASE_URL"

**Cause:** Missing or incorrect `.env` file

**Solution:**
```bash
# Ensure .env file exists
cp .env.example .env

# Update DATABASE_URL with your Neon credentials
nano .env
```

### "psycopg2.OperationalError: could not connect to server"

**Cause:** Incorrect Neon database URL or network issue

**Solution:**
- Check `DATABASE_URL` in `.env`
- Ensure it includes `?sslmode=require`
- Test connection: `python manage.py dbshell`

### "System check identified some issues: AUTH_USER_MODEL"

**Cause:** Migration order conflict

**Solution:**
```bash
# Reset migrations
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete

# Recreate migrations
python manage.py makemigrations core
python manage.py migrate
```

### Virtual Environment Issues

**Problem:** Wrong Python version in venv

**Solution:**
```bash
# Check Python version
python --version

# If not 3.12, recreate venv
deactivate
rm -rf venv
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 📝 Common Commands

```bash
# Check for issues
python manage.py check

# Run development server
python manage.py runserver

# Create migrations
python manage.py makemigrations

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
echo "  2. python manage.py makemigrations core"
echo "  3. python manage.py migrate"
echo "  4. python manage.py createsuperuser"
echo "  5. python manage.py runserver"
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

## 🎯 Verification Checklist

After setup, verify everything works:

- [ ] `python --version` shows Python 3.12.x
- [ ] `python manage.py check` shows no issues
- [ ] `python manage.py showmigrations` shows all migrations applied
- [ ] Admin panel loads at http://localhost:8000/admin
- [ ] API root loads at http://localhost:8000/api/
- [ ] Can create/view Ministries, Members, Events, Attendance in admin

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Neon Database Docs](https://neon.tech/docs/introduction)
- [Python-Decouple](https://github.com/HBNetwork/python-decouple)

## 🆘 Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Ask team lead for help
3. Check project Discord/Slack
4. Review Django/DRF documentation

## 📅 Next Steps

After successful setup:

1. ✅ Implement JWT authentication in `apps/authentication/`
2. ✅ Build dashboard API endpoints
3. ✅ Add sample data for testing
4. ✅ Connect frontend to backend APIs
5. ✅ Implement remaining app modules

---

**Last Updated:** October 14, 2024
**Django Version:** 5.2.7
**Python Version:** 3.12.x
**Database:** Neon PostgreSQL