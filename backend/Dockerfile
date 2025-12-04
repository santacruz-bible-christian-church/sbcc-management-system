# Backend Dockerfile for Django API
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on

WORKDIR /app

# System deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt ./
RUN pip install --upgrade pip \
    && pip install -r requirements.txt \
    && pip install gunicorn

# Copy app
COPY . .

# Create directories
RUN mkdir -p /app/static /app/staticfiles /app/media

# Create non-root user
RUN useradd -m appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Railway uses PORT env var
CMD python manage.py migrate --noinput && \
    python manage.py collectstatic --noinput && \
    gunicorn sbcc.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2
