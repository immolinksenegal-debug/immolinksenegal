import { useEffect, useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { Geolocation } from '@capacitor/geolocation';
import { useToast } from "@/hooks/use-toast";

interface InteractiveLocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const defaultCenter = {
  lat: 14.6928, // Dakar, Sénégal
  lng: -17.4467
};

const containerStyle = {
  width: '100%',
  height: '400px'
};

export const InteractiveLocationPicker = ({
  latitude,
  longitude,
  onLocationChange,
}: InteractiveLocationPickerProps) => {
  const { toast } = useToast();
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    if (latitude && longitude) {
      setMarkerPosition({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      onLocationChange(lat, lng);
      
      toast({
        title: "Position mise à jour",
        description: `Nouvelle position: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      });
    }
  }, [onLocationChange, toast]);

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      onLocationChange(lat, lng);
      
      toast({
        title: "Position ajustée",
        description: `Nouvelle position: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      });
    }
  }, [onLocationChange, toast]);

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      // Demander la permission
      const permission = await Geolocation.checkPermissions();
      
      if (permission.location !== 'granted') {
        const requestPermission = await Geolocation.requestPermissions();
        if (requestPermission.location !== 'granted') {
          toast({
            title: "Permission refusée",
            description: "L'accès à la localisation a été refusé",
            variant: "destructive",
          });
          return;
        }
      }

      // Obtenir la position
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      setMarkerPosition({ lat, lng });
      onLocationChange(lat, lng);

      toast({
        title: "Position récupérée",
        description: `Lat: ${lat.toFixed(6)}, Long: ${lng.toFixed(6)}`,
      });
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer votre position. Vérifiez que la localisation est activée.",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  if (!isLoaded) {
    return (
      <Card className="shadow-card border-border/50">
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="text-destructive">Configuration requise</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            La clé API Google Maps n'est pas configurée. Veuillez ajouter
            VITE_GOOGLE_MAPS_API_KEY dans les variables d'environnement.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Localisation GPS
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Cliquez sur la carte ou déplacez le marqueur pour définir la position exacte du bien
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          variant="outline"
          className="w-full sm:w-auto"
        >
          {isGettingLocation ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Récupération de la position...
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Utiliser ma position actuelle
            </>
          )}
        </Button>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={markerPosition || defaultCenter}
          zoom={markerPosition ? 15 : 12}
          onClick={onMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: false,
          }}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable={true}
              onDragEnd={onMarkerDragEnd}
              animation={google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>

        {markerPosition && (
          <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Position sélectionnée</p>
              <p className="text-muted-foreground">
                Lat: {markerPosition.lat.toFixed(6)}, Long: {markerPosition.lng.toFixed(6)}
              </p>
            </div>
          </div>
        )}

        {!markerPosition && (
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Cliquez sur la carte ou utilisez votre position actuelle pour placer un marqueur
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
