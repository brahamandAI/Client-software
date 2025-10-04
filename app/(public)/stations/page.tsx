'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
}

interface StationAmenity {
  _id: string;
  amenityTypeId: {
    _id: string;
    name: string;
  };
  locationDescription: string;
  status: 'ok' | 'needs_maintenance' | 'out_of_service';
  lastInspectedAt: string;
}

export default function StationInformationPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [stationAmenities, setStationAmenities] = useState<StationAmenity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/stations');
      if (response.ok) {
        const data = await response.json();
        setStations(data);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
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

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    fetchStationAmenities(station._id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-100 text-green-800';
      case 'needs_maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusCounts = () => {
    return {
      ok: stationAmenities.filter(a => a.status === 'ok').length,
      needs_maintenance: stationAmenities.filter(a => a.status === 'needs_maintenance').length,
      out_of_service: stationAmenities.filter(a => a.status === 'out_of_service').length
    };
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Station Information</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stations List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Stations</h2>
          <div className="space-y-3">
            {stations.map((station) => (
              <Card 
                key={station._id} 
                className={`p-4 cursor-pointer transition-colors ${
                  selectedStation?._id === station._id 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleStationSelect(station)}
              >
                <h3 className="font-semibold">{station.name}</h3>
                <p className="text-sm text-gray-600">Code: {station.code}</p>
                <p className="text-sm text-gray-500">
                  {station.city}, {station.state} - {station.pincode}
                </p>
                <p className="text-sm text-gray-500">Region: {station.region}</p>
                <Badge variant="outline" className="mt-2">
                  {station.amenities?.length || 0} Amenities
                </Badge>
              </Card>
            ))}
          </div>
        </div>

        {/* Station Details */}
        <div>
          {selectedStation ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {selectedStation.name} Details
              </h2>
              
              {/* Station Info */}
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Station Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Station Code</p>
                    <p className="text-lg">{selectedStation.code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Region</p>
                    <p className="text-lg">{selectedStation.region}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">City</p>
                    <p className="text-lg">{selectedStation.city}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">State</p>
                    <p className="text-lg">{selectedStation.state}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pincode</p>
                    <p className="text-lg">{selectedStation.pincode}</p>
                  </div>
                </div>
              </Card>

              {/* Amenities Status */}
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Amenities Status</h3>
                {stationAmenities.length > 0 ? (
                  <div>
                    {/* Status Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {(() => {
                        const counts = getStatusCounts();
                        return (
                          <>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{counts.ok}</p>
                              <p className="text-sm text-gray-600">Working</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-yellow-600">{counts.needs_maintenance}</p>
                              <p className="text-sm text-gray-600">Maintenance</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-red-600">{counts.out_of_service}</p>
                              <p className="text-sm text-gray-600">Out of Service</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Amenities List */}
                    <div className="space-y-2">
                      {stationAmenities.map((amenity) => (
                        <div key={amenity._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{amenity.amenityTypeId?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{amenity.locationDescription || 'Unknown Location'}</p>
                          </div>
                          <Badge className={getStatusColor(amenity.status)}>
                            {amenity.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No amenities information available</p>
                )}
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.location.href = `/public/issues?station=${selectedStation._id}`}
                  className="flex-1"
                >
                  Report Issue
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = `/public/issues`}
                >
                  View All Issues
                </Button>
              </div>
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-gray-500">Select a station to view details</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
