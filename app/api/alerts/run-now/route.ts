import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Issue from '@/models/Issue';
import Station from '@/models/Station';
import { sendOverdueIssueAlert } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only SuperAdmin can run alerts
    if (session.user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { error: 'Forbidden - Only SuperAdmin can run alerts' },
        { status: 403 }
      );
    }

    await connectDB();

    // Find overdue issues (older than 24 hours and not resolved)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const overdueIssues = await Issue.find({
      reportedAt: { $lt: twentyFourHoursAgo },
      status: { $nin: ['resolved', 'closed'] },
    }).populate('stationId');

    const results = [];

    for (const issue of overdueIssues) {
      const hoursOverdue = Math.floor(
        (Date.now() - issue.reportedAt.getTime()) / (1000 * 60 * 60)
      );

      try {
        const result = await sendOverdueIssueAlert(issue, issue.stationId, hoursOverdue);
        results.push({
          issueId: issue._id,
          stationName: issue.stationId?.name,
          hoursOverdue,
          emailSent: result.success,
          error: result.error,
        });
      } catch (error) {
        results.push({
          issueId: issue._id,
          stationName: issue.stationId?.name,
          hoursOverdue,
          emailSent: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${overdueIssues.length} overdue issues`,
      results,
    });
  } catch (error) {
    console.error('Run alerts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
