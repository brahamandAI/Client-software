'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Station {
  _id: string;
  name: string;
  code: string;
  region: string;
  state: string;
  city: string;
  pincode: string;
  amenities: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ManageStationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    region: '',
    state: '',
    city: '',
    pincode: '',
    amenities: [] as string[]
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'SuperAdmin') {
      router.push('/login');
      return;
    }
    fetchStations();
  }, [session, status, router]);

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/stations');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched stations:', data);
        setStations(data);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingStation ? `/api/stations/${editingStation._id}` : '/api/stations';
      const method = editingStation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchStations();
        setShowAddForm(false);
        setEditingStation(null);
        setFormData({
          name: '',
          code: '',
          region: '',
          state: '',
          city: '',
          pincode: '',
          amenities: []
        });
      }
    } catch (error) {
      console.error('Error saving station:', error);
    }
  };

  const handleEdit = (station: Station) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      code: station.code,
      region: station.region,
      state: station.state,
      city: station.city,
      pincode: station.pincode,
      amenities: station.amenities
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this station?')) return;
    
    try {
      const response = await fetch(`/api/stations/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchStations();
      }
    } catch (error) {
      console.error('Error deleting station:', error);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Stations</h1>
        <Button onClick={() => setShowAddForm(true)}>
          Add New Station
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingStation ? 'Edit Station' : 'Add New Station'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Station Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Station Code</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Region</label>
                <Input
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pincode</label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingStation ? 'Update Station' : 'Add Station'}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowAddForm(false);
                setEditingStation(null);
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {stations.map((station) => (
          <Card key={station._id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{station.name}</h3>
                <p className="text-gray-600">Code: {station.code}</p>
                <p className="text-sm text-gray-500">
                  {station.city}, {station.state} - {station.pincode}
                </p>
                <p className="text-sm text-gray-500">Region: {station.region}</p>
                <div className="mt-2">
                  <Badge variant="secondary">
                    {station.amenities?.length || 0} Amenities
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(station)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('Manage Amenities clicked for station:', station._id);
                    router.push(`/admin/stations/${station._id}/amenities`);
                  }}
                >
                  Manage Amenities
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(station._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
