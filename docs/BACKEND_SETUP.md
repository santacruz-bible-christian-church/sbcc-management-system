# Backend Setup Guide

Setup guide for the SBCC Management System Django backend.

## Prerequisites

- Python 3.12 (not 3.13 - compatibility issues)
- PostgreSQL (Neon account recommended)
- pip

## Quick Start

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3.12 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start server
python manage.py runserver
```

**Backend:** http://localhost:8000
**Admin Panel:** http://localhost:8000/admin
**API Root:** http://localhost:8000/api/

## Environment Configuration

Create `.env` in the backend directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/sbcc_db?sslmode=require

# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Generate a secret key:

```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

> ⚠️ Never commit `.env` to version control.

## Database Setup (Neon)

1. Go to [Neon Console](https://console.neon.tech)
2. Create project: "SBCC Management System"
3. Create database: `sbcc_db`
4. Copy connection string to `DATABASE_URL` in `.env`

## Available Commands

| Command | Description |
|---------|-------------|
| `python manage.py runserver` | Start development server |
| `python manage.py migrate` | Apply database migrations |
| `python manage.py makemigrations` | Create new migrations |
| `python manage.py createsuperuser` | Create admin user |
| `python manage.py test` | Run tests |
| `python manage.py shell` | Django shell |
| `python manage.py check` | Verify configuration |

## Project Structure

```
backend/
├── apps/              # Feature modules
│   ├── authentication/   # User & JWT auth
│   ├── members/          # Member management
│   ├── ministries/       # Ministry management
│   ├── events/           # Event management
│   ├── attendance/       # Attendance tracking
│   └── inventory/        # Inventory management
├── common/            # Shared utilities
├── core/              # Dashboard aggregation
├── sbcc/              # Django settings
└── tests/             # Test suite
```

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | Django 5.1.4, Django REST Framework |
| Auth | djangorestframework-simplejwt |
| Database | PostgreSQL (Neon Serverless) |
| PDF | reportlab |

## Troubleshooting

### Python version errors

```bash
# Verify Python 3.12
python --version

# If using wrong version, recreate venv
rm -rf venv
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Database connection errors

- Verify `DATABASE_URL` in `.env`
- Ensure URL includes `?sslmode=require`
- Test: `python manage.py check`

### Migration errors

```bash
# Reset migrations (development only)
python manage.py migrate --fake-initial
```

### Module not found errors

Ensure `apps.py` in each app has correct name:

```python
# apps/ministries/apps.py
class MinistriesConfig(AppConfig):
    name = 'apps.ministries'  # Include 'apps.' prefix
```

## Verification Checklist

- [ ] `python manage.py check` shows no issues
- [ ] Admin panel loads at http://localhost:8000/admin
- [ ] API root loads at http://localhost:8000/api/
- [ ] Can login with superuser credentials
- [ ] Dashboard endpoints respond: `/api/dashboard/stats/`

## Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- [Neon Database](https://neon.tech/docs/introduction)

---

**Last Updated:** December 5, 2025
