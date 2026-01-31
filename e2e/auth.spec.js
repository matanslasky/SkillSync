import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page by default', async ({ page }) => {
    await expect(page).toHaveTitle(/SkillSync/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for validation errors to appear
    await expect(page.locator('#email-error')).toBeVisible();
    await expect(page.locator('#password-error')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.locator('#email-input').fill('invalid-email');
    await page.locator('#password-input').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.locator('#email-error')).toContainText(/valid email/i);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: /create one/i }).click();
    
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  });

  test('should show password visibility toggle', async ({ page }) => {
    const passwordInput = page.locator('#password-input');
    const toggleButton = page.getByRole('button', { name: /show password/i });
    
    // Initially password type
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click again to hide
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should remember email when checkbox is checked', async ({ page, context }) => {
    const email = 'test@example.com';
    
    await page.locator('#email-input').fill(email);
    await page.locator('#rememberMe').check();
    
    // Reload page
    await page.reload();
    
    // Email should be remembered (via localStorage)
    const savedEmail = await page.evaluate(() => localStorage.getItem('rememberedEmail'));
    expect(savedEmail).toBe(email);
  });
});

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display all registration form fields', async ({ page }) => {
    await expect(page.locator('#name-input')).toBeVisible();
    await expect(page.locator('#email-input')).toBeVisible();
    await expect(page.locator('#password-input')).toBeVisible();
    await expect(page.locator('#confirm-password-input')).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    await page.locator('#name-input').fill('Test User');
    await page.locator('#email-input').fill('test@example.com');
    await page.locator('#password-input').fill('weak');
    await page.locator('#confirm-password-input').fill('weak');
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Should show password strength error
    await expect(page.locator('#password-error')).toContainText(/password must/i);
  });

  test('should validate password confirmation match', async ({ page }) => {
    await page.locator('#name-input').fill('Test User');
    await page.locator('#email-input').fill('test@example.com');
    await page.locator('#password-input').fill('StrongPass123');
    await page.locator('#confirm-password-input').fill('DifferentPass123');
    await page.getByRole('button', { name: /create account/i }).click();
    
    await expect(page.locator('#confirm-password-error')).toContainText(/passwords do not match/i);
  });

  test('should toggle both password fields visibility', async ({ page }) => {
    const passwordInput = page.locator('#password-input');
    const confirmInput = page.locator('#confirm-password-input');
    
    // Toggle password
    await page.getByRole('button', { name: /show password/i }).first().click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Toggle confirm password
    await page.getByRole('button', { name: /show password/i }).last().click();
    await expect(confirmInput).toHaveAttribute('type', 'text');
  });
});
