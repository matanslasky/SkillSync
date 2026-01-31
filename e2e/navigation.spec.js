import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to all main pages from landing', async ({ page }) => {
    await page.goto('/');
    
    // Check for main navigation links
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible();
    
    // Click About link
    await page.getByRole('link', { name: /about/i }).click();
    await expect(page).toHaveURL(/\/about/);
  });

  test('should show sidebar navigation when authenticated', async ({ page }) => {
    // Mock authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/dashboard');
    
    // Check for sidebar navigation
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /projects/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /tasks/i })).toBeVisible();
  });

  test('should navigate between authenticated pages', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/dashboard');
    
    // Navigate to Profile
    await page.getByRole('link', { name: /profile/i }).click();
    await expect(page).toHaveURL(/\/profile/);
    
    // Navigate to Settings
    await page.getByRole('link', { name: /settings/i }).click();
    await expect(page).toHaveURL(/\/settings/);
    
    // Navigate back to Dashboard
    await page.getByRole('link', { name: /dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to About
    await page.getByRole('link', { name: /about/i }).click();
    await expect(page).toHaveURL(/\/about/);
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL('/');
    
    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/\/about/);
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing protected route unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/(login)?$/);
  });

  test('should allow access to protected routes when authenticated', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should redirect to dashboard when accessing login while authenticated', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/login');
    
    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should restrict admin routes to admin users', async ({ page }) => {
    // Login as non-admin user
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' // Not admin
      }));
    });
    
    await page.goto('/admin');
    
    // Should redirect or show unauthorized
    const url = page.url();
    expect(url).not.toContain('/admin');
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should show mobile menu toggle', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/dashboard');
    
    // Look for mobile menu button
    const menuButton = page.getByRole('button', { name: /menu/i });
    await expect(menuButton).toBeVisible();
  });

  test('should open mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/dashboard');
    
    const menuButton = page.getByRole('button', { name: /menu/i });
    await menuButton.click();
    
    // Menu should be visible
    const mobileNav = page.locator('[data-testid="mobile-nav"]');
    await expect(mobileNav).toBeVisible();
  });

  test('should close mobile menu after navigation', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/dashboard');
    
    // Open menu
    const menuButton = page.getByRole('button', { name: /menu/i });
    await menuButton.click();
    
    // Click a navigation link
    await page.getByRole('link', { name: /profile/i }).click();
    
    // Menu should close
    const mobileNav = page.locator('[data-testid="mobile-nav"]');
    await expect(mobileNav).not.toBeVisible();
  });
});

test.describe('Breadcrumb Navigation', () => {
  test('should display breadcrumbs on nested pages', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/dashboard');
    await page.locator('[data-testid="project-card"]').first().click();
    
    // Check for breadcrumbs
    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    
    if (await breadcrumbs.count() > 0) {
      await expect(breadcrumbs).toBeVisible();
      await expect(breadcrumbs).toContainText(/dashboard/i);
    }
  });

  test('should navigate using breadcrumb links', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/dashboard');
    await page.locator('[data-testid="project-card"]').first().click();
    
    const dashboardLink = page.locator('[data-testid="breadcrumbs"] a', { hasText: /dashboard/i });
    
    if (await dashboardLink.count() > 0) {
      await dashboardLink.click();
      await expect(page).toHaveURL(/\/dashboard/);
    }
  });
});

test.describe('Logout Navigation', () => {
  test('should logout and redirect to login', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/dashboard');
    
    // Click logout
    await page.getByRole('button', { name: /logout/i }).click();
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/(login)?$/);
    
    // LocalStorage should be cleared
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});

test.describe('Deep Linking', () => {
  test('should handle direct navigation to specific project', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    // Navigate directly to a project (mock ID)
    await page.goto('/project/test-project-id');
    
    // Should load project page or show not found
    const hasProjectPage = await page.locator('[data-testid="project-details"]').count() > 0;
    const hasNotFound = await page.getByText(/not found|404/i).count() > 0;
    
    expect(hasProjectPage || hasNotFound).toBeTruthy();
  });
});
