## Description
<!-- Provide a brief description of what this PR does -->

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## Checklist (MUST BE COMPLETED)

### Code Quality
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings or errors
- [ ] All existing tests pass

### File Structure
- [ ] **I did NOT create any files/folders in the root directory** (except docs/)
- [ ] All Django apps are in `backend/apps/` directory
- [ ] All React components are in appropriate `frontend/src/` subdirectories
- [ ] **I did NOT commit any `__pycache__` directories**
- [ ] **I did NOT commit any `.env` files**
- [ ] **I did NOT commit `node_modules/`**

### Database & Migrations
- [ ] If I created/modified models, I ran `python manage.py makemigrations`
- [ ] Migration files are named properly (0001_initial.py, 0002_description.py, etc.)
- [ ] **I did NOT modify `backend/sbcc/settings.py` database configuration**
- [ ] **I did NOT include hard-coded database credentials**
- [ ] I tested migrations on a clean database

### Backend (Django)
- [ ] I followed the feature-based structure in `backend/apps/`
- [ ] I created proper serializers for all models
- [ ] I added appropriate permissions to views
- [ ] I followed Django best practices
- [ ] **I did NOT create duplicate Django configurations**

### Frontend (React)
- [ ] I used the existing UI components from `frontend/src/components/ui/`
- [ ] I followed the features-based structure
- [ ] I used proper React hooks (no class components)
- [ ] I integrated with React Router properly
- [ ] Components are responsive (mobile-friendly)

### Testing
- [ ] I tested my changes locally
- [ ] I tested on both development and production-like environment
- [ ] **I did NOT break existing functionality**

### Documentation
- [ ] I updated the README if needed
- [ ] I added/updated JSDoc or docstrings for new functions
- [ ] I documented any new environment variables in `.env.example`

### Scope Compliance
- [ ] **I implemented ONLY what was in the PRD/requirements**
- [ ] **I did NOT add extra features that weren't requested**
- [ ] If I deviated from requirements, I have a good reason explained below

## PRD Compliance
<!-- Which PRD section does this implement? -->
- PRD Section:
- Completion: % (be honest)

## What I Changed
<!-- List specific files changed and why -->
1.
2.
3.

## What Could Break
<!-- Be honest about potential issues -->
-

## Screenshots (if UI changes)
<!-- Add screenshots of your changes -->

## Additional Notes
<!-- Any other information that reviewers should know -->

---

**⚠️ WARNING**: If you checked "No" or skipped any checklist item, your PR will be REJECTED.
**📝 NOTE**: Lead developer (@emperuna) will review ALL changes before merging.
