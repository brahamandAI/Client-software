import { NextRequest, NextResponse } from 'next/server';
import { performHealthCheck } from '@/lib/healthCheck';

export async function GET(request: NextRequest) {
  try {
    const healthStatus = await performHealthCheck();
    
    return NextResponse.json(healthStatus, {
      status: healthStatus.overall === 'healthy' ? 200 : 503
    });
  } catch (error) {
    return NextResponse.json(
      {
        overall: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
