import { test, expect } from '@playwright/test';

test.describe('Browser Compatibility - Images', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page which should have basic styling
    await page.goto('/login');
  });

  test('page renders without console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Only filter out truly expected errors (be conservative here)
    // Image load failures should be caught by the dedicated image test
    const criticalErrors = consoleErrors.filter(
      err => !err.includes('DevTools') &&
             !err.includes('[vite]') &&
             !err.includes('WebSocket')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('logo and images load correctly', async ({ page }) => {
    await page.goto('/login');

    // Wait for images to load
    await page.waitForLoadState('networkidle');

    // Check all images have loaded (no broken images)
    const images = await page.locator('img').all();
    const failedImages = [];

    for (const img of images) {
      const isVisible = await img.isVisible();
      if (isVisible) {
        // Check that image has rendered (naturalWidth > 0 means it loaded)
        const naturalWidth = await img.evaluate(el => el.naturalWidth);
        if (naturalWidth === 0) {
          const src = await img.getAttribute('src');
          failedImages.push(src);
        }
      }
    }

    // Fail the test if any visible images didn't load
    expect(failedImages, `Failed to load images: ${failedImages.join(', ')}`).toHaveLength(0);
  });

  test('CSS styling renders consistently', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/login');

    // Check that Tailwind CSS has loaded (button should have styling)
    const loginButton = page.getByRole('button', { name: 'Log In' });
    await expect(loginButton).toBeVisible();

    // Verify basic styling is applied (not unstyled)
    const buttonColor = await loginButton.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );

    // Button should have some background color (not transparent)
    expect(buttonColor).not.toBe('rgba(0, 0, 0, 0)');
  });
});

test.describe('Cross-Browser Date Input', () => {
  test('date inputs are accessible', async ({ page, browserName }) => {
    await page.goto('/login');

    // This test is a placeholder - when we have access to forms with date inputs
    // we'll verify they work across browsers

    // Safari/WebKit has known quirks with date inputs
    if (browserName === 'webkit') {
      test.info().annotations.push({
        type: 'note',
        description: 'WebKit date input compatibility check'
      });
    }
  });
});
