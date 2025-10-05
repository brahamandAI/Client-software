'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AnalyticsData {
  totalStations: number;
  totalUsers: number;
  totalIssues: number;
  totalAmenities: number;
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
  stationsData: Array<{
    _id: string;
    name: string;
    code: string;
    city: string;
    state: string;
    totalAmenities: number;
    workingAmenities: number;
    issuesCount: number;
    uptimePercentage: number;
  }>;
  recentIssues: Array<{
    _id: string;
    description: string;
    priority: string;
    status: string;
    stationName: string;
    reportedAt: string;
  }>;
  avgResolutionTime: number;
  systemUptime: number;
}

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

export default function StationAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily');
  const [selectedStation, setSelectedStation] = useState<string>('all');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'SuperAdmin') {
      router.push('/login');
      return;
    }
    fetchAnalytics();
  }, [session, status, router, period, selectedStation]);

  const fetchAnalytics = async () => {
    try {
      const url = `/api/reports/mis?period=${period}${selectedStation !== 'all' ? `&stationId=${selectedStation}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('Analytics data received:', data);
        
        // Transform the data to match the expected format
        const transformedData: AnalyticsData = {
          totalStations: data.totalStations || 0,
          totalUsers: data.totalUsers || 0,
          totalIssues: data.totalIssues || 0,
          totalAmenities: data.totalAmenities || 0,
          issuesByPriority: data.issuesByPriority || { high: 0, medium: 0, low: 0 },
          issuesByStatus: data.issuesByStatus || { reported: 0, acknowledged: 0, assigned: 0, resolved: 0, closed: 0 },
          stationsData: data.stationsData || [],
          recentIssues: data.recentIssues || [],
          avgResolutionTime: data.avgResolutionTime || 0,
          systemUptime: data.systemUptime || 0,
        };
        
        setAnalytics(transformedData);
      } else {
        console.error('Failed to fetch analytics:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };


  if (status === 'loading' || loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!analytics) {
    // Show sample data for testing
    const sampleAnalytics: AnalyticsData = {
      totalStations: 3,
      totalUsers: 6,
      totalIssues: 5,
      totalAmenities: 10,
      issuesByPriority: { high: 2, medium: 2, low: 1 },
      issuesByStatus: { reported: 2, acknowledged: 1, assigned: 1, resolved: 1, closed: 0 },
      stationsData: [
        {
          _id: '1',
          name: 'Central Railway Station',
          code: 'CST',
          city: 'Mumbai',
          state: 'Maharashtra',
          totalAmenities: 4,
          workingAmenities: 3,
          issuesCount: 2,
          uptimePercentage: 75.0,
        },
        {
          _id: '2',
          name: 'East Junction Station',
          code: 'EJS',
          city: 'Delhi',
          state: 'Delhi',
          totalAmenities: 3,
          workingAmenities: 2,
          issuesCount: 2,
          uptimePercentage: 66.7,
        },
        {
          _id: '3',
          name: 'West Terminal Station',
          code: 'WTS',
          city: 'Bangalore',
          state: 'Karnataka',
          totalAmenities: 3,
          workingAmenities: 3,
          issuesCount: 1,
          uptimePercentage: 100.0,
        },
      ],
      recentIssues: [
        {
          _id: '1',
          description: 'Water booth not working on Platform 1',
          priority: 'high',
          status: 'reported',
          stationName: 'Central Railway Station',
          reportedAt: new Date().toISOString(),
        },
        {
          _id: '2',
          description: 'Seating area needs cleaning',
          priority: 'medium',
          status: 'acknowledged',
          stationName: 'East Junction Station',
          reportedAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      avgResolutionTime: 4.5,
      systemUptime: 80.0,
    };
    
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Station Analytics</h1>
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
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            <strong>Note:</strong> Showing sample data. Real data will be loaded when API is working.
          </p>
        </div>
        
        {/* Render the sample analytics data */}
        <AnalyticsContent 
          analytics={sampleAnalytics} 
          period={period} 
          selectedStation={selectedStation} 
          setPeriod={setPeriod} 
          setSelectedStation={setSelectedStation} 
        />
      </div>
    );
  }

  return <AnalyticsContent analytics={analytics} period={period} selectedStation={selectedStation} setPeriod={setPeriod} setSelectedStation={setSelectedStation} />;
}

function AnalyticsContent({ analytics, period, selectedStation, setPeriod, setSelectedStation }: {
  analytics: AnalyticsData;
  period: string;
  selectedStation: string;
  setPeriod: (period: string) => void;
  setSelectedStation: (station: string) => void;
}) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Station Analytics</h1>
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
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Stations</option>
            {analytics.stationsData?.map(station => (
              <option key={station._id} value={station._id}>
                {station.name} ({station.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Stations</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.totalStations}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Users</h3>
          <p className="text-3xl font-bold text-green-600">{analytics.totalUsers}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Issues</h3>
          <p className="text-3xl font-bold text-red-600">{analytics.totalIssues}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Amenities</h3>
          <p className="text-3xl font-bold text-purple-600">{analytics.totalAmenities}</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
          <h3 className="text-xl font-semibold mb-4">System Uptime</h3>
          <p className="text-3xl font-bold text-green-600">
            {analytics.systemUptime.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Overall system availability
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Resolution Rate</h3>
          <p className="text-3xl font-bold text-purple-600">
            {((analytics.issuesByStatus.resolved + analytics.issuesByStatus.closed) / analytics.totalIssues * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Percentage of issues resolved
          </p>
        </Card>
      </div>

      {/* Station Performance */}
      <Card className="p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Station Performance</h3>
        <div className="space-y-4">
          {analytics.stationsData?.map((station) => (
            <div key={station._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-semibold">{station.name} ({station.code})</h4>
                <p className="text-sm text-gray-500">{station.city}, {station.state}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm">
                    <strong>{station.workingAmenities}</strong>/{station.totalAmenities} Amenities Working
                  </span>
                  <span className="text-sm">
                    <strong>{station.issuesCount}</strong> Issues
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {station.uptimePercentage.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500">Uptime</p>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${station.uptimePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Issues */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Issues</h3>
        <div className="space-y-3">
          {analytics.recentIssues?.map((issue) => (
            <div key={issue._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{issue.description}</p>
                <p className="text-sm text-gray-500">
                  {issue.stationName} • {new Date(issue.reportedAt).toLocaleString()}
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
