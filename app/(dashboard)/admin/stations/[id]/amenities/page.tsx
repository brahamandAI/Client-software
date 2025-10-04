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

interface Station {
  _id: string;
  name: string;
  code: string;
  region: string;
  state: string;
  city: string;
}

export default function StationAmenitiesPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [amenities, setAmenities] = useState<StationAmenity[]>([]);
  const [amenityTypes, setAmenityTypes] = useState<AmenityType[]>([]);
  const [station, setStation] = useState<Station | null>(null);
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
    if (!session || session.user?.role !== 'SuperAdmin') {
      router.push('/login');
      return;
    }
    fetchStation();
    fetchAmenities();
    fetchAmenityTypes();
  }, [session, status, router, params.id]);

  const fetchStation = async () => {
    try {
      console.log('Fetching station with ID:', params.id);
      const response = await fetch(`/api/stations/${params.id}`);
      console.log('Station response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Station data:', data);
        setStation(data);
      } else {
        const errorData = await response.json();
        console.error('Station fetch error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching station:', error);
    }
  };

  const fetchAmenities = async () => {
    try {
      const response = await fetch(`/api/stations/${params.id}/amenities`);
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
        ? `/api/stations/${params.id}/amenities/${editingAmenity._id}`
        : `/api/stations/${params.id}/amenities`;
      
      const method = editingAmenity ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
        alert(editingAmenity ? 'Amenity updated successfully!' : 'Amenity added successfully!');
      }
    } catch (error) {
      console.error('Error saving amenity:', error);
      alert('Error saving amenity');
    }
  };

  const handleEdit = (amenity: StationAmenity) => {
    setEditingAmenity(amenity);
    setFormData({
      amenityTypeId: amenity.amenityTypeId._id,
      locationDescription: amenity.locationDescription,
      status: amenity.status,
      notes: amenity.notes
    });
    setShowAddForm(true);
  };

  const handleDelete = async (amenityId: string) => {
    if (!confirm('Are you sure you want to delete this amenity?')) return;
    
    try {
      const response = await fetch(`/api/stations/${params.id}/amenities/${amenityId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchAmenities();
        alert('Amenity deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting amenity:', error);
      alert('Error deleting amenity');
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

  if (!station) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Station Not Found</h1>
          <p className="text-gray-600 mb-4">
            The station with ID <code className="bg-gray-100 px-2 py-1 rounded">{params.id}</code> could not be found.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This might be because:
            <ul className="list-disc list-inside mt-2 text-left max-w-md mx-auto">
              <li>The station ID is invalid</li>
              <li>The station was deleted</li>
              <li>There's a database connection issue</li>
            </ul>
          </p>
          <Button onClick={() => router.push('/admin/stations')}>
            Back to Stations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Amenities</h1>
          <p className="text-gray-600 mt-1">
            {station.name} ({station.code}) - {station.city}, {station.state}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/stations')}>
            Back to Stations
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            Add Amenity
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-600">Total</h3>
          <p className="text-3xl font-bold text-blue-600">{amenities.length}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-600">Working</h3>
          <p className="text-3xl font-bold text-green-600">
            {amenities.filter(a => a.status === 'ok').length}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-600">Maintenance</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {amenities.filter(a => a.status === 'needs_maintenance').length}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-600">Out of Service</h3>
          <p className="text-3xl font-bold text-red-600">
            {amenities.filter(a => a.status === 'out_of_service').length}
          </p>
        </Card>
      </div>

      {/* Add/Edit Form */}
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
                  <option value="">Select Amenity Type</option>
                  {amenityTypes.map(type => (
                    <option key={type._id} value={type._id}>
                      {type.name}
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
                <label className="block text-sm font-medium mb-1">Location Description</label>
                <Input
                  value={formData.locationDescription}
                  onChange={(e) => setFormData({...formData, locationDescription: e.target.value})}
                  placeholder="e.g., Platform 1, Near Ticket Counter"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes about this amenity..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingAmenity ? 'Update Amenity' : 'Add Amenity'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAmenity(null);
                  setFormData({
                    amenityTypeId: '',
                    locationDescription: '',
                    status: 'ok',
                    notes: ''
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Amenities List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Station Amenities</h2>
        {amenities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No amenities found for this station.</p>
            <Button 
              className="mt-4" 
              onClick={() => setShowAddForm(true)}
            >
              Add First Amenity
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {amenities.map((amenity) => (
              <div key={amenity._id} className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{amenity.amenityTypeId?.name || 'Amenity'}</h3>
                    <Badge className={getStatusColor(amenity.status)}>
                      {amenity.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-1">Location: {amenity.locationDescription}</p>
                  {amenity.notes && (
                    <p className="text-sm text-gray-500">Notes: {amenity.notes}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Last inspected: {amenity.lastInspectedAt ? 
                      new Date(amenity.lastInspectedAt).toLocaleDateString() : 
                      'Never'
                    }
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(amenity)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(amenity._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
