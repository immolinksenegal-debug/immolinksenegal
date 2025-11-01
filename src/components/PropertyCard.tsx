import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Heart, Eye, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: string;
  bedrooms?: number;
  bathrooms?: number;
  surface: number;
  image: string;
  type: string;
  featured?: boolean;
  description?: string;
  status?: string;
  views?: number;
  createdAt?: string;
  isPremium?: boolean;
}

const PropertyCard = ({
  id,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  surface,
  image,
  type,
  featured = false,
  description,
  status = 'active',
  views = 0,
  createdAt,
  isPremium = false,
}: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="group overflow-hidden hover-lift bg-card shadow-card border-border/50 rounded-2xl">
      <div className="relative overflow-hidden aspect-[4/3] bg-muted">
        <img
          src={imageError ? '/placeholder.svg' : (image || '/placeholder.svg')}
          alt={title}
          className="w-full h-full object-cover transition-smooth group-hover:scale-110"
          onError={(e) => {
            setImageError(true);
            e.currentTarget.src = '/placeholder.svg';
          }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth"></div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
          <Badge className="bg-primary text-primary-foreground font-semibold shadow-soft">
            {type}
          </Badge>
          {isPremium && (
            <Badge className="bg-gradient-primary text-white font-semibold shadow-glow-secondary animate-pulse-glow">
              ⭐ Premium
            </Badge>
          )}
          {featured && (
            <Badge className="bg-accent text-accent-foreground font-semibold shadow-soft">
              ⭐ À la une
            </Badge>
          )}
          {status && status !== 'active' && (
            <Badge variant={status === 'sold' ? 'destructive' : 'secondary'} className="font-semibold shadow-soft">
              {status === 'sold' ? 'Vendu' : status === 'pending' ? 'En attente' : 'Inactif'}
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full glass-effect flex items-center justify-center transition-smooth hover:scale-110"
        >
          <Heart
            className={`h-5 w-5 transition-smooth ${
              isFavorite
                ? "fill-destructive text-destructive"
                : "text-white"
            }`}
          />
        </button>
      </div>

      <CardContent className="p-5">
        <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-secondary transition-base">
          {title}
        </h3>
        
        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-1 text-secondary" />
          <span className="text-sm line-clamp-1">{location}</span>
        </div>

        {description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
          {bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-primary" />
              <span>{bedrooms}</span>
            </div>
          )}
          {bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4 text-primary" />
              <span>{bathrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4 text-primary" />
            <span>{surface} m²</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
          {views > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{views} vues</span>
            </div>
          )}
          {createdAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          )}
        </div>

        <div className="text-2xl font-bold text-secondary">
          {price} <span className="text-lg font-normal text-muted-foreground">FCFA</span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Link to={`/property/${id}`} className="w-full">
          <Button className="w-full bg-primary hover:bg-primary-glow text-primary-foreground transition-smooth rounded-xl font-semibold">
            Voir les détails
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
