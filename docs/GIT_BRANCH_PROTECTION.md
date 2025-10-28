# Git Branch Protection Rules

## Configure these settings on GitHub repository settings:

### Main Branch Protection
Go to: Settings → Branches → Branch protection rules → Add rule

**Branch name pattern**: `main`

#### Enable the following:

✅ **Require pull request reviews before merging**
   - Required approving reviews: 1
   - Dismiss stale pull request approvals when new commits are pushed
   - Require review from Code Owners (@emperuna)

✅ **Require status checks to pass before merging**
   - Require branches to be up to date before merging

✅ **Require conversation resolution before merging**

✅ **Require linear history**

✅ **Do not allow bypassing the above settings**

✅ **Restrict who can push to matching branches**
   - Add: @emperuna (you only)

#### Rules for Feature Branches

**Branch name pattern**: `feat/*`, `fix/*`, `refactor/*`

- Require pull request reviews: 1
- Do NOT allow force pushes
- Allow deletions (after merge)

## CRITICAL: Prevent Direct Commits to Main

Nobody (including you) should commit directly to `main`.
All changes must go through:
1. Feature branch
2. Pull request
3. Code review
4. Approval
5. Merge

## Team Member Access Levels

- **@emperuna** (you): Admin - final review authority
- **Other team members**: Write access - can create branches and PRs, cannot merge to main

## Naming Conventions (ENFORCE THESE)

- `feat/description-here` - New features
- `fix/bug-description` - Bug fixes
- `refactor/what-changed` - Code refactoring
- `docs/what-documented` - Documentation only
- `test/what-tested` - Test additions/changes

**❌ NEVER ALLOWED:**
- Random branch names
- Committing to main directly
- Skipping PR process
