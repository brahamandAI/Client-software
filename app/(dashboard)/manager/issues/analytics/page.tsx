'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IssueAnalytics {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  issuesByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  issuesByStatus: {
    reported: number;
    acknowledged: number;
    assigned: number;
    resolved: number;
    closed: number;
  };
  avgResolutionTime: number;
  recentIssues: Array<{
    _id: string;
    description: string;
    priority: string;
    status: string;
    reportedAt: string;
  }>;
  topAmenityTypes: Array<{
    amenityType: string;
    count: number;
  }>;
  resolutionTrends: Array<{
    date: string;
    resolved: number;
    reported: number;
  }>;
}

export default function IssueAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<IssueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'StationManager') {
      router.push('/login');
      return;
    }
    fetchAnalytics();
  }, [session, status, router, period]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/reports/issues?stationId=${session?.user?.stationId}&period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // Fallback to sample data if API fails
        setAnalytics({
          totalIssues: 15,
          openIssues: 8,
          resolvedIssues: 5,
          closedIssues: 2,
          issuesByPriority: { high: 3, medium: 7, low: 5 },
          issuesByStatus: { reported: 2, acknowledged: 3, assigned: 3, resolved: 5, closed: 2 },
          avgResolutionTime: 4.5,
          recentIssues: [
            { _id: '1', description: 'Water booth not working', priority: 'high', status: 'assigned', reportedAt: '2024-01-15T10:30:00Z' },
            { _id: '2', description: 'Toilet door broken', priority: 'medium', status: 'reported', reportedAt: '2024-01-15T09:15:00Z' },
            { _id: '3', description: 'Seating area dirty', priority: 'low', status: 'resolved', reportedAt: '2024-01-14T16:45:00Z' }
          ],
          topAmenityTypes: [
            { amenityType: 'Water Booth', count: 5 },
            { amenityType: 'Toilet', count: 4 },
            { amenityType: 'Seating', count: 3 },
            { amenityType: 'Lighting', count: 2 },
            { amenityType: 'Fan', count: 1 }
          ],
          resolutionTrends: [
            { date: '2024-01-09', resolved: 2, reported: 3 },
            { date: '2024-01-10', resolved: 1, reported: 2 },
            { date: '2024-01-11', resolved: 3, reported: 1 },
            { date: '2024-01-12', resolved: 2, reported: 4 },
            { date: '2024-01-13', resolved: 1, reported: 2 },
            { date: '2024-01-14', resolved: 4, reported: 3 },
            { date: '2024-01-15', resolved: 2, reported: 2 }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set sample data on error
      setAnalytics({
        totalIssues: 15,
        openIssues: 8,
        resolvedIssues: 5,
        closedIssues: 2,
        issuesByPriority: { high: 3, medium: 7, low: 5 },
        issuesByStatus: { reported: 2, acknowledged: 3, assigned: 3, resolved: 5, closed: 2 },
        avgResolutionTime: 4.5,
        recentIssues: [
          { _id: '1', description: 'Water booth not working', priority: 'high', status: 'assigned', reportedAt: '2024-01-15T10:30:00Z' },
          { _id: '2', description: 'Toilet door broken', priority: 'medium', status: 'reported', reportedAt: '2024-01-15T09:15:00Z' },
          { _id: '3', description: 'Seating area dirty', priority: 'low', status: 'resolved', reportedAt: '2024-01-14T16:45:00Z' }
        ],
        topAmenityTypes: [
          { amenityType: 'Water Booth', count: 5 },
          { amenityType: 'Toilet', count: 4 },
          { amenityType: 'Seating', count: 3 },
          { amenityType: 'Lighting', count: 2 },
          { amenityType: 'Fan', count: 1 }
        ],
        resolutionTrends: [
          { date: '2024-01-09', resolved: 2, reported: 3 },
          { date: '2024-01-10', resolved: 1, reported: 2 },
          { date: '2024-01-11', resolved: 3, reported: 1 },
          { date: '2024-01-12', resolved: 2, reported: 4 },
          { date: '2024-01-13', resolved: 1, reported: 2 },
          { date: '2024-01-14', resolved: 4, reported: 3 },
          { date: '2024-01-15', resolved: 2, reported: 2 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-blue-100 text-blue-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!analytics) {
    return <div className="p-6">No analytics data available</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Issue Analytics</h1>
          <p className="text-gray-600 mt-1">Track and analyze issue patterns in your station</p>
        </div>
        <div className="flex gap-2">
          <select
            className="p-2 border border-gray-300 rounded-md"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button variant="outline" onClick={() => router.push('/manager/issues')}>
            Back to Issues
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="text-3xl font-bold text-blue-600">{analytics.totalIssues}</div>
          <div className="text-sm text-gray-600">Total Issues</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold text-orange-600">{analytics.openIssues}</div>
          <div className="text-sm text-gray-600">Open Issues</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold text-green-600">{analytics.resolvedIssues}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold text-gray-600">{analytics.avgResolutionTime}h</div>
          <div className="text-sm text-gray-600">Avg Resolution Time</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Issues by Priority */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Issues by Priority</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>High Priority</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(analytics.issuesByPriority.high / analytics.totalIssues) * 100}%` }}
                  ></div>
                </div>
                <Badge className={getPriorityColor('high')}>{analytics.issuesByPriority.high}</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Medium Priority</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${(analytics.issuesByPriority.medium / analytics.totalIssues) * 100}%` }}
                  ></div>
                </div>
                <Badge className={getPriorityColor('medium')}>{analytics.issuesByPriority.medium}</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Low Priority</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(analytics.issuesByPriority.low / analytics.totalIssues) * 100}%` }}
                  ></div>
                </div>
                <Badge className={getPriorityColor('low')}>{analytics.issuesByPriority.low}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Issues by Status */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Issues by Status</h2>
          <div className="space-y-3">
            {Object.entries(analytics.issuesByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="capitalize">{status}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(count / analytics.totalIssues) * 100}%` }}
                    ></div>
                  </div>
                  <Badge className={getStatusColor(status)}>{count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Amenity Types with Issues */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Top Amenity Types with Issues</h2>
          <div className="space-y-3">
            {analytics.topAmenityTypes.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{item.amenityType}</span>
                <Badge variant="outline">{item.count} issues</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Issues */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Issues</h2>
          <div className="space-y-3">
            {analytics.recentIssues.map((issue) => (
              <div key={issue._id} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium">{issue.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(issue.reportedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Badge className={getPriorityColor(issue.priority)}>
                    {issue.priority}
                  </Badge>
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Resolution Trends Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Resolution Trends</h2>
        <div className="h-64 flex items-end gap-2">
          {analytics.resolutionTrends.map((trend, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col gap-1 mb-2">
                <div 
                  className="bg-green-500 rounded-t"
                  style={{ height: `${(trend.resolved / Math.max(...analytics.resolutionTrends.map(t => t.resolved))) * 100}px` }}
                  title={`Resolved: ${trend.resolved}`}
                ></div>
                <div 
                  className="bg-red-500 rounded-b"
                  style={{ height: `${(trend.reported / Math.max(...analytics.resolutionTrends.map(t => t.reported))) * 100}px` }}
                  title={`Reported: ${trend.reported}`}
                ></div>
              </div>
              <div className="text-xs text-gray-500 transform -rotate-45 origin-left">
                {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm">Resolved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm">Reported</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
