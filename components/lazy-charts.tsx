'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy chart components
export const LazyLineChart = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
  ssr: false,
});

export const LazyBarChart = dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
  ssr: false,
});

export const LazyPieChart = dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart })), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
  ssr: false,
});

// Wrapper component for charts
export function ChartWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded" />}>
      {children}
    </Suspense>
  );
}

// Default export for React.lazy
export default function LazyCharts() {
  return (
    <div className="space-y-4">
      <LazyLineChart />
      <LazyBarChart />
      <LazyPieChart />
    </div>
  );
}