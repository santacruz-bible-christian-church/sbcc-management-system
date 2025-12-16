# Branch Protection Setup for `main`

This document describes the recommended GitHub branch protection settings to ensure `main` is always deployable.

## Required Settings

Navigate to: **Settings → Branches → Add branch protection rule**

### Branch name pattern

```
main
```

### Recommended Protection Rules

| Setting                                                              | Value      | Reason                         |
| -------------------------------------------------------------------- | ---------- | ------------------------------ |
| **Require a pull request before merging**                            | ✅ Enabled | Prevents direct pushes to main |
| **Require approvals**                                                | 1          | At least one review required   |
| **Dismiss stale pull request approvals when new commits are pushed** | ✅ Enabled | Re-review after changes        |
| **Require status checks to pass before merging**                     | ✅ Enabled | CI must pass before merge      |
| **Require branches to be up to date before merging**                 | ✅ Enabled | Ensures no merge conflicts     |

### Required Status Checks

Add **only this check** as required:

1. **All CI Passed** - Aggregated status from `ci-required.yml`

> **Note:** Do NOT add `Lint & Format`, `Django Tests`, or `Lint & Build` directly.
> The `All CI Passed` check automatically handles path-filtered workflows, so PRs
> won't be blocked when only backend or only frontend files change.

### Optional (Recommended)

| Setting                                        | Value      | Reason                        |
| ---------------------------------------------- | ---------- | ----------------------------- |
| **Do not allow bypassing the above settings**  | ✅ Enabled | Even admins must follow rules |
| **Restrict who can push to matching branches** | ✅ Enabled | Only CI can push              |

## Quick Setup Steps

1. Go to your GitHub repository
2. Click **Settings** (top right)
3. Click **Branches** in the left sidebar
4. Click **Add branch ruleset** or **Add branch protection rule**
5. Enter `main` as the branch name pattern
6. Enable the settings as described above
7. Click **Create** or **Save changes**

## Verification

After setup, test by:

1. Creating a feature branch
2. Making a small change
3. Opening a PR against `main`
4. Verify all status checks appear and are required
