import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calculator, CheckCircle, Clock, Mail, Phone, MapPin, Home, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EstimationRequest {
  id: string;
  property_type: string;
  location: string;
  city: string;
  surface: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  condition: string | null;
  description: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status: string;
  estimated_price: number | null;
  response_message: string | null;
  responded_at: string | null;
  created_at: string;
}

const EstimationManagement = () => {
  const [requests, setRequests] = useState<EstimationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<EstimationRequest | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (error) throw error;

      if (!roles || roles.length === 0) {
        toast({
          title: "Accès refusé",
          description: "Vous devez être administrateur pour accéder à cette page",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      loadRequests();
    } catch (error: any) {
      console.error("Admin check error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier les permissions",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("estimation_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (error: any) {
      console.error("Load requests error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenResponse = (request: EstimationRequest) => {
    setSelectedRequest(request);
    setEstimatedPrice(request.estimated_price?.toString() || "");
    setResponseMessage(request.response_message || "");
    setResponseDialogOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedRequest) return;

    if (!estimatedPrice || !responseMessage) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("estimation_requests")
        .update({
          estimated_price: parseFloat(estimatedPrice),
          response_message: responseMessage,
          responded_at: new Date().toISOString(),
          responded_by: user?.id,
          status: "responded",
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: "✅ Réponse envoyée",
        description: "La réponse a été enregistrée avec succès",
      });

      setResponseDialogOpen(false);
      loadRequests();
    } catch (error: any) {
      console.error("Submit response error:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la réponse",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case "responded":
        return <Badge variant="outline" className="bg-green-50"><CheckCircle className="w-3 h-3 mr-1" />Répondu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Calculator className="w-8 h-8 animate-spin text-secondary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Demandes d'Estimation</h1>
          <p className="text-muted-foreground">
            Gérez toutes les demandes d'estimation reçues
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des demandes ({requests.length})</CardTitle>
            <CardDescription>
              Cliquez sur une demande pour y répondre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Bien</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Détails</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucune demande d'estimation pour le moment
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(request.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{request.contact_name}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {request.contact_email}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {request.contact_phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{request.property_type}</div>
                            {request.condition && (
                              <div className="text-xs text-muted-foreground">{request.condition}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{request.city}</div>
                              <div className="text-xs text-muted-foreground">{request.location}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-xs">
                            {request.surface && <div>Surface: {request.surface} m²</div>}
                            {request.bedrooms && <div>Chambres: {request.bedrooms}</div>}
                            {request.bathrooms && <div>SDB: {request.bathrooms}</div>}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenResponse(request)}
                          >
                            {request.status === "responded" ? "Modifier" : "Répondre"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Répondre à la demande d'estimation</DialogTitle>
            <DialogDescription>
              Fournissez une estimation et un message personnalisé au client
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Home className="w-5 h-5 text-secondary" />
                    Détails de la demande
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Type:</span> {selectedRequest.property_type}
                    </div>
                    <div>
                      <span className="font-semibold">Ville:</span> {selectedRequest.city}
                    </div>
                    <div>
                      <span className="font-semibold">Quartier:</span> {selectedRequest.location}
                    </div>
                    {selectedRequest.surface && (
                      <div>
                        <span className="font-semibold">Surface:</span> {selectedRequest.surface} m²
                      </div>
                    )}
                    {selectedRequest.bedrooms && (
                      <div>
                        <span className="font-semibold">Chambres:</span> {selectedRequest.bedrooms}
                      </div>
                    )}
                    {selectedRequest.bathrooms && (
                      <div>
                        <span className="font-semibold">Salles de bain:</span> {selectedRequest.bathrooms}
                      </div>
                    )}
                  </div>
                  {selectedRequest.description && (
                    <div>
                      <span className="font-semibold">Description:</span>
                      <p className="text-sm text-muted-foreground mt-1">{selectedRequest.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Response Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated_price">Prix estimé (FCFA) *</Label>
                  <Input
                    id="estimated_price"
                    type="number"
                    placeholder="Ex: 45000000"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response_message">Message de réponse *</Label>
                  <Textarea
                    id="response_message"
                    rows={6}
                    placeholder="Bonjour, suite à votre demande d'estimation pour votre bien situé à..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ce message sera envoyé au client par email
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setResponseDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmitResponse}
                  disabled={isSubmitting}
                  className="bg-secondary hover:bg-secondary-glow"
                >
                  {isSubmitting ? (
                    <>
                      <Calculator className="w-4 h-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Envoyer la réponse
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EstimationManagement;
