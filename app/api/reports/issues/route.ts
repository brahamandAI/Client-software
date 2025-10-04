import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Issue from '@/models/Issue';
import StationAmenity from '@/models/StationAmenity';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');
    const period = searchParams.get('period') || '7d';

    // If user is not SuperAdmin, they can only see reports for their station
    const targetStationId = session.user.role === 'SuperAdmin' ? stationId : session.user.stationId;

    if (!targetStationId) {
      return NextResponse.json(
        { error: 'Station ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Import all required models
    const Station = (await import('@/models/Station')).default;
    const StationAmenity = (await import('@/models/StationAmenity')).default;

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get all issues for the station
    const allIssues = await Issue.find({ stationId: targetStationId });
    const issuesInPeriod = allIssues.filter(issue => 
      new Date(issue.reportedAt) >= startDate
    );

    // Calculate basic metrics
    const totalIssues = allIssues.length;
    const openIssues = allIssues.filter(issue => 
      ['reported', 'acknowledged', 'assigned'].includes(issue.status)
    ).length;
    const resolvedIssues = allIssues.filter(issue => issue.status === 'resolved').length;
    const closedIssues = allIssues.filter(issue => issue.status === 'closed').length;

    // Issues by priority
    const issuesByPriority = {
      high: allIssues.filter(issue => issue.priority === 'high').length,
      medium: allIssues.filter(issue => issue.priority === 'medium').length,
      low: allIssues.filter(issue => issue.priority === 'low').length,
    };

    // Issues by status
    const issuesByStatus = {
      reported: allIssues.filter(issue => issue.status === 'reported').length,
      acknowledged: allIssues.filter(issue => issue.status === 'acknowledged').length,
      assigned: allIssues.filter(issue => issue.status === 'assigned').length,
      resolved: allIssues.filter(issue => issue.status === 'resolved').length,
      closed: allIssues.filter(issue => issue.status === 'closed').length,
    };

    // Calculate average resolution time
    const resolvedIssuesWithTime = allIssues.filter(issue => 
      issue.status === 'resolved' && issue.resolvedAt
    );
    
    let avgResolutionTime = 0;
    if (resolvedIssuesWithTime.length > 0) {
      const totalHours = resolvedIssuesWithTime.reduce((sum, issue) => {
        const reported = new Date(issue.reportedAt);
        const resolved = new Date(issue.resolvedAt!);
        return sum + (resolved.getTime() - reported.getTime()) / (1000 * 60 * 60);
      }, 0);
      avgResolutionTime = Math.round(totalHours / resolvedIssuesWithTime.length * 10) / 10;
    }

    // Get recent issues
    const recentIssues = allIssues
      .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
      .slice(0, 5)
      .map(issue => ({
        _id: issue._id.toString(),
        description: issue.description,
        priority: issue.priority,
        status: issue.status,
        reportedAt: issue.reportedAt,
      }));

    // Get top amenity types with issues
    const amenityTypes = await StationAmenity.find({ stationId: targetStationId })
      .populate('amenityTypeId');
    
    const amenityTypeCounts: { [key: string]: number } = {};
    allIssues.forEach(issue => {
      const amenity = amenityTypes.find(a => a._id.toString() === issue.stationAmenityId?.toString());
      if (amenity && amenity.amenityTypeId) {
        const typeName = (amenity.amenityTypeId as any).name || 'Unknown';
        amenityTypeCounts[typeName] = (amenityTypeCounts[typeName] || 0) + 1;
      }
    });

    const topAmenityTypes = Object.entries(amenityTypeCounts)
      .map(([amenityType, count]) => ({ amenityType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Generate resolution trends for the period
    const resolutionTrends = [];
    const daysInPeriod = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = daysInPeriod - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const reportedOnDate = allIssues.filter(issue => 
        issue.reportedAt.startsWith(dateStr)
      ).length;
      
      const resolvedOnDate = allIssues.filter(issue => 
        issue.resolvedAt && issue.resolvedAt.startsWith(dateStr)
      ).length;
      
      resolutionTrends.push({
        date: dateStr,
        reported: reportedOnDate,
        resolved: resolvedOnDate,
      });
    }

    return NextResponse.json({
      totalIssues,
      openIssues,
      resolvedIssues,
      closedIssues,
      issuesByPriority,
      issuesByStatus,
      avgResolutionTime,
      recentIssues,
      topAmenityTypes,
      resolutionTrends,
      period,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Issue analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
