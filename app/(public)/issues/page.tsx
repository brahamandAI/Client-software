'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Issue {
  _id: string;
  stationId: string;
  station: {
    name: string;
    code: string;
  };
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

interface Station {
  _id: string;
  name: string;
  code: string;
  city: string;
  state: string;
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

export default function PublicIssueReportingPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [stationAmenities, setStationAmenities] = useState<StationAmenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    stationId: '',
    amenityId: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    photos: [] as File[]
  });

  useEffect(() => {
    fetchIssues();
    fetchStations();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await fetch('/api/issues');
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

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/stations');
      if (response.ok) {
        const data = await response.json();
        setStations(data);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const fetchStationAmenities = async (stationId: string) => {
    try {
      const response = await fetch(`/api/stations/${stationId}/amenities`);
      if (response.ok) {
        const data = await response.json();
        setStationAmenities(data);
      }
    } catch (error) {
      console.error('Error fetching station amenities:', error);
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
          stationId: '',
          amenityId: '',
          description: '',
          priority: 'medium',
          reporterName: '',
          reporterEmail: '',
          reporterPhone: '',
          photos: []
        });
        setSelectedStation('');
        setStationAmenities([]);
        alert('Issue reported successfully! We will look into it soon.');
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      alert('Error reporting issue. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        photos: Array.from(e.target.files)
      });
    }
  };

  const handleStationChange = (stationId: string) => {
    setFormData({...formData, stationId, amenityId: ''});
    setSelectedStation(stationId);
    fetchStationAmenities(stationId);
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

  if (loading) {
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
          <h3 className="text-lg font-semibold text-gray-600">Total Issues</h3>
          <p className="text-3xl font-bold text-blue-600">{issues.length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Open Issues</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {issues.filter(i => ['reported', 'acknowledged', 'assigned'].includes(i.status)).length}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Resolved Issues</h3>
          <p className="text-3xl font-bold text-green-600">
            {issues.filter(i => ['resolved', 'closed'].includes(i.status)).length}
          </p>
        </Card>
      </div>

      {showReportForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Report New Issue</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Station</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.stationId}
                  onChange={(e) => handleStationChange(e.target.value)}
                  required
                >
                  <option value="">Select Station</option>
                  {stations.map(station => (
                    <option key={station._id} value={station._id}>
                      {station.name} ({station.code}) - {station.city}, {station.state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amenity</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.amenityId}
                  onChange={(e) => setFormData({...formData, amenityId: e.target.value})}
                  required
                  disabled={!selectedStation}
                >
                  <option value="">Select Amenity</option>
                  {stationAmenities.map(amenity => (
                    <option key={amenity._id} value={amenity._id}>
                      {amenity.amenityTypeId?.name || 'Unknown'} - {amenity.locationDescription || 'Unknown Location'}
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
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <Input
                  value={formData.reporterName}
                  onChange={(e) => setFormData({...formData, reporterName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.reporterEmail}
                  onChange={(e) => setFormData({...formData, reporterEmail: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  type="tel"
                  value={formData.reporterPhone}
                  onChange={(e) => setFormData({...formData, reporterPhone: e.target.value})}
                />
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
                <label className="block text-sm font-medium mb-1">Photos (Optional)</label>
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

      {/* Issues List */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Issues</h3>
        <div className="space-y-3">
          {issues.slice(0, 10).map((issue) => (
            <div key={issue._id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{issue.amenity?.amenityTypeId?.name || 'Unknown'}</h4>
                  <Badge className={getPriorityColor(issue.priority)}>
                    {issue.priority.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                <p className="text-sm text-gray-500">
                  Station: {issue.station?.name} ({issue.station?.code})
                </p>
                <p className="text-sm text-gray-500">
                  Location: {issue.amenity?.locationDescription || 'Unknown Location'}
                </p>
                <p className="text-sm text-gray-500">
                  Reported: {new Date(issue.reportedAt).toLocaleString()}
                </p>
                {issue.resolution && (
                  <div className="mt-2 p-2 bg-green-50 rounded">
                    <p className="text-sm font-medium text-green-800">Resolution:</p>
                    <p className="text-sm text-green-700">{issue.resolution}</p>
                  </div>
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
