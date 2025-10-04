const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log('📧 Testing Email Configuration...\n');

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('✅ Transporter created successfully');
    console.log(`📧 SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`📧 SMTP Port: ${process.env.SMTP_PORT}`);
    console.log(`📧 SMTP User: ${process.env.SMTP_USER}`);
    console.log(`📧 SMTP From: ${process.env.SMTP_FROM}`);
    console.log(`📧 From Name: ${process.env.EMAIL_FROM_NAME}\n`);

    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    // Send test email
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_USER, // Send to self for testing
      subject: '🚂 Railway Amenities - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF6B35, #DC2626); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🚂 Indian Railways</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Passenger Amenities Management System</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #FF6B35; margin-top: 0;">✅ Email Configuration Test</h2>
            <p>This is a test email to verify that the email configuration is working properly.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF6B35;">
              <h3 style="color: #333; margin-top: 0;">📧 Email Details:</h3>
              <ul style="color: #666;">
                <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</li>
                <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT}</li>
                <li><strong>From Email:</strong> ${process.env.SMTP_FROM}</li>
                <li><strong>From Name:</strong> ${process.env.EMAIL_FROM_NAME}</li>
                <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              If you received this email, your email configuration is working correctly! 🎉
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 Indian Railways - Passenger Amenities Management System</p>
          </div>
        </div>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Response: ${info.response}`);
    console.log(`📧 To: ${info.accepted.join(', ')}`);
    console.log(`📧 Rejected: ${info.rejected.join(', ') || 'None'}\n`);

    console.log('🎉 Email configuration is working perfectly!');
    console.log('📧 Check your inbox for the test email.');

  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔑 Authentication failed. Check your email credentials:');
      console.error(`   SMTP User: ${process.env.SMTP_USER}`);
      console.error(`   SMTP Pass: ${process.env.SMTP_PASS ? '***' : 'NOT SET'}`);
    } else if (error.code === 'ECONNECTION') {
      console.error('\n🌐 Connection failed. Check your SMTP settings:');
      console.error(`   SMTP Host: ${process.env.SMTP_HOST}`);
      console.error(`   SMTP Port: ${process.env.SMTP_PORT}`);
    }
  }
}

testEmail().then(() => {
  console.log('\n✅ Email test completed');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Email test failed:', error);
  process.exit(1);
});
