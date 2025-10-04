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
  stationId: string;
  amenityId: string;
  amenity: {
    amenityType: string;
    location: string;
  };
  status: 'ok' | 'needs_maintenance' | 'out_of_service';
  notes: string;
  photos: string[];
  inspectedBy: string;
  inspectedAt: string;
  createdAt: string;
}

interface StationAmenity {
  _id: string;
  amenityType: string;
  location: string;
  status: string;
}

export default function ConductInspectionsPage() {
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
    if (!session || session.user?.role !== 'StationManager') {
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
        setInspections(data);
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
    try {
      // Upload photos first
      let photoUrls: string[] = [];
      if (formData.photos.length > 0) {
        const fileList = new DataTransfer();
        formData.photos.forEach(file => fileList.items.add(file));
        photoUrls = await handleFileUpload(fileList.files);
      }

      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          photos: photoUrls
        })
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
      }
    } catch (error) {
      console.error('Error saving inspection:', error);
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

  if (status === 'loading' || loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Conduct Inspections</h1>
        <Button onClick={() => setShowInspectionForm(true)}>
          New Inspection
        </Button>
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
                  {amenities.map(amenity => (
                    <option key={amenity._id} value={amenity._id}>
                      {amenity.amenityType} - {amenity.location}
                    </option>
                  ))}
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

      <div className="grid gap-4">
        {inspections.map((inspection) => (
          <Card key={inspection._id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{inspection.amenity?.amenityType}</h3>
                <p className="text-gray-600">Location: {inspection.amenity?.location}</p>
                {inspection.notes && (
                  <p className="text-sm text-gray-500 mt-1">Notes: {inspection.notes}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(inspection.status)}>
                    {inspection.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {inspection.photos?.length > 0 && (
                    <Badge variant="outline">
                      {inspection.photos.length} Photos
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Inspected: {new Date(inspection.inspectedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/manager/inspections/${inspection._id}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {inspections.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No inspections found. Conduct your first inspection to get started.</p>
        </Card>
      )}
    </div>
  );
}
