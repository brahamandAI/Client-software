'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StationAmenity {
  _id: string;
  amenityTypeId: {
    _id: string;
    name: string;
  };
  locationDescription: string;
  status: 'ok' | 'needs_maintenance' | 'out_of_service';
  lastInspectedAt: string;
  notes: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

interface Inspection {
  _id: string;
  amenityId: string;
  status: 'ok' | 'needs_maintenance' | 'out_of_service';
  inspectedAt: string;
  notes: string;
}

export default function AmenityMonitoringPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [amenities, setAmenities] = useState<StationAmenity[]>([]);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ok' | 'needs_maintenance' | 'out_of_service'>('all');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'Staff') {
      router.push('/login');
      return;
    }
    fetchAmenities();
    fetchRecentInspections();
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

  const fetchRecentInspections = async () => {
    try {
      const response = await fetch('/api/inspections');
      if (response.ok) {
        const data = await response.json();
        // Get recent inspections (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recent = data.filter((inspection: Inspection) => 
          new Date(inspection.inspectedAt) >= sevenDaysAgo
        );
        setRecentInspections(recent);
      }
    } catch (error) {
      console.error('Error fetching inspections:', error);
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

  const getFilteredAmenities = () => {
    if (filter === 'all') return amenities;
    return amenities.filter(amenity => amenity.status === filter);
  };

  const getStatusCounts = () => {
    return {
      ok: amenities.filter(a => a.status === 'ok').length,
      needs_maintenance: amenities.filter(a => a.status === 'needs_maintenance').length,
      out_of_service: amenities.filter(a => a.status === 'out_of_service').length
    };
  };

  const getLastInspection = (amenityId: string) => {
    return recentInspections.find(inspection => inspection.amenityId === amenityId);
  };

  const getUptimePercentage = () => {
    const total = amenities.length;
    const working = amenities.filter(a => a.status === 'ok').length;
    return total > 0 ? ((working / total) * 100).toFixed(1) : '0';
  };

  if (status === 'loading' || loading) {
    return <div className="p-6">Loading...</div>;
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Amenity Monitoring</h1>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="ok">OK</option>
            <option value="needs_maintenance">Needs Maintenance</option>
            <option value="out_of_service">Out of Service</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Amenities</h3>
          <p className="text-3xl font-bold text-blue-600">{amenities.length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Working</h3>
          <p className="text-3xl font-bold text-green-600">{statusCounts.ok}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Needs Maintenance</h3>
          <p className="text-3xl font-bold text-yellow-600">{statusCounts.needs_maintenance}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600">Out of Service</h3>
          <p className="text-3xl font-bold text-red-600">{statusCounts.out_of_service}</p>
        </Card>
      </div>

      {/* Uptime Card */}
      <Card className="p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">System Uptime</h3>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-green-600">
            {getUptimePercentage()}%
          </div>
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${getUptimePercentage()}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {statusCounts.ok} out of {amenities.length} amenities are working
            </p>
          </div>
        </div>
      </Card>

      {/* Amenities Grid */}
      <div className="grid gap-4">
        {getFilteredAmenities().map((amenity) => {
          const lastInspection = getLastInspection(amenity._id);
          return (
            <Card key={amenity._id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{amenity.amenityTypeId?.name || 'Amenity'}</h3>
                    <Badge className={getStatusColor(amenity.status)}>
                      {amenity.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">Location: {amenity.locationDescription || 'Location'}</p>
                  {amenity.notes && (
                    <p className="text-sm text-gray-500 mb-2">Notes: {amenity.notes}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      Last Inspected: {amenity.lastInspectedAt 
                        ? new Date(amenity.lastInspectedAt).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                    {amenity.photos?.length > 0 && (
                      <span>Photos: {amenity.photos.length}</span>
                    )}
                  </div>
                  {lastInspection && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="text-sm font-medium">Recent Inspection:</p>
                      <p className="text-sm text-gray-600">{lastInspection.notes}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(lastInspection.inspectedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/staff/inspections?amenity=${amenity._id}`)}
                  >
                    Inspect
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/staff/issues?amenity=${amenity._id}`)}
                  >
                    Report Issue
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {getFilteredAmenities().length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'No amenities found' 
              : `No amenities with status: ${filter.replace('_', ' ')}`
            }
          </p>
        </Card>
      )}
    </div>
  );
}
