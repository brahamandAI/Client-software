import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendIssueAlert(issue: any, station: any) {
  const subject = `High Priority Issue Alert - ${station.name}`;
  const html = `
    <h2>High Priority Issue Alert</h2>
    <p><strong>Station:</strong> ${station.name}</p>
    <p><strong>Priority:</strong> ${issue.priority.toUpperCase()}</p>
    <p><strong>Description:</strong> ${issue.description}</p>
    <p><strong>Reported At:</strong> ${new Date(issue.reportedAt).toLocaleString()}</p>
    <p><strong>Status:</strong> ${issue.status}</p>
    ${issue.photos.length > 0 ? `<p><strong>Photos:</strong> ${issue.photos.length} attached</p>` : ''}
  `;

  return sendEmail({
    to: process.env.SMTP_FROM || 'admin@railway.com', // Send to admin email
    subject,
    html,
  });
}

export async function sendOverdueIssueAlert(issue: any, station: any, hoursOverdue: number) {
  const subject = `Overdue Issue Alert - ${station.name}`;
  const html = `
    <h2>Overdue Issue Alert</h2>
    <p><strong>Station:</strong> ${station.name}</p>
    <p><strong>Issue ID:</strong> ${issue._id}</p>
    <p><strong>Priority:</strong> ${issue.priority.toUpperCase()}</p>
    <p><strong>Description:</strong> ${issue.description}</p>
    <p><strong>Reported At:</strong> ${new Date(issue.reportedAt).toLocaleString()}</p>
    <p><strong>Hours Overdue:</strong> ${hoursOverdue}</p>
    <p><strong>Status:</strong> ${issue.status}</p>
  `;

  return sendEmail({
    to: process.env.SMTP_FROM || 'admin@railway.com', // Send to admin email
    subject,
    html,
  });
}
