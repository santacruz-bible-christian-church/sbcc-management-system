# Development Workflow

Guide for contributing to the SBCC Management System project.

## 🌿 Git Workflow

### Branch Strategy

```
main
├── develop
│   ├── feature/feature-name
│   ├── bugfix/bug-description
│   ├── hotfix/urgent-fix
│   ├── docs/documentation-update
│   ├── design/ui-improvement
│   ├── test/test-coverage
│   ├── refactor/code-optimization
│   ├── chore/maintenance-task
│   └── release/version-number
```

### Branch Naming Convention

- **feature/** - For new features
  - Example: `feature/add-student-module`
  - Example: `feature/user-authentication`

- **bugfix/** - For bug fixes
  - Example: `bugfix/fix-login-error`
  - Example: `bugfix/resolve-payment-calculation`

- **hotfix/** - For urgent production fixes
  - Example: `hotfix/security-patch`
  - Example: `hotfix/critical-api-error`

- **docs/** - For documentation
  - Example: `docs/update-api-documentation`
  - Example: `docs/add-setup-guide`

- **design/** - For UI/UX changes or layout updates
  - Example: `design/update-dashboard-layout`
  - Example: `design/improve-form-styling`

- **test/** - For adding or updating tests
  - Example: `test/add-student-model-tests`
  - Example: `test/integration-tests`

- **refactor/** - For improving code structure without changing functionality
  - Example: `refactor/optimize-database-queries`
  - Example: `refactor/extract-reusable-components`

- **chore/** - For maintenance tasks (configs, dependencies, CI/CD updates)
  - Example: `chore/update-dependencies`
  - Example: `chore/configure-eslint`

- **release/** - For preparing new version release
  - Example: `release/v1.0.0`
  - Example: `release/v2.1.0-beta`

### Creating a New Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create and switch to new branch
git checkout -b <branch-type>/your-branch-name

# Examples:
git checkout -b feature/add-student-registration
git checkout -b bugfix/fix-grade-calculation
git checkout -b design/update-navbar-layout
```

### Making Changes

```bash
# Check status
git status

# Add files
git add .

# Commit with descriptive message
git commit -m "feat: add student registration form"
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `design:` UI/UX changes
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks
- `perf:` Performance improvements
- `ci:` CI/CD changes
- `build:` Build system changes
- `revert:` Reverting previous changes

**Examples:**
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve database connection timeout"
git commit -m "docs: update API documentation"
git commit -m "design: improve dashboard layout"
git commit -m "refactor: optimize student query performance"
git commit -m "test: add unit tests for payment module"
git commit -m "chore: update dependencies to latest versions"
git commit -m "perf: optimize image loading performance"
```

### Pushing Changes

```bash
# Push to remote
git push origin <branch-type>/your-branch-name

# Examples:
git push origin feature/add-student-registration
git push origin bugfix/fix-grade-calculation
```

### Creating Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Add descriptive title following branch type
5. Add detailed description of changes:
   - What was changed
   - Why it was changed
   - How to test the changes
   - Screenshots (for design changes)
6. Link related issues (if applicable)
7. Request review from team members
8. Wait for approval and merge

**PR Title Examples:**
```
[FEATURE] Add student registration module
[BUGFIX] Fix grade calculation error
[DESIGN] Update dashboard layout
[DOCS] Add API endpoint documentation
[TEST] Add integration tests for enrollment
[REFACTOR] Optimize database queries
[CHORE] Update project dependencies
```

## 🏗️ Development Setup

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd sbcc-management-system

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate

# Setup frontend (in new terminal)
cd ../frontend
npm install
```

### Daily Development

#### Terminal 1: Backend

```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

#### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

#### Terminal 3: Database (if needed)

```bash
psql -U sbcc_user -d sbcc_db
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate

# Run all tests
python manage.py test

# Run specific app tests
python manage.py test core

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Tests (when configured)

```bash
cd frontend
npm run test
```

## 📋 Code Review Checklist

### Before Submitting PR

- [ ] Code follows project style guidelines
- [ ] Branch naming convention followed
- [ ] Commit messages follow conventional commits
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Documentation updated (if applicable)
- [ ] Environment variables documented (if added)
- [ ] No sensitive data committed
- [ ] Database migrations included (if applicable)
- [ ] Screenshots added (for design changes)
- [ ] Code is properly commented
- [ ] No unnecessary dependencies added

### For Reviewers

- [ ] Code logic is clear and correct
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Error handling implemented
- [ ] Tests cover new functionality
- [ ] Documentation is accurate and complete
- [ ] UI/UX changes are consistent with design system
- [ ] Accessibility considerations met
- [ ] Code follows DRY principles
- [ ] No breaking changes (or properly documented)

## 🔄 Updating Your Branch

### Sync with Main Branch

```bash
# Switch to main
git checkout main
git pull origin main

# Switch back to your branch
git checkout feature/your-feature-name

# Rebase on main
git rebase main

# Or merge main
git merge main
```

### Resolving Conflicts

```bash
# After conflict occurs
git status  # See conflicting files

# Edit files to resolve conflicts
# Remove conflict markers: <<<<<<<, =======, >>>>>>>

# Add resolved files
git add resolved-file.py

# Continue rebase
git rebase --continue

# Or continue merge
git merge --continue
```

## 🚀 Deployment Workflow

### Development → Staging → Production

1. **Development**
   - Create appropriate branch type
   - Develop and test locally
   - Push to remote
   - Create pull request

2. **Code Review**
   - Peer review
   - Address feedback
   - Update PR if needed

3. **Merge to Develop**
   - PR approved
   - Merge to develop branch
   - Deploy to staging environment

4. **Testing**
   - QA testing on staging
   - Bug fixes if needed (use bugfix/ branches)
   - Regression testing

5. **Release Preparation**
   - Create release/ branch from develop
   - Update version numbers
   - Update CHANGELOG
   - Final testing

6. **Production**
   - Merge release branch to main
   - Tag release version
   - Deploy to production
   - Monitor for issues
   - If critical issues, create hotfix/ branch from main

### Release Branch Workflow

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Update version numbers and changelog
# Commit changes
git commit -m "chore: prepare release v1.0.0"

# Merge to main
git checkout main
git merge release/v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge release/v1.0.0
git push origin develop

# Delete release branch
git branch -d release/v1.0.0
```

### Hotfix Workflow

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# Make fixes
# Commit changes
git commit -m "fix: resolve critical security vulnerability"

# Merge to main
git checkout main
git merge hotfix/critical-security-fix
git tag -a v1.0.1 -m "Hotfix version 1.0.1"
git push origin main --tags

# Merge to develop
git checkout develop
git merge hotfix/critical-security-fix
git push origin develop

# Delete hotfix branch
git branch -d hotfix/critical-security-fix
```

## 📊 Database Migrations

### Creating Migrations

```bash
cd backend
source venv/bin/activate

# After model changes
python manage.py makemigrations

# Review migration file
# Apply migrations
python manage.py migrate
```

### Migration Best Practices

- Always review generated migrations
- Test migrations on copy of production data
- Include both up and down migrations
- Never delete old migrations
- Commit migrations with code changes
- Use meaningful migration names
- Add comments for complex migrations

## 🐛 Debugging Tips

### Backend Debugging

```python
# Use Django shell
python manage.py shell

# Use debugger
import pdb; pdb.set_trace()

# Check logs
python manage.py runserver --verbosity 3
```

### Frontend Debugging

```jsx
// Console logging
console.log('Debug:', variable);

// React DevTools
// Install browser extension

// Network tab
// Check API requests/responses
```

## 📝 Documentation Standards

### Code Comments

```python
# Backend (Python)
def calculate_gpa(grades):
    """
    Calculate Grade Point Average.
    
    Args:
        grades (list): List of grade values
        
    Returns:
        float: GPA rounded to 2 decimal places
    """
    return round(sum(grades) / len(grades), 2)
```

```jsx
// Frontend (JavaScript)
/**
 * Fetches student data from API
 * @param {string} studentId - The student's ID
 * @returns {Promise<Object>} Student data object
 */
