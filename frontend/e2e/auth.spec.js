import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page loads correctly', async ({ page }) => {
    // Increase timeout for slow navigation (26s observed)
    test.setTimeout(60000);

    await page.goto('/login');

    // Verify login form elements are present
    // The heading is "SBCC Management System" not "login" or "sign in"
    await expect(page.getByRole('heading', { level: 1 })).toContainText('SBCC Management');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    // Button text is "Log In" (with space)
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
  });

  test('shows validation errors for empty form', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/login');

    // Click login without filling in credentials
    await page.getByRole('button', { name: 'Log In' }).click();

    // Should show validation errors
    await expect(page.getByText('Username is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    // Try to access dashboard without auth
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});
