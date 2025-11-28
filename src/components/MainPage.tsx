import { useState, useEffect } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';

interface Parking {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  totalSlots: number;
  pricePerHour: number;
}

interface MainPageProps {
  onSelectParking: (parking: Parking) => void;
  accessToken?: string;
}

export function MainPage({ onSelectParking, accessToken }: MainPageProps) {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [filteredParkings, setFilteredParkings] = useState<Parking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParkings();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredParkings(parkings);
    } else {
      const filtered = parkings.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredParkings(filtered);
    }
  }, [searchQuery, parkings]);

  const fetchParkings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9c2e4e69/parkings`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setParkings(data.parkings);
        setFilteredParkings(data.parkings);
      } else {
        toast.error('Failed to fetch parkings');
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location error:', error);
          // Default to Delhi if location access denied
          setUserLocation({ lat: 28.6139, lng: 77.209 });
        }
      );
    } else {
      // Default to Delhi
      setUserLocation({ lat: 28.6139, lng: 77.209 });
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-white shadow-sm p-4">
        <div className="container mx-auto">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search parking by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="relative h-96 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={48} className="mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 mb-2">Interactive Map View</p>
              <p className="text-sm text-gray-500">Showing parking locations in India</p>
              {userLocation && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                  <Navigation size={16} className="text-green-600" />
                  <span>Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
                </div>
              )}
            </div>
            {/* Map markers */}
            {filteredParkings.map((parking, index) => (
              <div
                key={parking.id}
                className="absolute w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform shadow-lg"
                style={{
                  left: `${20 + index * 15}%`,
                  top: `${30 + (index % 2) * 20}%`,
                }}
                onClick={() => onSelectParking(parking)}
              >
                <MapPin size={20} />
              </div>
            ))}
          </div>
        </div>

        {/* Parking List */}
        <div>
          <h2 className="mb-4">Available Parking Spots</h2>
          {loading ? (
            <p className="text-center text-gray-500">Loading parkings...</p>
          ) : filteredParkings.length === 0 ? (
            <p className="text-center text-gray-500">No parking spots found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredParkings.map((parking) => {
                const distance = userLocation
                  ? calculateDistance(userLocation.lat, userLocation.lng, parking.lat, parking.lng)
                  : null;

                return (
                  <Card
                    key={parking.id}
                    className="p-6 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => onSelectParking(parking)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="mb-1">{parking.name}</h3>
                        <p className="text-sm text-gray-600">{parking.address}</p>
                      </div>
                      <MapPin className="text-blue-600" size={24} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Slots:</span>
                        <span>{parking.totalSlots}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="text-green-600">₹{parking.pricePerHour}/hour</span>
                      </div>
                      {distance !== null && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Distance:</span>
                          <span>{distance.toFixed(1)} km</span>
                        </div>
                      )}
                    </div>
                    <Button className="w-full mt-4">
                      View Slots
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
