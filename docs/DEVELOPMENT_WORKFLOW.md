# Development Workflow

Guide for contributing to the SBCC Management System project.

## Branch Strategy

```
main                         # Production-ready code
└── dev                      # Development integration branch
    ├── feature/feature-name
    ├── fix/bug-description
    ├── hotfix/urgent-fix
    ├── docs/documentation-update
    ├── design/ui-improvement
    ├── refactor/code-optimization
    └── chore/maintenance-task
```

### Branch Types

| Prefix      | Purpose                 | Example                      |
| ----------- | ----------------------- | ---------------------------- |
| `feature/`  | New features            | `feature/prayer-requests`    |
| `fix/`      | Bug fixes               | `fix/attendance-calculation` |
| `hotfix/`   | Urgent production fixes | `hotfix/security-patch`      |
| `docs/`     | Documentation           | `docs/api-documentation`     |
| `design/`   | UI/UX changes           | `design/dashboard-layout`    |
| `refactor/` | Code improvements       | `refactor/optimize-queries`  |
| `chore/`    | Maintenance tasks       | `chore/update-dependencies`  |

## Basic Workflow

### 1. Create Branch (from dev)

```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

### 2. Make Changes

```bash
git add .
git commit -m "feat(scope): description"
```

### 3. Push & Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request to `dev` branch on GitHub.

### 4. Merge Flow

```
feature/* → dev → main
```

- Feature branches merge into `dev`
- `dev` merges into `main` for releases
- `hotfix/*` branches merge directly into `main` (then back to `dev`)

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

### Types

| Type       | Description      |
| ---------- | ---------------- |
| `feat`     | New feature      |
| `fix`      | Bug fix          |
| `docs`     | Documentation    |
| `style`    | Formatting       |
| `refactor` | Code refactoring |
| `test`     | Adding tests     |
| `chore`    | Maintenance      |

### Scopes

`authentication`, `members`, `ministries`, `events`, `attendance`, `inventory`, `dashboard`, `announcements`, `prayer-requests`, `visitors`, `tasks`, `meeting-minutes`, `settings`, `public`, `api`

### Examples

```bash
git commit -m "feat(members): add member search functionality"
git commit -m "fix(attendance): resolve duplicate check-in issue"
git commit -m "docs(api): update endpoint documentation"
git commit -m "refactor(dashboard): extract statistics logic"
```

## Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Documentation

## Testing

- [ ] Tests pass
- [ ] Manual testing completed

## Breaking Changes

None / Describe if any
```

## Sync Your Branch

```bash
git checkout dev
git pull origin dev
git checkout your-branch
git rebase dev
git push --force-with-lease
```

## Code Review Checklist

### Before Submitting

- [ ] Follows commit conventions
- [ ] Tests pass
- [ ] No console errors
- [ ] Migrations included (if applicable)

### For Reviewers

- [ ] Code logic is correct
- [ ] No security issues
- [ ] Error handling present
- [ ] Documentation updated

## Database Migrations

```bash
# Create migrations (in order)
python manage.py makemigrations authentication
python manage.py makemigrations ministries
python manage.py makemigrations members
python manage.py makemigrations events
python manage.py makemigrations attendance

# Apply migrations
python manage.py migrate
```

## Quick Reference

### Git Commands

```bash
git status                    # Check status
git log --oneline            # View history
git stash                    # Stash changes
git stash pop                # Restore stash
git reset --soft HEAD~1      # Undo last commit
```

### Django Commands

```bash
python manage.py test                    # Run tests
python manage.py check                   # Verify config
python manage.py showmigrations          # Migration status
```

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Documentation](https://git-scm.com/doc)

---

**Last Updated:** December 22, 2025
