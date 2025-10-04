'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface Issue {
  _id: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'reported' | 'acknowledged' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  reportedAt: string;
  stationId: {
    _id: string;
    name: string;
    code: string;
  };
  stationAmenityId?: {
    _id: string;
    amenityTypeId: {
      label: string;
    };
    locationDescription: string;
  };
  reportedById: {
    _id: string;
    name: string;
    email: string;
  };
  assignedToId?: {
    _id: string;
    name: string;
    email: string;
  };
  photos: string[];
  notes: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function StaffIssueDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [issue, setIssue] = useState<Issue | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    if (session.user.role !== 'Staff') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  // Fetch issue details
  const { data: issueData, isLoading, error } = useQuery({
    queryKey: ['issue', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/issues/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch issue');
      return response.json();
    },
  });

  useEffect(() => {
    if (issueData) {
      setIssue(issueData);
    }
  }, [issueData]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-railway-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || error) {
    return null;
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Issue Not Found</h2>
          <p className="text-gray-600 mb-4">The issue you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => router.push('/staff/issues')}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Issues
          </Button>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'secondary';
      case 'acknowledged': return 'warning';
      case 'assigned': return 'default';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-railway-cream to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-railway-orange to-railway-red shadow-xl">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                className="border-white text-white hover:bg-white hover:text-railway-orange"
                onClick={() => router.push('/staff/issues')}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Issues
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  {/* Train Icon */}
                  <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5h1.5L9 19h6l1.5 1.5H18L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v9.5zM6 6h12v9.5c0 .83-.67 1.5-1.5 1.5h-9c-.83 0-1.5-.67-1.5-1.5V6z"/>
                    <circle cx="8.5" cy="12.5" r="1.5"/>
                    <circle cx="15.5" cy="12.5" r="1.5"/>
                    <path d="M7 8h10v2H7V8z"/>
                    <path d="M7 11h10v1H7v-1z"/>
                  </svg>
                  Issue Details
                </h1>
                <p className="text-white/90 mt-1">
                  Issue ID: {issue._id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Staff
              </Badge>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-railway-orange"
                onClick={() => router.push('/api/auth/signout')}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Issue Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  Issue Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {issue.stationAmenityId?.amenityTypeId?.label || 'General Issue'}
                  </h3>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(issue.priority)}>
                      {issue.priority.toUpperCase()}
                    </Badge>
                    <Badge variant={getStatusColor(issue.status)}>
                      {issue.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-gray-700">{issue.description}</p>
                
                {issue.stationAmenityId && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{issue.stationAmenityId.locationDescription}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Photos */}
            {issue.photos && issue.photos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PhotoIcon className="h-5 w-5" />
                    Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {issue.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={photo} 
                          alt={`Issue photo ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {issue.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{issue.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Station Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  Station
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{issue.stationId.name}</p>
                  <p className="text-sm text-gray-600">Code: {issue.stationId.code}</p>
                </div>
              </CardContent>
            </Card>

            {/* Reporter Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Reporter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{issue.reportedById.name}</p>
                  <p className="text-sm text-gray-600">{issue.reportedById.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Assigned To */}
            {issue.assignedToId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WrenchScrewdriverIcon className="h-5 w-5" />
                    Assigned To
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{issue.assignedToId.name}</p>
                    <p className="text-sm text-gray-600">{issue.assignedToId.email}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Reported</p>
                    <p className="text-sm text-gray-600">
                      {new Date(issue.reportedAt).toLocaleString()}
                    </p>
                  </div>
                  
                  {issue.resolvedAt && (
                    <div>
                      <p className="text-sm font-medium">Resolved</p>
                      <p className="text-sm text-gray-600">
                        {new Date(issue.resolvedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-gray-600">
                      {new Date(issue.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
