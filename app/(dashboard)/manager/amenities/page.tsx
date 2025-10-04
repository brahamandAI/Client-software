'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface StationAmenity {
  _id: string;
  stationId: string;
  amenityTypeId: {
    _id: string;
    name: string;
    description: string;
    icon: string;
  };
  locationDescription: string;
  status: 'ok' | 'needs_maintenance' | 'out_of_service';
  lastInspectedAt: string;
  notes: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

interface AmenityType {
  _id: string;
  name: string;
  description: string;
  icon: string;
}

export default function ManageAmenitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [amenities, setAmenities] = useState<StationAmenity[]>([]);
  const [amenityTypes, setAmenityTypes] = useState<AmenityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<StationAmenity | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    amenityTypeId: '',
    locationDescription: '',
    status: 'ok' as 'ok' | 'needs_maintenance' | 'out_of_service',
    notes: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'StationManager') {
      router.push('/login');
      return;
    }
    fetchAmenities();
    fetchAmenityTypes();
  }, [session, status, router]);

  const fetchAmenities = async () => {
    try {
      const response = await fetch(`/api/stations/${session?.user?.stationId}/amenities`);
      if (response.ok) {
        const data = await response.json();
        setAmenities(data);
      }
    } catch (error) {
      console.error('Error fetching amenities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAmenityTypes = async () => {
    try {
      const response = await fetch('/api/amenity-types');
      if (response.ok) {
        const data = await response.json();
        setAmenityTypes(data);
      }
    } catch (error) {
      console.error('Error fetching amenity types:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingAmenity 
        ? `/api/stations/${session?.user?.stationId}/amenities/${editingAmenity._id}`
        : `/api/stations/${session?.user?.stationId}/amenities`;
      const method = editingAmenity ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amenityTypeId: formData.amenityTypeId,
          locationDescription: formData.locationDescription,
          status: formData.status,
          notes: formData.notes
        })
      });

      if (response.ok) {
        await fetchAmenities();
        setShowAddForm(false);
        setEditingAmenity(null);
        setFormData({
          amenityTypeId: '',
          locationDescription: '',
          status: 'ok',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error saving amenity:', error);
    }
  };

  const handleEdit = (amenity: StationAmenity) => {
    setEditingAmenity(amenity);
    setFormData({
      amenityTypeId: amenity.amenityTypeId._id,
      locationDescription: amenity.locationDescription,
      status: amenity.status,
      notes: amenity.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this amenity?')) return;
    
    try {
      const response = await fetch(`/api/stations/${session?.user?.stationId}/amenities/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchAmenities();
      }
    } catch (error) {
      console.error('Error deleting amenity:', error);
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
        <h1 className="text-3xl font-bold">Manage Amenities</h1>
        <Button onClick={() => setShowAddForm(true)}>
          Add New Amenity
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingAmenity ? 'Edit Amenity' : 'Add New Amenity'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amenity Type</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.amenityTypeId}
                  onChange={(e) => setFormData({...formData, amenityTypeId: e.target.value})}
                  required
                >
                  <option value="">Select Type</option>
                  {amenityTypes.map(type => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  value={formData.locationDescription}
                  onChange={(e) => setFormData({...formData, locationDescription: e.target.value})}
                  placeholder="e.g., Platform 1, Near Gate 2"
                  required
                />
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
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingAmenity ? 'Update Amenity' : 'Add Amenity'}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowAddForm(false);
                setEditingAmenity(null);
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {amenities.map((amenity) => (
          <Card key={amenity._id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{amenity.amenityTypeId?.name || 'Amenity'}</h3>
                <p className="text-gray-600">Location: {amenity.locationDescription}</p>
                {amenity.notes && (
                  <p className="text-sm text-gray-500 mt-1">Notes: {amenity.notes}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(amenity.status)}>
                    {amenity.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {amenity.photos?.length > 0 && (
                    <Badge variant="outline">
                      {amenity.photos.length} Photos
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Last Inspected: {amenity.lastInspectedAt 
                    ? new Date(amenity.lastInspectedAt).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(amenity)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/manager/amenities/${amenity._id}/inspect`)}
                >
                  Inspect
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(amenity._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {amenities.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No amenities found. Add your first amenity to get started.</p>
        </Card>
      )}
    </div>
  );
}
