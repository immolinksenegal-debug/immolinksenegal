import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Card } from './ui/card';
import { MapPin } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const containerStyle = {
  width: '100%',
  height: '400px'
};

// Default center: Dakar, Senegal
const defaultCenter = {
  lat: 14.6937,
  lng: -17.4441
};

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export const LocationPicker = ({ latitude, longitude, onLocationChange }: LocationPickerProps) => {
  const [markerPosition, setMarkerPosition] = useState(
    latitude && longitude 
      ? { lat: latitude, lng: longitude }
      : null
  );

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      onLocationChange(lat, lng);
    }
  }, [onLocationChange]);

  if (!isLoaded) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">Chargement de la carte...</p>
        </div>
      </Card>
    );
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Card className="p-4">
        <div className="flex flex-col items-center justify-center h-[400px] gap-2">
          <MapPin className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            Clé API Google Maps non configurée
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-2 mb-4">
        <h3 className="text-sm font-medium">Localisation sur la carte (optionnel)</h3>
        <p className="text-xs text-muted-foreground">
          Cliquez sur la carte pour définir la position exacte du bien
        </p>
        {markerPosition && (
          <p className="text-xs text-muted-foreground">
            Coordonnées: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
          </p>
        )}
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition || defaultCenter}
        zoom={markerPosition ? 15 : 12}
        onClick={onMapClick}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
    </Card>
  );
};
