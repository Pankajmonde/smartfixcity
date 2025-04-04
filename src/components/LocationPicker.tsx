
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { toast } from 'sonner';

interface LocationPickerProps {
  onLocationSelected: (location: { lat: number; lng: number; address?: string }) => void;
  initialLocation?: { lat: number; lng: number; address?: string };
  required?: boolean;
}

// Component to recenter map when location changes
const MapRecenterer = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  
  return null;
};

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

// Function to get address from coordinates using reverse geocoding
const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'CityFix-App/1.0', // Best practice to identify your app
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }
    
    const data = await response.json();
    
    if (data.display_name) {
      return data.display_name;
    } else {
      return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  } catch (error) {
    console.error('Error fetching address:', error);
    return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

const LocationPicker = ({ onLocationSelected, initialLocation, required = false }: LocationPickerProps) => {
  // Default to India location (center of India - near Nagpur)
  const defaultLocation = {
    lat: 20.5937,
    lng: 78.9629,
    address: initialLocation?.address || 'India',
  };

  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string }>(
    initialLocation || defaultLocation
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [addressInput, setAddressInput] = useState(initialLocation?.address || defaultLocation.address || '');
  const [mapLoaded, setMapLoaded] = useState(false);

  // Update parent component when location changes
  useEffect(() => {
    onLocationSelected(location);
  }, [location, onLocationSelected]);

  // Get current location using browser Geolocation API
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Try to get the address using reverse geocoding
        const address = await getAddressFromCoordinates(latitude, longitude);
        
        const newLocation = {
          lat: latitude,
          lng: longitude,
          address,
        };
        
        setLocation(newLocation);
        setAddressInput(address);
        setIsGettingLocation(false);
        toast.success('Current location detected');
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Failed to get your location';
        
        switch(error.code) {
          case 1:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case 2:
            errorMessage = 'Location unavailable. Please try again.';
            break;
          case 3:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        
        toast.error(errorMessage);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Update location when marker is moved
  const handleMarkerPositionChange = async (latlng: LatLng) => {
    const address = await getAddressFromCoordinates(latlng.lat, latlng.lng);
    
    setLocation({
      lat: latlng.lat,
      lng: latlng.lng,
      address,
    });
    
    setAddressInput(address);
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
      <div className="h-64 w-full rounded-md overflow-hidden border border-input">
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          whenReady={() => setMapLoaded(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={[location.lat, location.lng]} 
            onPositionChange={handleMarkerPositionChange} 
          />
          <MapRecenterer position={[location.lat, location.lng]} />
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
          {required && location.lat === defaultLocation.lat && location.lng === defaultLocation.lng && (
            <p className="text-xs text-red-500 mt-1">Please set a specific location for your report</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
