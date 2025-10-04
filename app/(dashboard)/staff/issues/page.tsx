'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  SparklesIcon, 
  PhotoIcon, 
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Issue {
  _id: string;
  stationId: string;
  amenityId: string;
  amenity: {
    amenityTypeId: {
      name: string;
    };
    locationDescription: string;
  };
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'reported' | 'acknowledged' | 'assigned' | 'resolved' | 'closed';
  photos: string[];
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  assignedAt?: string;
  resolvedAt?: string;
  resolution?: string;
}

interface StationAmenity {
  _id: string;
  amenityTypeId: {
    _id: string;
    name: string;
  };
  locationDescription: string;
  status: string;
}

export default function IssueReportingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [amenities, setAmenities] = useState<StationAmenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    amenityId: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    photos: [] as File[]
  });

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'Staff') {
      router.push('/login');
      return;
    }
    fetchIssues();
    fetchAmenities();
  }, [session, status, router]);

  const fetchIssues = async () => {
    try {
      const response = await fetch('/api/issues');
      if (response.ok) {
        const data = await response.json();
        // Filter issues for current station
        const stationIssues = data.filter((issue: Issue) => 
          issue.stationId === session?.user?.stationId
        );
        setIssues(stationIssues);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAmenities = async () => {
    try {
      const response = await fetch(`/api/stations/${session?.user?.stationId}/amenities`);
      if (response.ok) {
        const data = await response.json();
        setAmenities(data);
      }
    } catch (error) {
      console.error('Error fetching amenities:', error);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
      return null;
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls.filter(url => url !== null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Upload photos first
      let photoUrls: string[] = [];
      if (formData.photos.length > 0) {
        const fileList = new DataTransfer();
        formData.photos.forEach(file => fileList.items.add(file));
        photoUrls = await handleFileUpload(fileList.files);
      }

      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          photos: photoUrls
        })
      });

      if (response.ok) {
        await fetchIssues();
        setShowReportForm(false);
        setFormData({
          amenityId: '',
          description: '',
          priority: 'medium',
          photos: []
        });
        alert('Issue reported successfully!');
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      alert('Error reporting issue');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        photos: Array.from(e.target.files)
      });
      
      // Auto-analyze first photo if AI is enabled
      if (e.target.files.length > 0 && aiEnabled && formData.amenityId) {
        analyzePhoto(e.target.files[0]);
      }
    }
  };

  // AI Photo Analysis Function
  const analyzePhoto = async (photo: File) => {
    if (!aiEnabled || !formData.amenityId) return;

    setIsAnalyzing(true);
    try {
      const selectedAmenity = amenities.find(a => a._id === formData.amenityId);
      const amenityType = selectedAmenity?.amenityTypeId.name || 'Amenity';

      const formDataForAI = new FormData();
      formDataForAI.append('image', photo);
      formDataForAI.append('amenityType', amenityType);

      const response = await fetch('/api/ai/analyze-photo', {
        method: 'POST',
        body: formDataForAI,
      });

      if (response.ok) {
        const result = await response.json();
        setAiAnalysis(result);
        
        // Auto-fill form with AI suggestions
        setFormData(prev => ({
          ...prev,
          description: result.description.description,
          priority: result.description.priority
        }));

        toast.success('AI analysis completed! Form auto-filled with suggestions.');
      } else {
        const error = await response.json();
        toast.error(error.error || 'AI analysis failed');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Failed to analyze photo');
    } finally {
      setIsAnalyzing(false);
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

  const getMyIssues = () => {
    return issues.filter(issue => issue.reportedBy === session?.user?.email);
  };

  const getOpenIssues = () => {
    return issues.filter(issue => 
      ['reported', 'acknowledged', 'assigned'].includes(issue.status)
    );
  };

  if (status === 'loading' || loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Issue Reporting</h1>
        <Button onClick={() => setShowReportForm(true)}>
          Report New Issue
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">My Reports</h3>
          <p className="text-3xl font-bold text-blue-600">{getMyIssues().length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Open Issues</h3>
          <p className="text-3xl font-bold text-yellow-600">{getOpenIssues().length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Issues</h3>
          <p className="text-3xl font-bold text-purple-600">{issues.length}</p>
        </Card>
      </div>

      {showReportForm && (
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Report New Issue</h2>
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
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Amenity</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.amenityId}
                  onChange={(e) => setFormData({...formData, amenityId: e.target.value})}
                  required
                >
                  <option value="">Select Amenity</option>
                  {amenities.map(amenity => (
                    <option key={amenity._id} value={amenity._id}>
                      {amenity.amenityTypeId?.name || 'Amenity'} - {amenity.locationDescription || 'Location'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the issue in detail..."
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Photos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {formData.photos.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.photos.length} file(s) selected
                  </p>
                )}
                
                {/* AI Analysis Results */}
                {isAnalyzing && (
                  <div className="mt-4 p-4 bg-railway-lightOrange/20 border border-railway-orange/30 rounded-lg">
                    <div className="flex items-center gap-2 text-railway-orange">
                      <SparklesIcon className="h-5 w-5 animate-spin" />
                      <span className="font-medium">AI is analyzing your photo...</span>
                    </div>
                  </div>
                )}
                
                {aiAnalysis && !isAnalyzing && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 mb-3">
                      <CheckCircleIcon className="h-5 w-5" />
                      <span className="font-medium">AI Analysis Complete</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                        <ul className="list-disc list-inside text-xs text-gray-600 mt-1">
                          {aiAnalysis.analysis.suggestions.map((suggestion: string, index: number) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-white border border-green-200 rounded">
                      <p className="text-sm"><strong>AI Generated Description:</strong></p>
                      <p className="text-sm text-gray-700 mt-1">{aiAnalysis.description.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                Report Issue
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowReportForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* My Reported Issues */}
      <Card className="p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">My Reported Issues</h3>
        <div className="space-y-3">
          {getMyIssues().map((issue) => (
            <div key={issue._id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{issue.amenity?.amenityTypeId?.name || 'Amenity'}</h4>
                  <Badge className={getPriorityColor(issue.priority)}>
                    {issue.priority.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                <p className="text-sm text-gray-500">
                  Location: {issue.amenity?.locationDescription || 'Location'}
                </p>
                <p className="text-sm text-gray-500">
                  Reported: {new Date(issue.reportedAt).toLocaleString()}
                </p>
                {issue.photos?.length > 0 && (
                  <p className="text-sm text-gray-500">
                    Photos: {issue.photos.length}
                  </p>
                )}
              </div>
            </div>
          ))}
          {getMyIssues().length === 0 && (
            <p className="text-gray-500 text-center py-4">No issues reported by you</p>
          )}
        </div>
      </Card>

      {/* All Station Issues */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">All Station Issues</h3>
        <div className="space-y-3">
          {issues.map((issue) => (
            <div key={issue._id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{issue.amenity?.amenityTypeId?.name || 'Amenity'}</h4>
                  <Badge className={getPriorityColor(issue.priority)}>
                    {issue.priority.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                <p className="text-sm text-gray-500">
                  Location: {issue.amenity?.locationDescription || 'Location'}
                </p>
                <p className="text-sm text-gray-500">
                  Reported: {new Date(issue.reportedAt).toLocaleString()}
                </p>
                {issue.assignedTo && (
                  <p className="text-sm text-gray-500">
                    Assigned to: {issue.assignedTo}
                  </p>
                )}
              </div>
            </div>
          ))}
          {issues.length === 0 && (
            <p className="text-gray-500 text-center py-4">No issues found</p>
          )}
        </div>
      </Card>
    </div>
  );
}
