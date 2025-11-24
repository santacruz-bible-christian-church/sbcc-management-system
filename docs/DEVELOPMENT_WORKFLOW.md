# Development Workflow

Guide for contributing to the SBCC Management System project.

## 🌿 Git Workflow

### Branch Strategy

```
main
├── develop
│   ├── feature/feature-name
│   ├── fix/bug-description
│   ├── hotfix/urgent-fix (production)
│   ├── docs/documentation-update
│   ├── design/ui-improvement
│   ├── test/test-coverage
│   ├── refactor/code-optimization
│   ├── chore/maintenance-task
│   └── release/version-number
```

### Branch Naming Convention

- **feature/** - For new features
  - Example: `feature/add-volunteer-scheduling`
  - Example: `feature/prayer-request-module`

- **bugfix/** - For bug fixes
  - Example: `bugfix/fix-attendance-calculation`
  - Example: `bugfix/resolve-ministry-assignment`

- **hotfix/** - For urgent production fixes
  - Example: `hotfix/security-patch`
  - Example: `hotfix/critical-api-error`

- **docs/** - For documentation
  - Example: `docs/update-api-documentation`
  - Example: `docs/add-architecture-diagram`

- **design/** - For UI/UX changes or layout updates
  - Example: `design/update-dashboard-layout`
  - Example: `design/improve-member-form`

- **test/** - For adding or updating tests
  - Example: `test/add-ministry-model-tests`
  - Example: `test/integration-tests`

- **refactor/** - For improving code structure without changing functionality
  - Example: `refactor/move-models-to-apps`
  - Example: `refactor/extract-dashboard-logic`

- **chore/** - For maintenance tasks (configs, dependencies, CI/CD updates)
  - Example: `chore/update-dependencies`
  - Example: `chore/configure-pre-commit-hooks`

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
git checkout -b feature/add-volunteer-module
git checkout -b bugfix/fix-attendance-api
git checkout -b refactor/optimize-dashboard-queries
```

### Making Changes

```bash
# Check status
git status

# Add specific files
git add backend/apps/ministries/models.py
git add backend/apps/ministries/views.py

# Or add all changes
git add .

# Commit with descriptive message
git commit -m "feat(ministries): add ministry CRUD endpoints"
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

**Format:**
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
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

**Scopes (for this project):**
- `authentication` - User auth and JWT
- `ministries` - Ministry management
- `members` - Member management
- `events` - Event management
- `attendance` - Attendance tracking
- `dashboard` - Dashboard/core functionality
- `api` - API routing and configuration
- `settings` - Django settings
- `migrations` - Database migrations
- `deps` - Dependencies

**Examples:**
```bash
# Features
git commit -m "feat(ministries): add ministry CRUD with filtering"
git commit -m "feat(authentication): implement JWT token refresh"
git commit -m "feat(dashboard): add recent activities endpoint"

# Bug fixes
git commit -m "fix(attendance): resolve duplicate check-in issue"
git commit -m "fix(members): correct ministry assignment validation"

# Refactoring
git commit -m "refactor(core): move models to domain apps

BREAKING CHANGE: All models moved from core to domain-specific apps
- Ministry → apps.ministries
- Member → apps.members
- Event → apps.events
- Attendance → apps.attendance"

# Documentation
git commit -m "docs: update backend setup for new architecture"
git commit -m "docs(api): add endpoint documentation for ministries"

# Tests
git commit -m "test(members): add unit tests for Member model"
git commit -m "test(api): add integration tests for attendance endpoints"

# Chore
git commit -m "chore(deps): update Django to 5.2.7"
git commit -m "chore(migrations): create initial migrations for all apps"
```

### Atomic Commits Best Practices

**✅ Good - Atomic commits (one logical change each):**
```bash
git add backend/apps/ministries/
git commit -m "feat(ministries): add ministries app with full CRUD"

git add backend/apps/members/
git commit -m "feat(members): add members app with full CRUD"

git add backend/core/models.py backend/core/serializers.py
git commit -m "refactor(core): remove models and move to domain apps"
```

**❌ Bad - One huge commit:**
```bash
git add .
git commit -m "Added everything"
```

### Pushing Changes

```bash
# Push to remote
git push origin <branch-type>/your-branch-name

# Examples:
git push origin feature/add-volunteer-module
git push origin refactor/move-models-to-apps
```

### Creating Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Add descriptive title following conventional commits
5. Add detailed description:
   - **What**: What was changed
   - **Why**: Why it was changed
   - **How**: How to test the changes
   - **Screenshots**: For design changes
   - **Breaking Changes**: If applicable
6. Link related issues (if applicable)
7. Request review from team members
8. Wait for approval and merge

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature (feat)
- [ ] Bug fix (fix)
- [ ] Refactoring (refactor)
- [ ] Documentation (docs)
- [ ] Design/UI (design)
- [ ] Tests (test)
- [ ] Chore (chore)

## Changes Made
- Added Ministry CRUD endpoints
- Implemented filtering and search
- Created admin configuration

## Testing
- [ ] Migrations run successfully
- [ ] All tests pass
- [ ] Manual testing completed
- [ ] API endpoints tested

## Breaking Changes
None / [Describe breaking changes]

## Related Issues
Closes #123
```

## 🏗️ Development Setup

For initial project setup, see:
- [Backend Setup Guide](BACKEND_SETUP.md) - Complete Django/DRF installation
- [Frontend Setup Guide](FRONTEND_SETUP.md) - Complete React/Vite installation

## 📋 Code Review Checklist

### Before Submitting PR

- [ ] Code follows project style guidelines
- [ ] Branch naming convention followed
- [ ] Commit messages follow conventional commits
- [ ] Commits are atomic (one logical change per commit)
- [ ] All tests pass (`python manage.py test`)
- [ ] No console errors or warnings
- [ ] Documentation updated (if applicable)
- [ ] Environment variables documented (if added)
- [ ] No sensitive data committed (`.env` not committed)
- [ ] Database migrations included and tested
- [ ] Screenshots added (for design changes)
- [ ] Code is properly commented
- [ ] No unnecessary dependencies added
- [ ] `apps.py` has correct `name` field (e.g., `apps.ministries`)
- [ ] Imports use correct paths (e.g., `from apps.ministries.models import Ministry`)

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
- [ ] No breaking changes (or properly documented with `BREAKING CHANGE:`)
- [ ] Model dependencies follow correct order (User → Ministry → Member/Event → Attendance)
- [ ] Migrations are reversible

## 🔄 Updating Your Branch

### Sync with Main Branch

```bash
# Switch to main
git checkout main
git pull origin main

# Switch back to your branch
git checkout feature/your-feature-name

# Rebase on main (preferred for cleaner history)
git rebase main

# Or merge main (if you prefer merge commits)
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

# Push (use --force-with-lease for rebased branches)
git push origin feature/your-feature-name --force-with-lease
```

## 🚀 Deployment Workflow

### Development → Staging → Production

1. **Development**
   - Create appropriate branch type
   - Make atomic commits
   - Test locally
   - Push to remote
   - Create pull request

2. **Code Review**
   - Peer review
   - Address feedback
   - Update PR if needed
   - Approve when satisfied

3. **Merge to Develop**
   - PR approved
   - Squash merge (for feature branches) or merge commit (for releases)
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

## 📊 Database Migrations

### Creating Migrations

```bash
# Create migrations in dependency order
python manage.py makemigrations authentication
python manage.py makemigrations ministries
python manage.py makemigrations members
python manage.py makemigrations events
python manage.py makemigrations attendance

# Review and apply
cat apps/ministries/migrations/0002_add_description.py
python manage.py migrate
python manage.py showmigrations
```

### Migration Best Practices

- ✅ Always review generated migrations
- ✅ Test migrations on copy of production data
- ✅ Use `migrations.RunPython` for data migrations
- ✅ Never delete old migrations (except during development reset)
- ✅ Commit migrations with code changes
- ✅ Use meaningful migration names: `python manage.py makemigrations --name add_ministry_description`
- ✅ Add comments for complex migrations
- ✅ Follow dependency order: authentication → ministries → members/events → attendance

### Resetting Migrations (Development Only)

⚠️ **WARNING: Destroys all data!**

```bash
# Delete migration files
find ./apps -path "*/migrations/*.py" -not -name "__init__.py" -delete

# Recreate all migrations
python manage.py makemigrations authentication ministries members events attendance
python manage.py migrate
python manage.py createsuperuser
```

## 🐛 Debugging Tips

### Backend Debugging

```python
# Django shell
python manage.py shell

# Use debugger
import pdb; pdb.set_trace()

# Check logs with verbosity
python manage.py runserver --verbosity 3

# Test specific query
from apps.ministries.models import Ministry
Ministry.objects.all()

# Check model relationships
from apps.members.models import Member
member = Member.objects.first()
member.ministry  # ForeignKey
member.user  # OneToOne
```

### Frontend Debugging

```jsx
// Console logging
console.log('Debug:', variable);

// React DevTools (browser extension)

// Network tab (check API requests/responses)

// Axios interceptors for debugging
axios.interceptors.request.use(request => {
  console.log('Starting Request', request)
  return request
})
```

### Common Django Errors

**"ModuleNotFoundError: No module named 'apps.ministries'"**
→ Check `apps.py` has `name = 'apps.ministries'` (not `name = 'ministries'`)

**"ImportError: cannot import name 'Event' from 'apps.members.models'"**
→ Check admin.py imports correct model from correct app

**"AUTH_USER_MODEL refers to model 'core.User'"**
→ Update `settings.py`: `AUTH_USER_MODEL = 'authentication.User'`

## 📝 Documentation Standards

### Code Comments

```python
# Backend (Python)
def calculate_attendance_rate(member_id, start_date, end_date):
    """
    Calculate attendance rate for a member in date range.

    Args:
        member_id (int): Member's ID
        start_date (date): Start of date range
        end_date (date): End of date range

    Returns:
        float: Attendance rate (0.0 to 1.0)

    Example:
        >>> calculate_attendance_rate(1, date(2024,1,1), date(2024,12,31))
        0.85
    """
    total_events = Event.objects.filter(
        start_datetime__range=(start_date, end_date)
    ).count()

    attended = Attendance.objects.filter(
        member_id=member_id,
        attended=True,
        check_in_time__range=(start_date, end_date)
    ).count()

    return attended / total_events if total_events > 0 else 0.0
```

```jsx
// Frontend (JavaScript/React)
/**
 * Fetches ministry data with members count
 * @param {string} ministryId - Ministry ID
 * @returns {Promise<Object>} Ministry data with member count
 * @throws {Error} If API request fails
 *
 * @example
 * const ministry = await fetchMinistry('123');
 * console.log(ministry.member_count); // 25
 */
