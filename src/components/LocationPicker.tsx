
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
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
    // Use multiple geocoding services for redundancy
    try {
      // First try OpenStreetMap Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'CityFix-App/1.0',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch from primary geocoding service');
      }
      
      const data = await response.json();
      
      if (data.display_name) {
        return data.display_name;
      }
    } catch (nomErr) {
      console.error('Error with primary geocoding service:', nomErr);
      // Continue to fallback
    }
    
    // Fallback to a simplified address format if geocoding fails
    return `Location at coordinates ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Error fetching address:', error);
    return `Location at coordinates ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

// Convert address to coordinates (geocoding)
const getCoordinatesFromAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const encoded = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'CityFix-App/1.0',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch coordinates');
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
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
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Update parent component when location changes
  useEffect(() => {
    onLocationSelected(location);
    setLocationError(null);
  }, [location, onLocationSelected]);

  // Try to get initial location on component mount
  useEffect(() => {
    if (!initialLocation && navigator.geolocation) {
      getCurrentLocation();
    }
  }, [initialLocation]);

  // Get current location using browser Geolocation API with improved error handling
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);
    
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
            errorMessage = 'Location access denied. Please enable location permissions in your browser.';
            break;
          case 2:
            errorMessage = 'Location unavailable. Try entering your address manually.';
            break;
          case 3:
            errorMessage = 'Location request timed out. Please try again or enter your address manually.';
            break;
        }
        
        toast.error(errorMessage);
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 30000 
      }
    );
  }, []);

  // Update location when marker is moved
  const handleMarkerPositionChange = async (latlng: LatLng) => {
    setLocationError(null);
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

  // When user presses enter or blurs the address input, try to geocode the address
  const handleAddressSubmit = async () => {
    if (!addressInput.trim()) return;
    
    setIsSearchingAddress(true);
    setLocationError(null);
    
    try {
      const coordinates = await getCoordinatesFromAddress(addressInput);
      
      if (coordinates) {
        const address = await getAddressFromCoordinates(coordinates.lat, coordinates.lng);
        
        setLocation({
          lat: coordinates.lat,
          lng: coordinates.lng,
          address,
        });
        
        setAddressInput(address);
      } else {
        setLocationError('Could not find this address. Please try another address or mark location on the map.');
        toast.error('Address not found. Please try another address.');
      }
    } catch (error) {
      console.error('Error searching address:', error);
      setLocationError('Error searching for address. Please try again later.');
      toast.error('Error searching for address');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Handle pressing enter in the address input field
  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddressSubmit();
    }
  };

  const handleSearchClick = () => {
    handleAddressSubmit();
  };

  const isLocationValid = location.lat !== defaultLocation.lat || location.lng !== defaultLocation.lng;

  return (
    <div className="w-full space-y-4">
      <div className="h-72 w-full rounded-md overflow-hidden border border-input">
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={isLocationValid ? 16 : 5}
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
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter address or description of location"
              value={addressInput}
              onChange={handleAddressChange}
              onKeyDown={handleAddressKeyDown}
              className="flex-1"
              disabled={isSearchingAddress}
            />
            <Button 
              type="button" 
              onClick={handleSearchClick}
              disabled={isSearchingAddress || !addressInput.trim()}
            >
              {isSearchingAddress ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <MapPin className="h-4 w-4 mr-1" />
              )}
              {isSearchingAddress ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={getCurrentLocation} 
              disabled={isGettingLocation}
              className="w-full"
            >
              {isGettingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <MapPin className="h-4 w-4 mr-1" />
              )}
              {isGettingLocation ? 'Getting your location...' : 'Use my current location'}
            </Button>
          </div>

          {locationError && (
            <div className="flex items-start gap-2 text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{locationError}</p>
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>Click on the map to select a specific location or use the buttons to search or get your current location.</p>
          {isLocationValid && (
            <p className="mt-1">
              <span className="font-semibold">Selected coordinates:</span> {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          )}
          {required && !isLocationValid && (
            <p className="text-xs text-red-500 mt-1 font-medium">Please set a specific location for your report</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
