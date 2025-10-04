'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Inspection {
  _id: string;
  stationAmenityId: {
    _id: string;
    amenityTypeId: {
      name: string;
    };
    locationDescription: string;
    stationId: {
      name: string;
      code: string;
    };
  };
  staffId: {
    name: string;
    email: string;
  };
  status: 'ok' | 'needs_maintenance' | 'out_of_service';
  notes: string;
  photos: string[];
  createdAt: string;
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

export default function DailyInspectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [amenities, setAmenities] = useState<StationAmenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInspectionForm, setShowInspectionForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    amenityId: '',
    status: 'ok' as 'ok' | 'needs_maintenance' | 'out_of_service',
    notes: '',
    photos: [] as File[]
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'Staff') {
      router.push('/login');
      return;
    }
    fetchInspections();
    fetchAmenities();
  }, [session, status, router]);

  const fetchInspections = async () => {
    try {
      const response = await fetch('/api/inspections');
      if (response.ok) {
        const data = await response.json();
        // Filter inspections for today
        const today = new Date().toDateString();
        const todayInspections = data.filter((inspection: Inspection) => 
          new Date(inspection.createdAt).toDateString() === today
        );
        setInspections(todayInspections);
      }
    } catch (error) {
      console.error('Error fetching inspections:', error);
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
    
    // Validate required fields
    if (!formData.amenityId) {
      alert('Please select an amenity');
      return;
    }
    
    try {
      // Upload photos first
      let photoUrls: string[] = [];
      if (formData.photos.length > 0) {
        const fileList = new DataTransfer();
        formData.photos.forEach(file => fileList.items.add(file));
        photoUrls = await handleFileUpload(fileList.files);
      }

      const requestData = {
        stationAmenityId: formData.amenityId,
        status: formData.status,
        notes: formData.notes,
        photos: photoUrls
      };

      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      if (response.ok) {
        await fetchInspections();
        setShowInspectionForm(false);
        setFormData({
          amenityId: '',
          status: 'ok',
          notes: '',
          photos: []
        });
        alert('Inspection submitted successfully!');
      } else {
        const errorData = await response.json();
        console.error('Inspection submission failed:', errorData);
        alert('Error submitting inspection: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving inspection:', error);
      alert('Error submitting inspection');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-100 text-green-800';
      case 'needs_maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInspectedAmenities = () => {
    return amenities.filter(amenity => 
      inspections.some(inspection => inspection.stationAmenityId._id === amenity._id)
    );
  };

  const getPendingAmenities = () => {
    return amenities.filter(amenity => 
      !inspections.some(inspection => inspection.stationAmenityId._id === amenity._id)
    );
  };

  if (status === 'loading' || loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daily Inspections</h1>
        <Button onClick={() => setShowInspectionForm(true)}>
          New Inspection
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Amenities</h3>
          <p className="text-3xl font-bold text-blue-600">{amenities.length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Inspected Today</h3>
          <p className="text-3xl font-bold text-green-600">{inspections.length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">{getPendingAmenities().length}</p>
        </Card>
      </div>

      {showInspectionForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Conduct New Inspection</h2>
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
                  {amenities.length === 0 ? (
                    <option disabled>No amenities available</option>
                  ) : (
                    amenities.map(amenity => (
                      <option key={amenity._id} value={amenity._id}>
                        {amenity.amenityTypeId?.name || 'Amenity'} - {amenity.locationDescription || 'Location'}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  required
                >
                  <option value="ok">OK</option>
                  <option value="needs_maintenance">Needs Maintenance</option>
                  <option value="out_of_service">Out of Service</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Inspection notes..."
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
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                Submit Inspection
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowInspectionForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Pending Inspections */}
      {getPendingAmenities().length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-yellow-600">Pending Inspections</h3>
          <div className="grid gap-3">
            {getPendingAmenities().map((amenity) => (
              <div key={amenity._id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium">{amenity.amenityTypeId?.name || 'Amenity'}</p>
                  <p className="text-sm text-gray-500">Location: {amenity.locationDescription || 'Location'}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setFormData({...formData, amenityId: amenity._id});
                    setShowInspectionForm(true);
                  }}
                >
                  Inspect Now
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Today's Inspections */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Today's Inspections</h3>
        <div className="space-y-3">
          {inspections.map((inspection) => (
            <div key={inspection._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{inspection.stationAmenityId?.amenityTypeId?.name || 'Amenity'}</p>
                <p className="text-sm text-gray-500">Location: {inspection.stationAmenityId?.locationDescription || 'Location'}</p>
                {inspection.notes && (
                  <p className="text-sm text-gray-600 mt-1">Notes: {inspection.notes}</p>
                )}
                <p className="text-sm text-gray-500">
                  Inspected: {new Date(inspection.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(inspection.status)}>
                  {inspection.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {inspection.photos?.length > 0 && (
                  <Badge variant="outline">
                    {inspection.photos.length} Photos
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        {inspections.length === 0 && (
          <p className="text-gray-500 text-center py-4">No inspections conducted today</p>
        )}
      </Card>
    </div>
  );
}
