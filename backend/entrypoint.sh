#!/bin/sh
set -e

echo "⏳ Waiting for database..."
# Simple wait (db healthcheck handles most of it)
sleep 2

echo "🔄 Running migrations..."
python manage.py migrate --noinput

echo "📦 Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "🚀 Starting server..."
exec "$@"