const fetchMinistry = async (ministryId) => {
  const response = await api.get(`/api/ministries/${ministryId}/`);
  return response.data;
};
```

### API Documentation

Document endpoints in code:

```python
# apps/ministries/views.py
class MinistryViewSet(viewsets.ModelViewSet):
    """
    API endpoints for Ministry management.

    list: GET /api/ministries/
        Returns paginated list of ministries
        Filters: search (name, description)
        Ordering: name, created_at

    retrieve: GET /api/ministries/{id}/
        Returns single ministry with member_count

    create: POST /api/ministries/
        Creates new ministry
        Required: name
        Optional: description, leader

    update: PUT /api/ministries/{id}/
        Updates ministry

    partial_update: PATCH /api/ministries/{id}/
        Partial update

    destroy: DELETE /api/ministries/{id}/
        Deletes ministry (sets members.ministry to NULL)
    """
    queryset = Ministry.objects.all()
    serializer_class = MinistrySerializer
    # ...
```

## 🔧 Useful Commands

### Backend

```bash
# Create superuser
python manage.py createsuperuser

# Django shell with models loaded
python manage.py shell
>>> from apps.ministries.models import Ministry
>>> Ministry.objects.all()

# Run specific tests
python manage.py test apps.ministries.tests.TestMinistryModel

