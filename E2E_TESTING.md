# E2E Testing Guide

This document describes the End-to-End (E2E) testing setup for SkillSync using Playwright.

## Overview

SkillSync uses [Playwright](https://playwright.dev/) for comprehensive E2E testing across multiple browsers and devices. Our test suite covers:

- **Authentication flows** (login, registration, logout)
- **Project management** (CRUD operations, settings, collaboration)
- **Task management** (Kanban board, assignments, comments)
- **Navigation** (routing, protected routes, deep linking)
- **Accessibility** (WCAG compliance, keyboard navigation, screen readers)
- **Performance** (Core Web Vitals, load times, memory usage)

## Test Structure

```
e2e/
├── auth.spec.js              # Authentication and registration tests
├── projects.spec.js          # Project management tests
├── tasks.spec.js             # Task management and Kanban tests
├── navigation.spec.js        # Navigation and routing tests
├── accessibility.spec.js     # Accessibility compliance tests
└── performance.spec.js       # Performance and Core Web Vitals tests
```

## Browser Coverage

Tests run on the following browsers and devices:

### Desktop
- **Chromium** (Chrome, Edge)
- **Firefox**
- **WebKit** (Safari)

### Mobile
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 12)

### Tablet
- **iPad Pro**

## Running Tests

### Run all tests
```bash
npx playwright test
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run tests in mobile device
```bash
npx playwright test --project=mobile-chrome
npx playwright test --project=mobile-safari
```

### Run specific test file
```bash
npx playwright test e2e/auth.spec.js
npx playwright test e2e/accessibility.spec.js
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

### Run tests in UI mode
```bash
npx playwright test --ui
```

## Test Reports

### HTML Report
After running tests, view the HTML report:
```bash
npx playwright show-report
```

The report includes:
- Test results for each browser
- Screenshots of failures
- Video recordings of failed tests
- Execution traces

### JSON Report
JSON report is generated at `playwright-results.json` for programmatic access.

### JUnit Report
JUnit XML report is generated at `playwright-results.xml` for CI/CD integration.

## Accessibility Testing

Accessibility tests use [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) to check for WCAG violations.

Run only accessibility tests:
```bash
npx playwright test e2e/accessibility.spec.js
```

The tests check for:
- Missing alt text on images
- Improper heading hierarchy
- Missing form labels
- Color contrast issues
- Keyboard accessibility
- Screen reader compatibility
- ARIA attributes

## Performance Testing

Performance tests measure:
- **LCP** (Largest Contentful Paint) - should be < 2.5s
- **FID** (First Input Delay) - should be < 100ms
- **CLS** (Cumulative Layout Shift) - should be < 0.1
- Page load times
- Time to Interactive
- Memory usage

Run only performance tests:
```bash
npx playwright test e2e/performance.spec.js
```

## CI/CD Integration

E2E tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests
- Manual workflow dispatch

The GitHub Actions workflow (`.github/workflows/e2e.yml`) runs tests on:
- All desktop browsers (Chromium, Firefox, WebKit)
- Mobile devices (Chrome, Safari)
- Accessibility tests

Test results are:
- Uploaded as artifacts
- Displayed in workflow summary
- Commented on pull requests

## Writing New Tests

### Basic test structure
```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await page.click('button');
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### Authentication helper
```javascript
async function login(page) {
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
}
```

### Accessibility test
```javascript
import { injectAxe, checkA11y } from 'axe-playwright';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  
  await checkA11y(page, null, {
    detailedReport: true
  });
});
```

## Best Practices

### Selectors
1. **Prefer user-facing selectors**
   - `page.getByRole('button', { name: /submit/i })`
   - `page.getByLabel('Email')`
   - `page.getByPlaceholder('Enter email')`

2. **Use data-testid for dynamic content**
   - `page.locator('[data-testid="project-card"]')`

3. **Avoid CSS selectors**
   - Don't rely on implementation details like class names

### Waits
Always wait for elements explicitly:
```javascript
await page.waitForSelector('[data-testid="content"]');
await page.waitForLoadState('networkidle');
await expect(page.locator('.result')).toBeVisible();
```

### Assertions
Use Playwright's auto-retrying assertions:
```javascript
await expect(page.locator('.status')).toContainText('Success');
await expect(page).toHaveURL(/dashboard/);
await expect(element).toBeVisible();
```

### Test Independence
- Each test should be independent
- Use `beforeEach` for setup
- Clean up after tests if needed
- Don't rely on test execution order

### Error Handling
```javascript
test('should handle errors', async ({ page }) => {
  // Test both success and failure paths
  await expect(page.locator('.error')).toBeVisible();
  await expect(page.locator('.error')).toContainText(/error message/i);
});
```

## Debugging Failed Tests

### View trace
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

### View video
Failed tests automatically record video. Find them in:
```
test-results/[test-name]/video.webm
```

### View screenshots
Screenshots are captured on failure:
```
test-results/[test-name]/**.png
```

### Run in debug mode
```bash
npx playwright test --debug e2e/auth.spec.js
```

## Configuration

Test configuration is in `playwright.config.js`:

- **Timeout**: 30 seconds per test
- **Retries**: 2 retries in CI, 0 locally
- **Workers**: 1 in CI (for stability), auto locally
- **Base URL**: http://localhost:5173
- **Screenshots**: Captured on failure
- **Video**: Retained on failure
- **Trace**: Recorded on first retry

## Troubleshooting

### Tests fail locally but pass in CI
- Ensure dev server is running
- Check for timing issues (add proper waits)
- Verify environment variables

### Tests are flaky
- Add explicit waits: `await page.waitForSelector()`
- Use `waitForLoadState('networkidle')`
- Increase timeout for slow operations

### Browser not found
```bash
npx playwright install
```

### Tests run slowly
- Run in parallel: `npx playwright test --workers=4`
- Reduce timeout for faster feedback
- Skip heavy tests during development

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Axe Accessibility Testing](https://github.com/dequelabs/axe-core)
- [Web Vitals](https://web.dev/vitals/)

## Support

For questions or issues with E2E tests, please:
1. Check this documentation
2. Review existing test examples
3. Open an issue on GitHub
4. Contact the development team
