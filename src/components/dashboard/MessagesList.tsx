import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Mail, Phone, User, Home, Check, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ContactRequest {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
  property_id: string;
  property?: {
    title: string;
    city: string;
    location: string;
  };
}

export const MessagesList = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get contact requests for user's properties
      const { data: contactRequests, error } = await supabase
        .from('contact_requests')
        .select(`
          *,
          property:properties!inner(
            title,
            city,
            location,
            user_id
          )
        `)
        .eq('property.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMessages(contactRequests || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, status: newStatus } : msg
      ));

      toast({
        title: "Succès",
        description: "Statut mis à jour",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "En attente", variant: "secondary" as const, icon: Clock },
      contacted: { label: "Contacté", variant: "default" as const, icon: Check },
      closed: { label: "Clôturé", variant: "outline" as const, icon: Check },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="shadow-card border-border/50">
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="text-xl xs:text-2xl">Messages reçus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Aucun message
            </h3>
            <p className="text-muted-foreground">
              Les demandes de contact pour vos annonces apparaîtront ici
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="text-xl xs:text-2xl flex items-center gap-2">
          Messages reçus
          <Badge variant="secondary" className="ml-2">
            {messages.filter(m => m.status === 'pending').length} nouveau(x)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id} className="hover-lift border-2 transition-smooth">
            <CardContent className="p-4 xs:p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Home className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-foreground text-sm xs:text-base">
                        {message.property?.title || 'Propriété'}
                      </h3>
                    </div>
                    <p className="text-xs xs:text-sm text-muted-foreground">
                      {message.property?.location}, {message.property?.city}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(message.status)}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(message.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Contact Info */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-secondary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Nom</p>
                      <p className="text-sm font-medium">{message.requester_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-secondary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a 
                        href={`mailto:${message.requester_email}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {message.requester_email}
                      </a>
                    </div>
                  </div>
                  {message.requester_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-secondary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Téléphone</p>
                        <a 
                          href={`tel:${message.requester_phone}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {message.requester_phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message */}
                {message.message && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Message</p>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">
                        {message.message}
                      </p>
                    </div>
                  </>
                )}

                {/* Actions */}
                {message.status === 'pending' && (
                  <>
                    <Separator />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateStatus(message.id, 'contacted')}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Marquer comme contacté
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(message.id, 'closed')}
                      >
                        Clôturer
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
