
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';

interface LocationPickerProps {
  onLocationSelected: (location: { lat: number; lng: number; address?: string }) => void;
  initialLocation?: { lat: number; lng: number; address?: string };
}

// LocationMarker component to handle map interactions
const LocationMarker = ({ position, onPositionChange }: { 
  position: [number, number]; 
  onPositionChange: (latlng: LatLng) => void;
}) => {
  // Use the map events to update position on click
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const LocationPicker = ({ onLocationSelected, initialLocation }: LocationPickerProps) => {
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string }>({
    lat: initialLocation?.lat || 40.7128, // Default to NYC
    lng: initialLocation?.lng || -74.0060,
    address: initialLocation?.address || '',
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [addressInput, setAddressInput] = useState(initialLocation?.address || '');

  // Update parent component when location changes
  useEffect(() => {
    onLocationSelected(location);
  }, [location, onLocationSelected]);

  // Get current location using browser Geolocation API
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Try to get the address using reverse geocoding
        let address = '';
        try {
          // In a real app, we would use a geocoding service like Google Maps or OpenStreetMap Nominatim
          // For this demo, we'll just use a mock address
          address = `Near ${Math.floor(Math.random() * 1000)} Main St`;
        } catch (error) {
          console.error('Error getting address:', error);
        }
        
        setLocation({
          lat: latitude,
          lng: longitude,
          address,
        });
        setAddressInput(address);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Update location when marker is moved
  const handleMarkerPositionChange = (latlng: LatLng) => {
    setLocation({
      lat: latlng.lat,
      lng: latlng.lng,
      address: location.address,
    });
  };

  // Update address input
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressInput(e.target.value);
  };

  // Update the address in the location object
  const handleAddressSubmit = () => {
    setLocation({
      ...location,
      address: addressInput,
    });
  };

  return (
    <div className="w-full space-y-4">
      <div className="h-64 w-full rounded-md overflow-hidden">
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={[location.lat, location.lng]} 
            onPositionChange={handleMarkerPositionChange} 
          />
        </MapContainer>
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter address or description of location"
            value={addressInput}
            onChange={handleAddressChange}
            onBlur={handleAddressSubmit}
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={getCurrentLocation} 
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4 mr-1" />
            )}
            {isGettingLocation ? 'Getting...' : 'Current Location'}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>Click on the map to select a specific location or use the button to get your current location.</p>
          <p className="mt-1">
            <span className="font-semibold">Coordinates:</span> {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
