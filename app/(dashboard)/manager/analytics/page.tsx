'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalyticsData {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
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
  uptimePercentage: number;
  recentIssues: Array<{
    _id: string;
    description: string;
    priority: string;
    status: string;
    reportedAt: string;
  }>;
}

export default function IssueAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily');

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
      const response = await fetch(`/api/reports/mis?period=${period}&stationId=${session?.user?.stationId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
        <h1 className="text-3xl font-bold">Issue Analytics</h1>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Issues</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.totalIssues}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Open Issues</h3>
          <p className="text-3xl font-bold text-red-600">{analytics.openIssues}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Resolved Issues</h3>
          <p className="text-3xl font-bold text-green-600">{analytics.resolvedIssues}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Uptime</h3>
          <p className="text-3xl font-bold text-purple-600">{analytics.uptimePercentage.toFixed(1)}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Issues by Priority */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Issues by Priority</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">High Priority</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${(analytics.issuesByPriority.high / analytics.totalIssues) * 100}%` }}
                  ></div>
                </div>
                <Badge className="bg-red-100 text-red-800">
                  {analytics.issuesByPriority.high}
                </Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Medium Priority</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${(analytics.issuesByPriority.medium / analytics.totalIssues) * 100}%` }}
                  ></div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {analytics.issuesByPriority.medium}
                </Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Low Priority</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(analytics.issuesByPriority.low / analytics.totalIssues) * 100}%` }}
                  ></div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {analytics.issuesByPriority.low}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Issues by Status */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Issues by Status</h3>
          <div className="space-y-3">
            {Object.entries(analytics.issuesByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">{status}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / analytics.totalIssues) * 100}%` }}
                    ></div>
                  </div>
                  <Badge className={getStatusColor(status)}>
                    {count}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Average Resolution Time</h3>
          <p className="text-3xl font-bold text-blue-600">
            {analytics.avgResolutionTime.toFixed(1)} hours
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Time taken to resolve issues on average
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Resolution Rate</h3>
          <p className="text-3xl font-bold text-green-600">
            {((analytics.resolvedIssues / analytics.totalIssues) * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Percentage of issues resolved
          </p>
        </Card>
      </div>

      {/* Recent Issues */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Issues</h3>
        <div className="space-y-3">
          {analytics.recentIssues.map((issue) => (
            <div key={issue._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{issue.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(issue.reportedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className={getPriorityColor(issue.priority)}>
                  {issue.priority.toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(issue.status)}>
                  {issue.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
