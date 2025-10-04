'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  acknowledgedAt?: string;
  assignedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  station?: {
    name: string;
    code: string;
  };
  amenity?: {
    amenityType: string;
    location: string;
  };
  notes?: string;
}

export default function IssueDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const issueId = params.id as string;
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'StationManager') {
      router.push('/login');
      return;
    }
    fetchIssue();
  }, [session, status, router, issueId]);

  const fetchIssue = async () => {
    try {
      const response = await fetch(`/api/issues/${issueId}`);
      if (response.ok) {
        const data = await response.json();
        setIssue(data);
        setNotes(data.notes || '');
      } else {
        alert('Issue not found');
        router.push('/manager/issues');
      }
    } catch (error) {
      console.error('Error fetching issue:', error);
      alert('Error fetching issue details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/issues/${issueId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchIssue();
        alert(`Issue ${newStatus} successfully!`);
      } else {
        alert('Error updating issue status');
      }
    } catch (error) {
      console.error('Error updating issue status:', error);
      alert('Error updating issue status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/issues/${issueId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: session?.user?.name || 'Manager' })
      });

      if (response.ok) {
        await fetchIssue();
        alert('Issue assigned successfully!');
      } else {
        alert('Error assigning issue');
      }
    } catch (error) {
      console.error('Error assigning issue:', error);
      alert('Error assigning issue');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateNotes = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        await fetchIssue();
        setShowNotes(false);
        alert('Notes updated successfully!');
      } else {
        alert('Error updating notes');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('Error updating notes');
    } finally {
      setUpdating(false);
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

  const getTimeElapsed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (status === 'loading' || loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!issue) {
    return <div className="p-6">Issue not found</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Issue Details</h1>
          <p className="text-gray-600 mt-1">Issue ID: {issue._id}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/manager/issues')}>
          Back to Issues
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Description */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Issue Description</h2>
            <p className="text-gray-700">{issue.description}</p>
          </Card>

          {/* Photos */}
          {issue.photos?.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {issue.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={`/uploads/${photo}`}
                    alt={`Issue photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                    onClick={() => window.open(`/uploads/${photo}`, '_blank')}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Notes</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNotes(!showNotes)}
              >
                {showNotes ? 'Cancel' : 'Add/Edit Notes'}
              </Button>
            </div>
            
            {showNotes ? (
              <div className="space-y-4">
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md h-32"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this issue..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleUpdateNotes} disabled={updating}>
                    {updating ? 'Updating...' : 'Update Notes'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowNotes(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700">{issue.notes || 'No notes added yet.'}</p>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status and Priority */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Status & Priority</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <Badge className={getPriorityColor(issue.priority)}>
                  {issue.priority.toUpperCase()}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Badge className={getStatusColor(issue.status)}>
                  {issue.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Issue Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Issue Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Station:</span>
                <p className="text-gray-600">{issue.station?.name || 'Station'}</p>
              </div>
              <div>
                <span className="font-medium">Amenity:</span>
                <p className="text-gray-600">
                  {issue.amenity?.amenityType || 'Amenity'} - {issue.amenity?.location || 'Location'}
                </p>
              </div>
              <div>
                <span className="font-medium">Reported By:</span>
                <p className="text-gray-600">{issue.reportedBy}</p>
              </div>
              <div>
                <span className="font-medium">Reported:</span>
                <p className="text-gray-600">
                  {new Date(issue.reportedAt).toLocaleString()} ({getTimeElapsed(issue.reportedAt)})
                </p>
              </div>
              {issue.assignedTo && (
                <div>
                  <span className="font-medium">Assigned To:</span>
                  <p className="text-gray-600">{issue.assignedTo}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              {issue.status === 'reported' && (
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange('acknowledged')}
                  disabled={updating}
                >
                  Acknowledge Issue
                </Button>
              )}
              
              {issue.status === 'acknowledged' && (
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={handleAssign}
                    disabled={updating}
                  >
                    Assign to Me
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleStatusChange('assigned')}
                    disabled={updating}
                  >
                    Mark as Assigned
                  </Button>
                </div>
              )}

              {issue.status === 'assigned' && (
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange('resolved')}
                  disabled={updating}
                >
                  Mark as Resolved
                </Button>
              )}

              {issue.status === 'resolved' && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleStatusChange('closed')}
                  disabled={updating}
                >
                  Close Issue
                </Button>
              )}

              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push('/manager/issues')}
              >
                Back to All Issues
              </Button>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Reported</span>
                <span>{getTimeElapsed(issue.reportedAt)}</span>
              </div>
              {issue.acknowledgedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Acknowledged</span>
                  <span>{getTimeElapsed(issue.acknowledgedAt)}</span>
                </div>
              )}
              {issue.assignedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned</span>
                  <span>{getTimeElapsed(issue.assignedAt)}</span>
                </div>
              )}
              {issue.resolvedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Resolved</span>
                  <span>{getTimeElapsed(issue.resolvedAt)}</span>
                </div>
              )}
              {issue.closedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Closed</span>
                  <span>{getTimeElapsed(issue.closedAt)}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
