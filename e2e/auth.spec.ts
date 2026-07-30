import { test, expect } from '@playwright/test';

test.describe('Auth pages', () => {
  test('login page renders form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByPlaceholder(/you@example.com/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('register page renders form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
    await expect(page.getByPlaceholder(/jane smith/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create free account/i })).toBeVisible();
  });

  test('login form shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('register form shows password mismatch error', async ({ page }) => {
    await page.goto('/register');
    await page.getByPlaceholder(/jane smith/i).fill('Test User');
    await page.getByPlaceholder(/you@example.com/i).fill('test@example.com');
    // Fill both password fields with non-matching values
    const pwInputs = page.getByPlaceholder(/min. 8 characters/i);
    await pwInputs.fill('password123');
    await page.getByPlaceholder(/re-enter password/i).fill('different456');
    await page.getByRole('button', { name: /create free account/i }).click();
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('login page has link to register', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /create one/i }).click();
    await expect(page).toHaveURL('/register');
  });
});
