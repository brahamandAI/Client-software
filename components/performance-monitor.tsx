'use client';

import { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Monitor page load times
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('🚀 Page Load Time:', navEntry.loadEventEnd - navEntry.loadEventStart, 'ms');
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      
      // Monitor component render times
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        console.log('⚡ Component Render Time:', endTime - startTime, 'ms');
      };
    }
  }, []);

  return null;
}
