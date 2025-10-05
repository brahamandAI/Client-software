'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ManagerStats {
  totalAmenities: number;
  openIssues: number;
  highPriorityIssues: number;
  inspectionsToday: number;
  amenitiesNeedingMaintenance: number;
  uptimePercentage: number;
}

export default function ManagerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<ManagerStats>({
    totalAmenities: 0,
    openIssues: 0,
    highPriorityIssues: 0,
    inspectionsToday: 0,
    amenitiesNeedingMaintenance: 0,
    uptimePercentage: 0,
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    if (!['StationManager', 'Staff'].includes(session.user.role)) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  // Fetch station amenities
  const { data: amenities } = useQuery({
    queryKey: ['station-amenities', session?.user?.stationId],
    queryFn: async () => {
      if (!session?.user?.stationId) return [];
      const response = await fetch(`/api/stations/${session.user.stationId}/amenities`);
      if (!response.ok) throw new Error('Failed to fetch amenities');
      return response.json();
    },
    enabled: !!session?.user?.stationId,
  });

  // Fetch issues for this station
  const { data: issues } = useQuery({
    queryKey: ['issues', session?.user?.stationId],
    queryFn: async () => {
      const response = await fetch('/api/issues');
      if (!response.ok) throw new Error('Failed to fetch issues');
      return response.json();
    },
  });

  // Fetch MIS report for this station
  const { data: misReport } = useQuery({
    queryKey: ['mis-report', session?.user?.stationId],
    queryFn: async () => {
      const response = await fetch(`/api/reports/mis?station=${session?.user?.stationId}&period=daily`);
      if (!response.ok) throw new Error('Failed to fetch MIS report');
      return response.json();
    },
    enabled: !!session?.user?.stationId,
  });

  useEffect(() => {
    if (amenities && issues && misReport) {
      const stationIssues = issues.filter((issue: any) => 
        issue.stationId?._id === session?.user?.stationId
      );
      
      setStats({
        totalAmenities: amenities.length,
        openIssues: stationIssues.filter((issue: any) => 
          issue.status !== 'resolved' && issue.status !== 'closed'
        ).length,
        highPriorityIssues: stationIssues.filter((issue: any) => 
          issue.priority === 'high'
        ).length,
        inspectionsToday: misReport.metrics?.inspectionsCount || 0,
        amenitiesNeedingMaintenance: amenities.filter((amenity: any) => 
          amenity.status === 'needs_maintenance'
        ).length,
        uptimePercentage: misReport.metrics?.uptimeByAmenityType ? 
          (Object.values(misReport.metrics.uptimeByAmenityType) as number[]).reduce((a: number, b: number) => a + b, 0) / 
          Object.keys(misReport.metrics.uptimeByAmenityType).length : 0,
      });
    }
  }, [amenities, issues, misReport, session?.user?.stationId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user || !['StationManager', 'Staff'].includes(session.user.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-railway-cream to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-railway-orange to-railway-red shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                {/* Train Icon */}
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5h1.5L9 19h6l1.5 1.5H18L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v9.5zM6 6h12v9.5c0 .83-.67 1.5-1.5 1.5h-9c-.83 0-1.5-.67-1.5-1.5V6z"/>
                  <circle cx="8.5" cy="12.5" r="1.5"/>
                  <circle cx="15.5" cy="12.5" r="1.5"/>
                  <path d="M7 8h10v2H7V8z"/>
                  <path d="M7 11h10v1H7v-1z"/>
                </svg>
                Station Manager Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white/90">
                Welcome, {session.user.name}
              </span>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {session.user.role}
              </Badge>
              <Button
                onClick={() => router.push('/api/auth/signout')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-railway-orange"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amenities</CardTitle>
              <WrenchScrewdriverIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAmenities}</div>
              <p className="text-xs text-muted-foreground">
                Station amenities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
              <ExclamationTriangleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openIssues}</div>
              <p className="text-xs text-muted-foreground">
                Issues requiring attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Needed</CardTitle>
              <WrenchScrewdriverIcon className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.amenitiesNeedingMaintenance}</div>
              <p className="text-xs text-muted-foreground">
                Amenities needing maintenance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uptimePercentage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average amenity uptime
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Amenity Management</CardTitle>
              <CardDescription>
                Manage station amenities and inspections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={() => router.push('/manager/amenities')}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Manage Amenities
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push('/manager/inspections')}>
                <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                Conduct Inspection
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push('/manager/amenities')}>
                <EyeIcon className="h-4 w-4 mr-2" />
                View All Amenities
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Issue Management</CardTitle>
              <CardDescription>
                Handle reported issues and maintenance requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={() => router.push('/manager/issues')}>
                <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                Manage Issues
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push('/manager/issues/open')}>
                View Open Issues
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push('/manager/issues/analytics')}>
                Issue Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Issues</CardTitle>
            <CardDescription>
              Latest reported issues for this station
            </CardDescription>
          </CardHeader>
          <CardContent>
            {issues && issues.length > 0 ? (
              <div className="space-y-4">
                {issues
                  .filter((issue: any) => issue.stationId?._id === session?.user?.stationId)
                  .slice(0, 5)
                  .map((issue: any) => (
                  <div key={issue._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{issue.stationAmenityId?.amenityTypeId?.label || 'General'}</h4>
                        <Badge 
                          variant={issue.priority === 'high' ? 'destructive' : 
                                  issue.priority === 'medium' ? 'warning' : 'secondary'}
                        >
                          {issue.priority}
                        </Badge>
                        <Badge variant="outline">
                          {issue.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Reported by {issue.reportedById?.name} • {new Date(issue.reportedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No issues found for this station</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
