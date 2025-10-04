import { performHealthCheck, logHealthStatus } from './healthCheck';

export async function runStartupHealthCheck() {
  console.log('🔍 Running startup health check...');
  
  try {
    const healthStatus = await performHealthCheck();
    logHealthStatus(healthStatus);
    
    // If unhealthy, log warnings but don't crash the server
    if (healthStatus.overall === 'unhealthy') {
      console.log('⚠️  WARNING: Some services are not working properly.');
      console.log('   The server will start but some features may not work.');
    }
    
    return healthStatus;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    console.log('⚠️  Server will start but health status is unknown.');
    return null;
  }
}