# Check for issues
python manage.py check

# Show all URLs
python manage.py show_urls  # if django-extensions installed

# Generate secret key
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Show migrations
python manage.py showmigrations

# Squash migrations (production)
python manage.py squashmigrations ministries 0001 0005

# Create empty migration
python manage.py makemigrations --empty ministries --name custom_data_migration
```

### Git

```bash
# Stash changes
git stash
git stash list
git stash pop

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View commit history
git log --oneline --graph --all

# Show files changed in commit
git show --name-only HEAD

# Interactive rebase (squash commits)
git rebase -i HEAD~3

# Cherry-pick commit from another branch
git cherry-pick abc123

# Clean untracked files
git clean -fd

# List all branches
git branch -a

# Delete merged branches
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d
```

## 📚 Resources

- [Git Documentation](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Python PEP 8](https://pep8.org/)
- [Django Coding Style](https://docs.djangoproject.com/en/dev/internals/contributing/writing-code/coding-style/)
- [Django Best Practices](https://docs.djangoproject.com/en/stable/misc/design-philosophies/)
- [DRF Best Practices](https://www.django-rest-framework.org/api-guide/views/)
- [Semantic Versioning](https://semver.org/)
- [Feature-Based Architecture](https://softwareengineering.stackexchange.com/questions/338597/folder-by-type-or-folder-by-feature)

---

**Last Updated:** November 25, 2025
**Architecture:** Feature-based, Domain-driven
**Version Control:** Git/GitHub