const fetchStudent = async (studentId) => {
  // Implementation
};
```

### API Documentation

Document all endpoints in `API_DOCUMENTATION.md`

## 🤝 Team Communication

### Daily Standup Topics

- What did you work on yesterday?
- What will you work on today?
- Any blockers or challenges?

### Code Review Etiquette

- Be respectful and constructive
- Ask questions, don't demand changes
- Explain reasoning behind suggestions
- Praise good solutions
- Approve when satisfied
- Respond to feedback promptly
- Use PR templates
- Test changes locally before approving

## 🔧 Useful Commands

### Backend

```bash
# Create superuser
python manage.py createsuperuser

# Run specific tests
python manage.py test core.tests.TestStudentModel

# Check for issues
python manage.py check

# Generate secret key
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Show migrations
python manage.py showmigrations

# Create empty migration
python manage.py makemigrations --empty core
```

### Frontend

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Build for production
npm run build

# Analyze bundle size
npm run build -- --analyze

# Check for outdated packages
npm outdated

# Update packages
npm update
```

### Git

```bash
# Stash changes
git stash
git stash pop

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View commit history
git log --oneline --graph

# Clean untracked files
git clean -fd

# List all branches
git branch -a

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name

# Rename branch
git branch -m old-name new-name

# Show branch details
git show-branch
```

## 📚 Resources

- [Git Documentation](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Python PEP 8](https://pep8.org/)
- [JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Django Best Practices](https://docs.djangoproject.com/en/stable/misc/design-philosophies/)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [Semantic Versioning](https://semver.org/)