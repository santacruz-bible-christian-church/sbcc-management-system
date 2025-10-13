# Backend Setup Guide

Complete guide for setting up the Django backend for SBCC Management System.

## 📋 Prerequisites

- Python 3.13 or higher
- PostgreSQL 14 or higher
- pip (Python package manager)

## 🔧 Installation Steps

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python3 -m venv venv
```

### 3. Activate Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Ask team lead for the real `DATABASE_URL`

3. Generate a `SECRET_KEY`:
   ```bash
   python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
   ```

4. Update `.env` with real values

⚠️ **NEVER commit the `.env` file to git!**

### 6. Set Up PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sbcc_db;

# Create user
CREATE USER sbcc_user WITH PASSWORD 'your-password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sbcc_db TO sbcc_user;

# Exit
\q
```

### 7. Run Migrations

```bash
python manage.py migrate
```

### 8. Create Superuser

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 9. Run Development Server

```bash
python manage.py runserver
```

Server will start at: `http://localhost:8000`

### 10. Access Admin Panel

Navigate to: `http://localhost:8000/admin`

Login with your superuser credentials.

## 📦 Installed Packages

| Package | Version | Purpose |
|---------|---------|---------|
| Django | 5.2.7 | Web framework |
| djangorestframework | 3.15.2 | REST API toolkit |
| django-cors-headers | 4.5.0 | CORS handling |
| python-decouple | 3.8 | Environment variables |
| psycopg2-binary | 2.9.10 | PostgreSQL adapter |

## 🗂️ Project Structure

```
backend/
├── venv/                    # Virtual environment (not in git)
├── core/                    # Main Django app
│   ├── models.py           # Database models
│   ├── views.py            # API views
│   ├── serializers.py      # DRF serializers
│   ├── urls.py             # App URLs
│   └── migrations/         # Database migrations
├── sbcc/                    # Django project settings
│   ├── settings.py         # Main settings
│   ├── urls.py             # Root URL configuration
│   ├── wsgi.py             # WSGI config
│   └── asgi.py             # ASGI config
├── .env                     # Environment variables (not in git)
├── .gitignore              # Git ignore rules
├── manage.py               # Django management script
├── requirements.txt        # Python dependencies
└── start-backend.sh        # Startup script
```

## 🔑 Key Configuration

### CORS Settings

CORS is configured to allow requests from the React frontend:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### REST Framework Settings

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}
```

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'corsheaders'"

**Solution:**
```bash
pip install django-cors-headers
```

### "psycopg2.OperationalError: could not connect to server"

**Solution:**
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

### "Secret key must not be empty"

**Solution:**
- Create `.env` file with `SECRET_KEY`
- Ensure `python-decouple` is installed

## 📝 Common Commands

```bash
# Run development server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Create new app
python manage.py startapp app_name

# Collect static files
python manage.py collectstatic
```

## 🔐 Security Notes

- Never commit `.env` file
- Keep `SECRET_KEY` secure
- Set `DEBUG=False` in production
- Use strong database passwords
- Regularly update dependencies

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)