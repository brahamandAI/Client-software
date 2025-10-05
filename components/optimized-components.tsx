'use client';

import React, { memo } from 'react';

// Memoized components for better performance
export const MemoizedCard = memo(({ children, className, ...props }: any) => (
  <div className={`bg-white rounded-lg shadow p-6 ${className}`} {...props}>
    {children}
  </div>
));

export const MemoizedButton = memo(({ children, className, ...props }: any) => (
  <button className={`px-4 py-2 rounded font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
));

// Lazy load heavy components
export const LazyCharts = React.lazy(() => import('./lazy-charts'));

// Loading fallback
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-railway-orange"></div>
  </div>
);
