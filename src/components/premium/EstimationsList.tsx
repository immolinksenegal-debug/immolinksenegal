import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator, Loader2, MapPin, Ruler, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface EstimationRequest {
  id: string;
  property_type: string;
  transaction_type: string;
  location: string;
  city: string;
  surface: number | null;
  bedrooms: number | null;
  status: string | null;
  estimated_price: number | null;
  response_message: string | null;
  responded_at: string | null;
  created_at: string;
}

const STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-secondary text-secondary-foreground" },
  in_progress: { label: "En cours", className: "bg-muted text-muted-foreground" },
  completed: { label: "Traitée", className: "bg-primary text-primary-foreground" },
  rejected: { label: "Refusée", className: "bg-destructive text-destructive-foreground" },
};

export const EstimationsList = () => {
  const [items, setItems] = useState<EstimationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("estimation_requests")
      .select("id, property_type, transaction_type, location, city, surface, bedrooms, status, estimated_price, response_message, responded_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data as EstimationRequest[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-lg xs:text-xl md:text-2xl flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Mes estimations
        </CardTitle>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="rounded-xl">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-muted-foreground mb-4">Aucune demande d'estimation pour le moment.</p>
            <Link to="/estimation-gratuite">
              <Button className="rounded-xl font-semibold">Demander une estimation</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const status = STATUS[item.status ?? "pending"] ?? {
                label: item.status ?? "En attente",
                className: "bg-muted text-muted-foreground",
              };
              return (
                <div key={item.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold capitalize">{item.property_type}</span>
                    <Badge className={status.className}>{status.label}</Badge>
                    <span className="text-xs text-muted-foreground capitalize">
                      {item.transaction_type}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(item.created_at), "d MMM yyyy", { locale: fr })}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-secondary" />
                      {item.location}, {item.city}
                    </span>
                    {item.surface && (
                      <span className="flex items-center gap-1">
                        <Ruler className="h-4 w-4 text-secondary" />
                        {item.surface} m²
                      </span>
                    )}
                    {item.bedrooms != null && <span>{item.bedrooms} chambre(s)</span>}
                  </div>

                  {(item.estimated_price || item.response_message) && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        {item.estimated_price && (
                          <p className="text-base font-semibold text-primary">
                            Estimation : {Number(item.estimated_price).toLocaleString("fr-FR")} FCFA
                          </p>
                        )}
                        {item.response_message && (
                          <p className="text-sm bg-muted/50 p-3 rounded-lg">{item.response_message}</p>
                        )}
                        {item.responded_at && (
                          <p className="text-xs text-muted-foreground">
                            Réponse du {format(new Date(item.responded_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimationsList;
