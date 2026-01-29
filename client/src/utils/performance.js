/**
 * Performance Monitoring Utilities
 * 
 * Provides tools to measure and track application performance.
 */

/**
 * Measure component render time
 * Usage: const stopTimer = measureRender('ComponentName');
 *        // ... render logic
 *        stopTimer();
 */
export const measureRender = (componentName) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 16.67) { // Longer than one frame (60fps)
      console.warn(`⚠️ Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
    } else {
      console.log(`✅ ${componentName} rendered in ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  };
};

/**
 * Measure API call duration
 */
export const measureApiCall = async (apiName, apiFunction) => {
  const startTime = performance.now();
  
  try {
    const result = await apiFunction();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 1000) {
      console.warn(`⚠️ Slow API call: ${apiName} took ${duration.toFixed(2)}ms`);
    } else {
      console.log(`✅ API call: ${apiName} completed in ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.error(`❌ API call failed: ${apiName} after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * Track page load performance
 */
export const trackPageLoad = (pageName) => {
  if (typeof window !== 'undefined' && window.performance) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
    
    console.log(`📊 Page Load Metrics for ${pageName}:`);
    console.log(`  - Total Load Time: ${pageLoadTime}ms`);
    console.log(`  - DOM Ready: ${domReadyTime}ms`);
    
    // Log warning if page load is slow
    if (pageLoadTime > 3000) {
      console.warn(`⚠️ Slow page load detected: ${pageLoadTime}ms`);
    }
  }
};

/**
 * Measure bundle size impact
 */
export const measureBundleSize = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const resources = window.performance.getEntriesByType('resource');
    
    let totalSize = 0;
    const bundleStats = {
      js: 0,
      css: 0,
      images: 0,
      fonts: 0,
      other: 0
    };
    
    resources.forEach(resource => {
      const size = resource.transferSize || 0;
      totalSize += size;
      
      if (resource.name.endsWith('.js')) {
        bundleStats.js += size;
      } else if (resource.name.endsWith('.css')) {
        bundleStats.css += size;
      } else if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(resource.name)) {
        bundleStats.images += size;
      } else if (/\.(woff|woff2|ttf|eot)$/i.test(resource.name)) {
        bundleStats.fonts += size;
      } else {
        bundleStats.other += size;
      }
    });
    
    console.log('📦 Bundle Size Analysis:');
    console.log(`  - JavaScript: ${(bundleStats.js / 1024).toFixed(2)} KB`);
    console.log(`  - CSS: ${(bundleStats.css / 1024).toFixed(2)} KB`);
    console.log(`  - Images: ${(bundleStats.images / 1024).toFixed(2)} KB`);
    console.log(`  - Fonts: ${(bundleStats.fonts / 1024).toFixed(2)} KB`);
    console.log(`  - Other: ${(bundleStats.other / 1024).toFixed(2)} KB`);
    console.log(`  - Total: ${(totalSize / 1024).toFixed(2)} KB`);
    
    return bundleStats;
  }
  
  return null;
};

/**
 * Memory usage monitoring
 */
export const checkMemoryUsage = () => {
  if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
    const memory = window.performance.memory;
    const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
    const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
    const limitMB = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);
    
    console.log('💾 Memory Usage:');
    console.log(`  - Used: ${usedMB} MB`);
    console.log(`  - Total: ${totalMB} MB`);
    console.log(`  - Limit: ${limitMB} MB`);
    
    const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    if (usagePercent > 80) {
      console.warn(`⚠️ High memory usage detected: ${usagePercent.toFixed(2)}%`);
    }
    
    return {
      used: usedMB,
      total: totalMB,
      limit: limitMB,
      usagePercent: usagePercent.toFixed(2)
    };
  }
  
  console.warn('Memory API not available in this browser');
  return null;
};

/**
 * Create a performance observer to track long tasks
 */
export const observeLongTasks = () => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      
      return () => observer.disconnect();
    } catch (e) {
      console.warn('Long task observation not supported');
    }
  }
  
  return () => {};
};

/**
 * Track Core Web Vitals
 */
export const trackWebVitals = (callback) => {
  if (typeof window !== 'undefined') {
    // Largest Contentful Paint (LCP)
    const observeLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        callback({
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          rating: lastEntry.renderTime < 2500 ? 'good' : lastEntry.renderTime < 4000 ? 'needs-improvement' : 'poor'
        });
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observation not supported');
      }
    };
    
    // First Input Delay (FID)
    const observeFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          callback({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            rating: entry.processingStart - entry.startTime < 100 ? 'good' : 
                   entry.processingStart - entry.startTime < 300 ? 'needs-improvement' : 'poor'
          });
        });
      });
      
      try {
        observer.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observation not supported');
      }
    };
    
    // Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            
            callback({
              name: 'CLS',
              value: clsValue,
              rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
            });
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observation not supported');
      }
    };
    
    observeLCP();
    observeFID();
    observeCLS();
  }
};

export default {
  measureRender,
  measureApiCall,
  trackPageLoad,
  measureBundleSize,
  checkMemoryUsage,
  observeLongTasks,
  trackWebVitals
};
