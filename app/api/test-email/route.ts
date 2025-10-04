import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';

export async function POST() {
  try {
    const result = await sendEmail({
      to: process.env.SMTP_FROM || 'admin@railway.com',
      subject: 'Test Email - Railway Amenities System',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from the Railway Amenities System.</p>
        <p>If you receive this email, the email system is working correctly.</p>
        <p>Timestamp: ${new Date().toLocaleString()}</p>
      `
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully',
        messageId: result.messageId 
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
