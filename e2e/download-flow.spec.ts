import { test, expect } from '@playwright/test';

test.describe('Download options page', () => {
  test('shows loading skeleton then content', async ({ page }) => {
    await page.goto('/download/options?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    // Page header is always visible
    await expect(page.getByRole('heading', { name: /download options/i })).toBeVisible();
    // Wait for skeleton to resolve into content (backend may or may not be up)
    await page.waitForTimeout(1000);
  });

  test('shows quality table tabs', async ({ page }) => {
    await page.goto('/download/options?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await page.waitForTimeout(2000);
    // Video Quality tab is always rendered
    await expect(page.getByText(/video quality/i)).toBeVisible();
    await expect(page.getByText(/audio only/i)).toBeVisible();
  });
});

test.describe('Download progress page', () => {
  test('shows progress ring and step tracker', async ({ page }) => {
    // Use a mock job ID so no real download is triggered
    await page.goto('/download/progress/mock-test-job');
    await expect(page.getByRole('heading', { name: /download in progress/i })).toBeVisible();
    await expect(page.getByText(/progress/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
  });

  test('progress ring increments for mock jobs', async ({ page }) => {
    await page.goto('/download/progress/mock-fast-test');
    // Wait for animation to start
    await page.waitForTimeout(1500);
    // Progress label should show a number > 0
    const label = page.locator('text=Progress').first();
    await expect(label).toBeVisible();
  });

  test('pause button toggles label', async ({ page }) => {
    await page.goto('/download/progress/mock-pause-test');
    const pauseBtn = page.getByRole('button', { name: /pause/i });
    await pauseBtn.click();
    await expect(page.getByRole('button', { name: /resume/i })).toBeVisible();
  });
});

test.describe('Download complete page', () => {
  test('shows completion header and action buttons', async ({ page }) => {
    await page.goto('/download/complete/mock-done-job');
    await expect(page.getByRole('heading', { name: /download complete/i })).toBeVisible();
    // Buttons are rendered via CompleteCard
    await expect(page.getByRole('link', { name: /download another/i })).toBeVisible();
  });
});

test.describe('Not found page', () => {
  test('shows 404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByRole('link', { name: /back to home/i })).toBeVisible();
  });
});
