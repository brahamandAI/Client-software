'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface StationAmenity {
  _id: string;
  stationId: string;
  amenityType: string;
  location: string;
  status: 'ok' | 'needs_maintenance' | 'out_of_service';
  lastInspectedAt: string;
  notes: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export default function InspectAmenityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const amenityId = params.id as string;
  
  const [amenity, setAmenity] = useState<StationAmenity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [inspectionData, setInspectionData] = useState({
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
    fetchAmenity();
  }, [session, status, router, amenityId]);

  const fetchAmenity = async () => {
    try {
      const response = await fetch(`/api/stations/${session?.user?.stationId}/amenities/${amenityId}`);
      if (response.ok) {
        const data = await response.json();
        setAmenity(data);
        setInspectionData({
          status: data.status,
          notes: data.notes || '',
          photos: []
        });
      }
    } catch (error) {
      console.error('Error fetching amenity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('status', inspectionData.status);
      formData.append('notes', inspectionData.notes);
      
      // Add photos
      inspectionData.photos.forEach((photo, index) => {
        formData.append(`photos`, photo);
      });

      const response = await fetch(`/api/stations/${session?.user?.stationId}/amenities/${amenityId}/inspect`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Inspection completed successfully!');
        router.push('/manager/amenities');
      } else {
        alert('Error completing inspection');
      }
    } catch (error) {
      console.error('Error completing inspection:', error);
      alert('Error completing inspection');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setInspectionData({
        ...inspectionData,
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

  if (!amenity) {
    return <div className="p-6">Amenity not found</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inspect Amenity</h1>
          <p className="text-gray-600 mt-1">{amenity.amenityType} - {amenity.location}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/manager/amenities')}>
          Back to Amenities
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Current Status */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="flex items-center gap-4">
            <Badge className={getStatusColor(amenity.status)}>
              {amenity.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-500">
              Last Inspected: {amenity.lastInspectedAt 
                ? new Date(amenity.lastInspectedAt).toLocaleDateString()
                : 'Never'
              }
            </span>
          </div>
          {amenity.notes && (
            <p className="text-sm text-gray-600 mt-2">Notes: {amenity.notes}</p>
          )}
          {amenity.photos?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Current Photos:</p>
              <div className="grid grid-cols-4 gap-2">
                {amenity.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={`/uploads/${photo}`}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Inspection Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Inspection Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status After Inspection</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={inspectionData.status}
                onChange={(e) => setInspectionData({
                  ...inspectionData,
                  status: e.target.value as any
                })}
                required
              >
                <option value="ok">OK - Working Properly</option>
                <option value="needs_maintenance">Needs Maintenance</option>
                <option value="out_of_service">Out of Service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Inspection Notes</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md h-24"
                value={inspectionData.notes}
                onChange={(e) => setInspectionData({
                  ...inspectionData,
                  notes: e.target.value
                })}
                placeholder="Describe the current condition, any issues found, maintenance needed, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Add Photos (Optional)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload photos to document the current condition
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Completing Inspection...' : 'Complete Inspection'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/manager/amenities')}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
