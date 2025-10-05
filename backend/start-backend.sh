#!/bin/bash
# Activate virtual environment and run Django server

echo "🔹 Activating virtual environment..."
source venv/bin/activate

echo "🔹 Starting Django development server..."
python manage.py runserver