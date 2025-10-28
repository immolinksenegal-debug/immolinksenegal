import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Eye, Trash2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  price: number;
  type: string;
  approval_status: string;
  is_premium: boolean;
  created_at: string;
  user_id: string;
}

interface AdminPropertiesManagerProps {
  onStatsUpdate: () => void;
}

export const AdminPropertiesManager = ({ onStatsUpdate }: AdminPropertiesManagerProps) => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadProperties();
  }, [filter]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('approval_status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (propertyId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ approval_status: status })
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Annonce ${status === 'approved' ? 'approuvée' : 'rejetée'}`,
      });

      loadProperties();
      onStatsUpdate();
    } catch (error) {
      console.error('Error updating property status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Annonce supprimée",
      });

      loadProperties();
      onStatsUpdate();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annonce",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      approved: "bg-green-500/10 text-green-500 border-green-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    return (
      <Badge className={`${variants[status]} border`}>
        {status === 'pending' ? 'En attente' : status === 'approved' ? 'Approuvée' : 'Rejetée'}
      </Badge>
    );
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-2xl">Gestion des annonces</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              Toutes
            </Button>
            <Button
              size="sm"
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
            >
              En attente
            </Button>
            <Button
              size="sm"
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
            >
              Approuvées
            </Button>
            <Button
              size="sm"
              variant={filter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setFilter('rejected')}
            >
              Rejetées
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {property.title}
                        {property.is_premium && (
                          <Sparkles className="h-4 w-4 text-secondary" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{property.city}</TableCell>
                    <TableCell>{property.type}</TableCell>
                    <TableCell>{property.price.toLocaleString('fr-FR')} FCFA</TableCell>
                    <TableCell>{getStatusBadge(property.approval_status)}</TableCell>
                    <TableCell>{new Date(property.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {property.approval_status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApproval(property.id, 'approved')}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleApproval(property.id, 'rejected')}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Rejeter
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/property/${property.id}`, '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(property.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
