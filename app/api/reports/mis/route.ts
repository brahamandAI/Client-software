import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/apiAuth';
import { calculateMISMetrics } from '@/lib/calcReports';
import { z } from 'zod';

const misReportSchema = z.object({
  station: z.string().nullable().optional(),
  period: z.enum(['daily', 'weekly', 'monthly']).optional().default('daily'),
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const { searchParams } = new URL(request.url);
    const station = searchParams.get('station');
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' || 'daily';

    // Validate parameters - only validate if station is provided
    const validation = misReportSchema.safeParse({ 
      station: station || null, 
      period 
    });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.errors },
        { status: 400, headers: corsHeaders }
      );
    }

    // If user is not SuperAdmin, they can only see reports for their station
    const stationId = user.role === 'SuperAdmin' ? (station || undefined) : user.stationId;

    const metrics = await calculateMISMetrics(stationId, period);

    // Get additional data for analytics
    const connectDB = (await import('@/lib/db')).default;
    const Station = (await import('@/models/Station')).default;
    const User = (await import('@/models/User')).default;
    const Issue = (await import('@/models/Issue')).default;
    const StationAmenity = (await import('@/models/StationAmenity')).default;

    await connectDB();

    // Get all data for analytics
    const stations = await Station.find({});
    const users = await User.find({});
    const allIssues = await Issue.find({});
    const allAmenities = await StationAmenity.find({});

    // Calculate issues by priority
    const issuesByPriority = {
      high: allIssues.filter(issue => issue.priority === 'high').length,
      medium: allIssues.filter(issue => issue.priority === 'medium').length,
      low: allIssues.filter(issue => issue.priority === 'low').length,
    };

    // Calculate issues by status
    const issuesByStatus = {
      reported: allIssues.filter(issue => issue.status === 'reported').length,
      acknowledged: allIssues.filter(issue => issue.status === 'acknowledged').length,
      assigned: allIssues.filter(issue => issue.status === 'assigned').length,
      resolved: allIssues.filter(issue => issue.status === 'resolved').length,
      closed: allIssues.filter(issue => issue.status === 'closed').length,
    };

    // Calculate station data
    const stationsData = await Promise.all(stations.map(async (station) => {
      const stationIssues = allIssues.filter(issue => issue.stationId === station._id.toString());
      const stationAmenities = allAmenities.filter(amenity => amenity.stationId.toString() === station._id.toString());
      const workingAmenities = stationAmenities.filter(amenity => amenity.status === 'ok').length;
      const uptimePercentage = stationAmenities.length > 0 ? (workingAmenities / stationAmenities.length) * 100 : 0;

      return {
        _id: station._id.toString(),
        name: station.name,
        code: station.code,
        city: station.city,
        state: station.state,
        totalAmenities: stationAmenities.length,
        workingAmenities,
        issuesCount: stationIssues.length,
        uptimePercentage,
      };
    }));

    // Get recent issues
    const recentIssues = allIssues
      .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
      .slice(0, 10)
      .map(issue => ({
        _id: issue._id.toString(),
        description: issue.description,
        priority: issue.priority,
        status: issue.status,
        stationName: stations.find(s => s._id.toString() === issue.stationId)?.name || 'Unknown',
        reportedAt: issue.reportedAt,
      }));

    // Calculate system uptime
    const totalSystemAmenities = allAmenities.length;
    const workingSystemAmenities = allAmenities.filter(amenity => amenity.status === 'ok').length;
    const systemUptime = totalSystemAmenities > 0 ? (workingSystemAmenities / totalSystemAmenities) * 100 : 0;

    return NextResponse.json({
      period,
      station: stationId,
      metrics,
      generatedAt: new Date().toISOString(),
      // Analytics data
      totalStations: stations.length,
      totalUsers: users.length,
      totalIssues: allIssues.length,
      totalAmenities: allAmenities.length,
      issuesByPriority,
      issuesByStatus,
      stationsData,
      recentIssues,
      avgResolutionTime: metrics.avgResolutionTime,
      systemUptime,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('MIS report error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
