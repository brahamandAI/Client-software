'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PhotoAnalysis from '@/components/ai/photo-analysis';
import { SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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

export default function ManageIssuesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiEnabled, setAiEnabled] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'StationManager') {
      router.push('/login');
      return;
    }
    fetchIssues();
  }, [session, status, router]);

  const fetchIssues = async () => {
    try {
      const response = await fetch(`/api/issues?stationId=${session?.user?.stationId}`);
      if (response.ok) {
        const data = await response.json();
        setIssues(data);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
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
        await fetchIssues();
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
        await fetchIssues();
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
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesStatus = filter.status === 'all' || issue.status === filter.status;
    const matchesPriority = filter.priority === 'all' || issue.priority === filter.priority;
    const matchesSearch = filter.search === '' || 
      issue.description.toLowerCase().includes(filter.search.toLowerCase()) ||
      issue.station?.name.toLowerCase().includes(filter.search.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // AI Analysis handler
  const handleAIAnalysis = (analysis: any) => {
    setAiAnalysis(analysis);
    toast.success('AI analysis completed! Check the suggestions below.');
  };

  if (status === 'loading' || loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Issues</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-railway-orange" />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="rounded"
              />
              AI Analysis
            </label>
          </div>
          <Button onClick={() => router.push('/manager/issues/report')}>
            Report New Issue
          </Button>
        </div>
      </div>

      {/* AI Analysis Section */}
      {aiEnabled && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-railway-orange" />
            AI Photo Analysis
          </h2>
          <PhotoAnalysis 
            onAnalysisComplete={handleAIAnalysis}
            amenityType="General"
            disabled={!aiEnabled}
          />
        </Card>
      )}

      {/* AI Analysis Results */}
      {aiAnalysis && (
        <Card className="p-6 mb-6 bg-gradient-to-r from-railway-lightOrange/10 to-railway-cream/10 border-railway-orange/20">
          <h3 className="text-lg font-semibold mb-4 text-railway-orange">AI Analysis Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Issue Type:</strong> {aiAnalysis.analysis.issueType}</p>
              <p><strong>Severity:</strong> 
                <Badge className={`ml-2 ${
                  aiAnalysis.analysis.severity === 'high' ? 'bg-red-100 text-red-800' :
                  aiAnalysis.analysis.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {aiAnalysis.analysis.severity.toUpperCase()}
                </Badge>
              </p>
              <p><strong>Confidence:</strong> {aiAnalysis.analysis.confidence}%</p>
            </div>
            <div>
              <p><strong>AI Suggestions:</strong></p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                {aiAnalysis.analysis.suggestions.map((suggestion: string, index: number) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white border border-railway-orange/20 rounded">
            <p className="text-sm"><strong>AI Generated Description:</strong></p>
            <p className="text-sm text-gray-700 mt-1">{aiAnalysis.description.description}</p>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
            >
              <option value="all">All Status</option>
              <option value="reported">Reported</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
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
              onClick={() => setFilter({ status: 'all', priority: 'all', search: '' })}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Issues List */}
      <div className="grid gap-4">
        {filteredIssues.map((issue) => (
          <Card key={issue._id} className="p-6">
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
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Station:</strong> {issue.station?.name || 'Station'}</p>
                  <p><strong>Amenity:</strong> {issue.amenity?.amenityTypeId?.name || 'Amenity'} - {issue.amenity?.locationDescription || 'Location'}</p>
                  <p><strong>Reported:</strong> {new Date(issue.reportedAt).toLocaleString()}</p>
                  {issue.assignedTo && (
                    <p><strong>Assigned To:</strong> {issue.assignedTo}</p>
                  )}
                  {issue.resolvedAt && (
                    <p><strong>Resolved:</strong> {new Date(issue.resolvedAt).toLocaleString()}</p>
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

                {issue.status === 'resolved' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(issue._id, 'closed')}
                  >
                    Close Issue
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
        ))}
      </div>

      {filteredIssues.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No issues found matching your criteria.</p>
        </Card>
      )}
    </div>
  );
}
