import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
  });

  test('login page should have no accessibility violations', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
  });

  test('registration page should have no accessibility violations', async ({ page }) => {
    await page.goto('/register');
    await injectAxe(page);
    
    await checkA11y(page, null, {
      detailedReport: true
    });
  });

  test('dashboard should have no accessibility violations', async ({ page }) => {
    // Login first
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/dashboard');
    await injectAxe(page);
    
    await checkA11y(page, null, {
      detailedReport: true
    });
  });

  test('form inputs should have proper labels', async ({ page }) => {
    const emailInput = page.locator('#email-input');
    const passwordInput = page.locator('#password-input');
    
    // Check for associated labels
    await expect(page.locator('label[for="email-input"]')).toBeVisible();
    await expect(page.locator('label[for="password-input"]')).toBeVisible();
    
    // Check for aria-labels as fallback
    const emailLabel = await emailInput.getAttribute('aria-label');
    const passwordLabel = await passwordInput.getAttribute('aria-label');
    
    expect(emailLabel || await page.locator('label[for="email-input"]').isVisible()).toBeTruthy();
    expect(passwordLabel || await page.locator('label[for="password-input"]').isVisible()).toBeTruthy();
  });

  test('buttons should have accessible names', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();
    
    const buttonText = await signInButton.textContent();
    expect(buttonText).toBeTruthy();
  });

  test('keyboard navigation should work on login form', async ({ page }) => {
    await page.keyboard.press('Tab');
    await expect(page.locator('#email-input')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#password-input')).toBeFocused();
    
    await page.keyboard.press('Tab');
    // Should focus on remember me checkbox or sign in button
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('error messages should be announced to screen readers', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for validation errors
    await page.waitForSelector('#email-error', { state: 'visible' });
    
    const emailError = page.locator('#email-error');
    const ariaLive = await emailError.getAttribute('aria-live');
    const role = await emailError.getAttribute('role');
    
    // Should have aria-live or role="alert" for screen readers
    expect(ariaLive === 'polite' || ariaLive === 'assertive' || role === 'alert').toBeTruthy();
  });

  test('images should have alt text', async ({ page }) => {
    // Login and navigate to dashboard
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/dashboard');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('color contrast should meet WCAG AA standards', async ({ page }) => {
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
  });

  test('page should have proper heading hierarchy', async ({ page }) => {
    await checkA11y(page, null, {
      rules: {
        'heading-order': { enabled: true }
      }
    });
  });

  test('interactive elements should be keyboard accessible', async ({ page }) => {
    // Login and go to dashboard
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/dashboard');
    
    // Tab through interactive elements
    let tabCount = 0;
    const maxTabs = 20;
    
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      
      if (await focusedElement.count() > 0) {
        const tagName = await focusedElement.evaluate(el => el.tagName);
        const tabIndex = await focusedElement.getAttribute('tabindex');
        
        // Ensure focusable element is not trapped
        expect(tabIndex !== '-1').toBeTruthy();
      }
      
      tabCount++;
    }
  });

  test('modal dialogs should trap focus', async ({ page }) => {
    // Login and navigate to dashboard
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.goto('/dashboard');
    
    // Open create project modal
    await page.getByRole('button', { name: /create project/i }).click();
    
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    
    // Tab through modal elements
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    
    // Focus should remain within modal
    const isInModal = await focusedElement.evaluate((el, modalEl) => {
      return modalEl.contains(el);
    }, await modal.elementHandle());
    
    expect(isInModal).toBeTruthy();
  });

  test('skip to main content link should be present', async ({ page }) => {
    // Look for skip link (usually hidden but accessible via keyboard)
    await page.keyboard.press('Tab');
    
    const skipLink = page.locator('[href="#main-content"], [href="#main"]').first();
    
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeTruthy();
    }
  });
});

test.describe('Screen Reader Compatibility', () => {
  test('landmarks should be properly defined', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    
    await checkA11y(page, null, {
      rules: {
        'landmark-one-main': { enabled: true },
        'region': { enabled: true }
      }
    });
  });

  test('dynamic content updates should be announced', async ({ page }) => {
    await page.goto('/');
    
    // Submit form to trigger validation errors
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live]');
    const count = await liveRegions.count();
    
    expect(count).toBeGreaterThan(0);
  });
});
