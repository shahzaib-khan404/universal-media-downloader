import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads and shows the hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Universal Media Downloader/i);
    await expect(page.getByRole('heading', { name: /download video & audio/i })).toBeVisible();
  });

  test('shows the URL input bar', async ({ page }) => {
    await page.goto('/');
    const input = page.getByPlaceholder(/paste url here/i);
    await expect(input).toBeVisible();
  });

  test('navigates to options page on URL submit', async ({ page }) => {
    await page.goto('/');
    const input = page.getByPlaceholder(/paste url here/i);
    await input.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await page.getByRole('button', { name: /download/i }).click();
    await expect(page).toHaveURL(/\/download\/options\?url=/);
  });

  test('shows nav links for Sign In and Try Free', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /try free/i })).toBeVisible();
  });

  test('pricing link navigates correctly', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /pricing/i }).click();
    await expect(page).toHaveURL('/pricing');
  });
});
