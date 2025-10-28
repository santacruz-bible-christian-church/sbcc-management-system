#!/bin/bash
# Setup development tools for SBCC Management System
# Run: chmod +x scripts/setup-dev-tools.sh && ./scripts/setup-dev-tools.sh

echo "🛡️ Setting up development protection tools..."

# Install pre-commit
echo "📦 Installing pre-commit hooks..."
pip install pre-commit
pre-commit install

# Install Python dev dependencies
echo "🐍 Installing Python development tools..."
cd backend
pip install -r requirements-dev.txt

# Install frontend dependencies
echo "⚛️ Installing frontend dependencies..."
cd ../frontend
npm install

# Run initial checks
echo "✅ Running initial quality checks..."
cd ..
pre-commit run --all-files

echo ""
echo "✨ Setup complete!"
echo ""
echo "⚠️  IMPORTANT REMINDERS:"
echo "1. NEVER commit directly to main branch"
echo "2. ALWAYS create a feature branch: git checkout -b feat/your-feature"
echo "3. NEVER commit __pycache__ directories"
echo "4. NEVER commit .env files"
echo "5. ALWAYS run 'pre-commit run --all-files' before pushing"
echo "6. ALL code must be in backend/apps/ or frontend/src/"
echo "7. Read the PR template before creating a PR"
echo ""
echo "🎯 Happy coding! And remember: measure twice, cut once!"
