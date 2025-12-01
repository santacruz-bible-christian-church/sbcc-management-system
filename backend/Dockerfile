# Backend Dockerfile for Django API
# Multi-stage: dev (with hot reload) & prod (gunicorn)

# ---------- Base image ----------
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100

WORKDIR /app

# System deps (psycopg2, build, etc.)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python deps
COPY backend/requirements.txt ./requirements.txt
RUN pip install --upgrade pip setuptools wheel \
    && pip install -r requirements.txt

# App source
COPY backend /app

# Entrypoint script
COPY backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create static/media directories and set permissions
RUN mkdir -p /app/static /app/staticfiles /app/media \
    && touch /app/static/.gitkeep

# Default envs (override in compose)
ENV DJANGO_SETTINGS_MODULE=sbcc.settings \
    PYTHONPATH=/app


# ---------- Development image ----------
FROM base AS dev

# Create non-root user and set ownership
RUN useradd -m appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]


# ---------- Production image ----------
FROM base AS prod

RUN pip install gunicorn

# Create non-root user and set ownership
RUN useradd -m appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "sbcc.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
