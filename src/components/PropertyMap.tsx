import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Card } from './ui/card';
import { MapPin } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const containerStyle = {
  width: '100%',
  height: '300px'
};

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title?: string;
}

export const PropertyMap = ({ latitude, longitude, title }: PropertyMapProps) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  if (!isLoaded) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Chargement de la carte...</p>
        </div>
      </Card>
    );
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  const position = { lat: latitude, lng: longitude };

  return (
    <Card className="p-4">
      <div className="space-y-2 mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-secondary" />
          Localisation
        </h3>
        {title && (
          <p className="text-sm text-muted-foreground">{title}</p>
        )}
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={position}
        zoom={15}
      >
        <Marker position={position} />
      </GoogleMap>
    </Card>
  );
};
