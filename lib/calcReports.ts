import connectDB from './db';
import Issue from '@/models/Issue';
import Inspection from '@/models/Inspection';
import StationAmenity from '@/models/StationAmenity';
import AmenityType from '@/models/AmenityType';

export interface MISMetrics {
  uptimeByAmenityType: Record<string, number>;
  avgResolutionTime: number;
  openIssuesCount: number;
  totalIssuesCount: number;
  resolvedIssuesCount: number;
  highPriorityIssuesCount: number;
  inspectionsCount: number;
}

export async function calculateMISMetrics(
  stationId?: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<MISMetrics> {
  try {
    await connectDB();

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Build query for station filter
    const stationQuery = stationId ? { stationId } : {};

    // Get uptime by amenity type
    const amenityTypes = await AmenityType.find({});
    const uptimeByAmenityType: Record<string, number> = {};

    for (const amenityType of amenityTypes) {
      try {
        const stationAmenities = await StationAmenity.find({
          ...stationQuery,
          amenityTypeId: amenityType._id,
        });

        if (stationAmenities.length === 0) {
          uptimeByAmenityType[amenityType.key || 'unknown'] = 0;
          continue;
        }

        const totalAmenities = stationAmenities.length;
        const workingAmenities = stationAmenities.filter(
          amenity => amenity.status === 'ok'
        ).length;

        uptimeByAmenityType[amenityType.key || 'unknown'] = 
          totalAmenities > 0 ? (workingAmenities / totalAmenities) * 100 : 0;
      } catch (err) {
        console.error('Error calculating uptime for amenity type:', amenityType.key, err);
        uptimeByAmenityType[amenityType.key || 'unknown'] = 0;
      }
    }

  // Get issue metrics
  const issuesQuery = {
    ...stationQuery,
    reportedAt: { $gte: startDate },
  };

  const allIssues = await Issue.find(issuesQuery);
  const resolvedIssues = allIssues.filter(issue => 
    issue.status === 'resolved' || issue.status === 'closed'
  );
  const openIssues = allIssues.filter(issue => 
    issue.status !== 'resolved' && issue.status !== 'closed'
  );
  const highPriorityIssues = allIssues.filter(issue => issue.priority === 'high');

  // Calculate average resolution time
  let avgResolutionTime = 0;
  if (resolvedIssues.length > 0) {
    const totalResolutionTime = resolvedIssues.reduce((sum, issue) => {
      if (issue.resolvedAt) {
        return sum + (issue.resolvedAt.getTime() - issue.reportedAt.getTime());
      }
      return sum;
    }, 0);
    avgResolutionTime = totalResolutionTime / resolvedIssues.length / (1000 * 60 * 60); // Convert to hours
  }

  // Get inspections count
  const inspectionsQuery = {
    ...stationQuery,
    createdAt: { $gte: startDate },
  };

    const inspectionsCount = await Inspection.countDocuments(inspectionsQuery);

    return {
      uptimeByAmenityType,
      avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
      openIssuesCount: openIssues.length,
      totalIssuesCount: allIssues.length,
      resolvedIssuesCount: resolvedIssues.length,
      highPriorityIssuesCount: highPriorityIssues.length,
      inspectionsCount,
    };
  } catch (error) {
    console.error('Error calculating MIS metrics:', error);
    // Return empty metrics on error
    return {
      uptimeByAmenityType: {},
      avgResolutionTime: 0,
      openIssuesCount: 0,
      totalIssuesCount: 0,
      resolvedIssuesCount: 0,
      highPriorityIssuesCount: 0,
      inspectionsCount: 0,
    };
  }
}
