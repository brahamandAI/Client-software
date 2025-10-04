import 'dotenv/config';
import { performHealthCheck, logHealthStatus } from '../lib/healthCheck';

async function runHealthTest() {
  console.log('🏥 Starting Health Check Test...\n');
  
  try {
    const healthStatus = await performHealthCheck();
    logHealthStatus(healthStatus);
    
    if (healthStatus.overall === 'healthy') {
      console.log('🎉 All systems are working perfectly!');
      console.log('📧 Check your email inbox for the health check email.');
    } else {
      console.log('⚠️  Some services need attention.');
    }
  } catch (error) {
    console.error('❌ Health check failed:', error);
  }
}

runHealthTest();
