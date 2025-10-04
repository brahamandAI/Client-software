import 'dotenv/config';
import connectDB from './db';
import { sendEmail } from './mailer';

export interface HealthStatus {
  database: {
    status: 'connected' | 'disconnected' | 'error';
    message: string;
    responseTime?: number;
  };
  email: {
    status: 'working' | 'not_working' | 'error';
    message: string;
  };
  overall: 'healthy' | 'unhealthy';
  timestamp: string;
}

export async function performHealthCheck(): Promise<HealthStatus> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  let databaseStatus = { status: 'disconnected' as const, message: 'Not checked' };
  let emailStatus = { status: 'not_working' as const, message: 'Not checked' };

  // Check Database Connection
  try {
    const dbStartTime = Date.now();
    await connectDB();
    const dbResponseTime = Date.now() - dbStartTime;
    
    databaseStatus = {
      status: 'connected',
      message: `Connected successfully (${dbResponseTime}ms)`,
      responseTime: dbResponseTime,
    };
  } catch (error) {
    databaseStatus = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown database error',
    };
  }

  // Check Email Service
  try {
    const testResult = await sendEmail({
      to: process.env.SMTP_FROM || 'admin@railway.com',
      subject: 'Health Check - Railway Amenities',
      html: `
        <h3>Health Check Email</h3>
        <p>This is an automated health check email.</p>
        <p><strong>Timestamp:</strong> ${timestamp}</p>
        <p>If you receive this email, the email service is working correctly.</p>
      `,
    });

    if (testResult.success) {
      emailStatus = {
        status: 'working',
        message: `Email sent successfully (Message ID: ${testResult.messageId})`,
      };
    } else {
      emailStatus = {
        status: 'not_working',
        message: `Email failed: ${testResult.error}`,
      };
    }
  } catch (error) {
    emailStatus = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown email error',
    };
  }

  // Determine overall health
  const overall = databaseStatus.status === 'connected' && emailStatus.status === 'working' 
    ? 'healthy' 
    : 'unhealthy';

  return {
    database: databaseStatus,
    email: emailStatus,
    overall,
    timestamp,
  };
}

export function logHealthStatus(status: HealthStatus) {
  console.log('\n' + '='.repeat(60));
  console.log('🏥 RAILWAY AMENITIES - HEALTH CHECK');
  console.log('='.repeat(60));
  console.log(`⏰ Timestamp: ${status.timestamp}`);
  console.log(`🎯 Overall Status: ${status.overall === 'healthy' ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
  console.log('\n📊 Service Status:');
  
  // Database Status
  const dbIcon = status.database.status === 'connected' ? '✅' : '❌';
  console.log(`${dbIcon} Database: ${status.database.status.toUpperCase()}`);
  console.log(`   Message: ${status.database.message}`);
  
  // Email Status  
  const emailIcon = status.email.status === 'working' ? '✅' : '❌';
  console.log(`${emailIcon} Email: ${status.email.status.toUpperCase()}`);
  console.log(`   Message: ${status.email.message}`);
  
  console.log('='.repeat(60));
  console.log('🚀 Server is ready to accept requests!\n');
}
