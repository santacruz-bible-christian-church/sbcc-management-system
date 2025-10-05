# SBCC Management System

A full-stack web application for managing SBCC (Santa Cruz Bible Christian Church) operations, built with Django REST Framework and React.

## 🏗️ Project Structure

```
sbcc-management-system/
├── backend/           # Django REST API
├── frontend/          # React + Vite + Tailwind CSS
├── docs/              # Documentation
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+
- PostgreSQL 14+
- Git

### Clone the Repository

```bash
git clone <repository-url>
cd sbcc-management-system
```

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend will run on: `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: `http://localhost:5173`

## 📚 Documentation

- [Backend Setup Guide](docs/BACKEND_SETUP.md)
- [Frontend Setup Guide](docs/FRONTEND_SETUP.md)
- [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🛠️ Tech Stack

### Backend
- Django 5.2.7
- Django REST Framework 3.15.2
- PostgreSQL
- python-decouple

### Frontend
- React 18.3.1
- Vite 5.4.10
- Tailwind CSS 3.4.14
- Flowbite React 0.10.2

## 👥 Team

- [Add team members here]

## 📝 License

[Add license information]