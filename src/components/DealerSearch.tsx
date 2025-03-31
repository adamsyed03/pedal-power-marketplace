
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
// This is needed because Leaflet's default icon URLs are relative to the HTML page
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Dealer {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  operating_hours: string;
  website: string;
}

export const DealerSearch = () => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapPosition, setMapPosition] = useState<[number, number]>([45.815, 15.9819]); // Default to Zagreb coordinates
  const [map, setMap] = useState<L.Map | null>(null);

  // Load dealers from Supabase
  useEffect(() => {
    const loadDealers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('dealers')
          .select('*');

        if (error) throw error;
        if (data) setDealers(data);
      } catch (error) {
        console.error('Error loading dealers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDealers();
  }, []);

  // Get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newPosition);
          setMapPosition(newPosition); // Update map position to user's location
          
          // If map is available, update its view
          if (map) {
            map.setView(newPosition, 13);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter dealers based on search query and sort by distance if user location is available
  const filteredDealers = dealers
    .filter(dealer => 
      dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (!userLocation) return 0;
      const distA = calculateDistance(userLocation[0], userLocation[1], a.latitude, a.longitude);
      const distB = calculateDistance(userLocation[0], userLocation[1], b.latitude, b.longitude);
      return distA - distB;
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Find a Dealer</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name or location..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            onClick={getUserLocation}
            className="bg-black text-white hover:bg-black/90"
          >
            Use My Location
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Map */}
        <div className="h-[600px] rounded-lg overflow-hidden">
          <MapContainer 
            style={{ height: '100%', width: '100%' }}
            className="h-full w-full"
            ref={setMap}
            whenCreated={setMap}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filteredDealers.map(dealer => (
              <Marker
                key={dealer.id}
                position={[dealer.latitude, dealer.longitude]}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold">{dealer.name}</h3>
                    <p className="text-sm">{dealer.address}</p>
                    <p className="text-sm">{dealer.phone}</p>
                    <a
                      href={dealer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
            {userLocation && (
              <Marker 
                position={userLocation}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold">Your Location</h3>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Dealer List */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            {loading ? 'Loading dealers...' : `${filteredDealers.length} Dealers Found`}
          </h3>
          <div className="space-y-4">
            {filteredDealers.map(dealer => (
              <div
                key={dealer.id}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="font-bold">{dealer.name}</h4>
                <p className="text-sm text-gray-600">{dealer.address}</p>
                {userLocation && (
                  <p className="text-sm text-gray-500">
                    {calculateDistance(
                      userLocation[0],
                      userLocation[1],
                      dealer.latitude,
                      dealer.longitude
                    ).toFixed(1)} km away
                  </p>
                )}
                <div className="mt-2 space-y-1">
                  <p className="text-sm">{dealer.phone}</p>
                  <p className="text-sm">{dealer.operating_hours}</p>
                  <a
                    href={dealer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
