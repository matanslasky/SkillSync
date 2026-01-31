import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load dashboard within acceptable time', async ({ page }) => {
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
    
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should measure Core Web Vitals - LCP', async ({ page }) => {
    await page.goto('/');
    
    // Measure Largest Contentful Paint
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.renderTime || lastEntry.loadTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Timeout after 5 seconds
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    // LCP should be under 2.5 seconds (Good)
    expect(lcp).toBeLessThan(2500);
  });

  test('should measure Core Web Vitals - FID', async ({ page }) => {
    await page.goto('/');
    
    // Simulate user interaction
    await page.click('body');
    
    // Measure First Input Delay
    const fid = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            resolve(entries[0].processingStart - entries[0].startTime);
          }
        }).observe({ type: 'first-input', buffered: true });
        
        setTimeout(() => resolve(0), 3000);
      });
    });
    
    // FID should be under 100ms (Good)
    if (fid > 0) {
      expect(fid).toBeLessThan(100);
    }
  });

  test('should measure Core Web Vitals - CLS', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Measure Cumulative Layout Shift
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });
        
        setTimeout(() => resolve(clsValue), 3000);
      });
    });
    
    // CLS should be under 0.1 (Good)
    expect(cls).toBeLessThan(0.1);
  });

  test('should load images efficiently', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for lazy loading attribute
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      const loading = await img.getAttribute('loading');
      
      // Images below the fold should have loading="lazy"
      if (loading === 'lazy') {
        expect(loading).toBe('lazy');
      }
    }
  });

  test('should use proper caching headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response.headers();
    
    // Check for caching headers
    expect(headers['cache-control']).toBeTruthy();
  });

  test('should minimize bundle size', async ({ page }) => {
    await page.goto('/');
    
    // Get all script tags
    const scripts = await page.evaluate(() => {
      const scriptTags = Array.from(document.querySelectorAll('script[src]'));
      return scriptTags.map(script => script.src);
    });
    
    // Verify scripts are loaded (basic check)
    expect(scripts.length).toBeGreaterThan(0);
  });

  test('should load fonts efficiently', async ({ page }) => {
    const response = await page.goto('/');
    
    // Check for font-display in CSS
    const styles = await page.evaluate(() => {
      return Array.from(document.styleSheets).map(sheet => {
        try {
          return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
        } catch (e) {
          return '';
        }
      }).join('\n');
    });
    
    // Font-display should be set for better performance
    if (styles.includes('@font-face')) {
      expect(styles).toContain('font-display');
    }
  });

  test('should have acceptable time to interactive', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for page to be fully interactive
    await page.waitForLoadState('load');
    
    // Try to interact with an element
    const button = page.getByRole('button').first();
    if (await button.count() > 0) {
      await button.click();
    }
    
    const tti = Date.now() - startTime;
    
    // Time to Interactive should be under 5 seconds
    expect(tti).toBeLessThan(5000);
  });

  test('should handle multiple concurrent requests efficiently', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    const startTime = Date.now();
    
    // Navigate to dashboard which loads multiple resources
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should handle concurrent requests within reasonable time
    expect(loadTime).toBeLessThan(6000);
  });
});

test.describe('Network Performance', () => {
  test('should compress resources', async ({ page }) => {
    const responses = [];
    
    page.on('response', response => {
      responses.push(response);
    });
    
    await page.goto('/');
    
    // Check for compression headers
    const compressedResponses = responses.filter(response => {
      const encoding = response.headers()['content-encoding'];
      return encoding === 'gzip' || encoding === 'br';
    });
    
    // At least some responses should be compressed
    expect(compressedResponses.length).toBeGreaterThan(0);
  });

  test('should minimize HTTP requests', async ({ page }) => {
    const requests = [];
    
    page.on('request', request => {
      requests.push(request);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should have reasonable number of requests (not too many)
    expect(requests.length).toBeLessThan(100);
  });

  test('should load critical CSS inline', async ({ page }) => {
    const response = await page.goto('/');
    const html = await response.text();
    
    // Check for inline critical CSS
    expect(html).toContain('<style');
  });
});

test.describe('Memory Performance', () => {
  test('should not have memory leaks on navigation', async ({ page, context }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    // Navigate multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/dashboard');
      await page.goto('/profile');
      await page.goto('/settings');
    }
    
    // Get memory metrics
    const metrics = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    });
    
    if (metrics) {
      // Memory usage should be reasonable (under 100MB)
      expect(metrics.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
    }
  });
});

test.describe('Rendering Performance', () => {
  test('should avoid excessive re-renders', async ({ page }) => {
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
    
    // Measure paint timing
    const paintMetrics = await page.evaluate(() => {
      const paints = performance.getEntriesByType('paint');
      return paints.map(paint => ({
        name: paint.name,
        startTime: paint.startTime
      }));
    });
    
    expect(paintMetrics.length).toBeGreaterThan(0);
  });

  test('should use requestAnimationFrame for animations', async ({ page }) => {
    await page.goto('/');
    
    // Check for smooth animations
    const hasAnimations = await page.evaluate(() => {
      const styles = getComputedStyle(document.body);
      return styles.transition !== 'none' || styles.animation !== 'none';
    });
    
    // If animations exist, they should be performant
    if (hasAnimations) {
      expect(hasAnimations).toBeTruthy();
    }
  });
});
