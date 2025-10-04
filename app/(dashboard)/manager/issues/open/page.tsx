'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Issue {
  _id: string;
  stationId: string;
  amenityId: string;
  reportedBy: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'reported' | 'acknowledged' | 'assigned' | 'resolved' | 'closed';
  assignedTo?: string;
  photos: string[];
  reportedAt: string;
  resolvedAt?: string;
  station?: {
    name: string;
    code: string;
  };
  amenity?: {
    amenityTypeId: {
      name: string;
    };
    locationDescription: string;
  };
}

export default function OpenIssuesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    priority: 'all',
    search: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'StationManager') {
      router.push('/login');
      return;
    }
    fetchOpenIssues();
  }, [session, status, router]);

  const fetchOpenIssues = async () => {
    try {
      const response = await fetch(`/api/issues?stationId=${session?.user?.stationId}&status=open`);
      if (response.ok) {
        const data = await response.json();
        setIssues(data);
      }
    } catch (error) {
      console.error('Error fetching open issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchOpenIssues();
      }
    } catch (error) {
      console.error('Error updating issue status:', error);
    }
  };

  const handleAssign = async (issueId: string, assignedTo: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo })
      });

      if (response.ok) {
        await fetchOpenIssues();
      }
    } catch (error) {
      console.error('Error assigning issue:', error);
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyLevel = (issue: Issue) => {
    const reportedAt = new Date(issue.reportedAt);
    const now = new Date();
    const hoursSinceReported = (now.getTime() - reportedAt.getTime()) / (1000 * 60 * 60);
    
    if (issue.priority === 'high' && hoursSinceReported > 4) return 'urgent';
    if (issue.priority === 'medium' && hoursSinceReported > 24) return 'overdue';
    if (issue.priority === 'low' && hoursSinceReported > 72) return 'overdue';
    
    return 'normal';
  };

  const filteredIssues = issues.filter(issue => {
    const matchesPriority = filter.priority === 'all' || issue.priority === filter.priority;
    const matchesSearch = filter.search === '' || 
      issue.description.toLowerCase().includes(filter.search.toLowerCase()) ||
      issue.station?.name.toLowerCase().includes(filter.search.toLowerCase());
    
    return matchesPriority && matchesSearch;
  });

  // Sort by urgency and priority
  const sortedIssues = filteredIssues.sort((a, b) => {
    const urgencyA = getUrgencyLevel(a);
    const urgencyB = getUrgencyLevel(b);
    
    if (urgencyA === 'urgent' && urgencyB !== 'urgent') return -1;
    if (urgencyB === 'urgent' && urgencyA !== 'urgent') return 1;
    if (urgencyA === 'overdue' && urgencyB === 'normal') return -1;
    if (urgencyB === 'overdue' && urgencyA === 'normal') return 1;
    
    // Then by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  if (status === 'loading' || loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Open Issues</h1>
          <p className="text-gray-600 mt-1">Manage and track open issues in your station</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/manager/issues')}>
            All Issues
          </Button>
          <Button onClick={() => router.push('/manager/issues/report')}>
            Report New Issue
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {issues.filter(i => i.status === 'reported').length}
          </div>
          <div className="text-sm text-gray-600">Reported</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {issues.filter(i => i.status === 'acknowledged').length}
          </div>
          <div className="text-sm text-gray-600">Acknowledged</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">
            {issues.filter(i => i.status === 'assigned').length}
          </div>
          <div className="text-sm text-gray-600">Assigned</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-600">
            {issues.filter(i => getUrgencyLevel(i) === 'urgent').length}
          </div>
          <div className="text-sm text-gray-600">Urgent</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filter.priority}
              onChange={(e) => setFilter({...filter, priority: e.target.value})}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <Input
              placeholder="Search issues..."
              value={filter.search}
              onChange={(e) => setFilter({...filter, search: e.target.value})}
            />
          </div>
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={() => setFilter({ priority: 'all', search: '' })}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Issues List */}
      <div className="grid gap-4">
        {sortedIssues.map((issue) => {
          const urgency = getUrgencyLevel(issue);
          const hoursSinceReported = Math.floor((new Date().getTime() - new Date(issue.reportedAt).getTime()) / (1000 * 60 * 60));
          
          return (
            <Card key={issue._id} className={`p-6 ${urgency === 'urgent' ? 'border-red-300 bg-red-50' : urgency === 'overdue' ? 'border-yellow-300 bg-yellow-50' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{issue.description}</h3>
                    <Badge className={getPriorityColor(issue.priority)}>
                      {issue.priority.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status.toUpperCase()}
                    </Badge>
                    {urgency === 'urgent' && (
                      <Badge className="bg-red-100 text-red-800">URGENT</Badge>
                    )}
                    {urgency === 'overdue' && (
                      <Badge className="bg-yellow-100 text-yellow-800">OVERDUE</Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Station:</strong> {issue.station?.name || 'Station'}</p>
                    <p><strong>Amenity:</strong> {issue.amenity?.amenityTypeId?.name || 'Amenity'} - {issue.amenity?.locationDescription || 'Location'}</p>
                    <p><strong>Reported:</strong> {new Date(issue.reportedAt).toLocaleString()} ({hoursSinceReported}h ago)</p>
                    {issue.assignedTo && (
                      <p><strong>Assigned To:</strong> {issue.assignedTo}</p>
                    )}
                  </div>

                  {issue.photos?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Photos:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {issue.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={`/uploads/${photo}`}
                            alt={`Issue photo ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {issue.status === 'reported' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(issue._id, 'acknowledged')}
                    >
                      Acknowledge
                    </Button>
                  )}
                  
                  {issue.status === 'acknowledged' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAssign(issue._id, session?.user?.name || 'Manager')}
                      >
                        Assign to Me
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(issue._id, 'assigned')}
                      >
                        Mark Assigned
                      </Button>
                    </div>
                  )}

                  {issue.status === 'assigned' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(issue._id, 'resolved')}
                    >
                      Mark Resolved
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/manager/issues/${issue._id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredIssues.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No open issues found matching your criteria.</p>
        </Card>
      )}
    </div>
  );
}
