import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Mail, MessageSquare, Home, Loader2 } from "lucide-react";

export const NotificationSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [settings, setSettings] = useState({
    notification_email: true,
    notification_sms: false,
    notification_new_messages: true,
    notification_property_updates: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('notification_email, notification_sms, notification_new_messages, notification_property_updates')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          notification_email: data.notification_email ?? true,
          notification_sms: data.notification_sms ?? false,
          notification_new_messages: data.notification_new_messages ?? true,
          notification_property_updates: data.notification_property_updates ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      toast.error("Impossible de charger vos préférences");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Préférences de notification mises à jour !");
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error("Impossible de mettre à jour vos préférences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (isFetching) {
    return (
      <Card className="shadow-card border-border/50">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Bell className="h-6 w-6 text-secondary" />
          Notifications
        </CardTitle>
        <CardDescription>
          Gérez vos préférences de notification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
            <div className="flex items-start gap-3 flex-1">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="notification_email" className="text-base font-medium cursor-pointer">
                  Notifications par email
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Recevez des emails pour les événements importants
                </p>
              </div>
            </div>
            <Switch
              id="notification_email"
              checked={settings.notification_email}
              onCheckedChange={() => handleToggle('notification_email')}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
            <div className="flex items-start gap-3 flex-1">
              <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="notification_sms" className="text-base font-medium cursor-pointer">
                  Notifications SMS
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Recevez des SMS pour les événements urgents
                </p>
              </div>
            </div>
            <Switch
              id="notification_sms"
              checked={settings.notification_sms}
              onCheckedChange={() => handleToggle('notification_sms')}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
            <div className="flex items-start gap-3 flex-1">
              <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="notification_new_messages" className="text-base font-medium cursor-pointer">
                  Nouveaux messages
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Être notifié lors de nouveaux messages
                </p>
              </div>
            </div>
            <Switch
              id="notification_new_messages"
              checked={settings.notification_new_messages}
              onCheckedChange={() => handleToggle('notification_new_messages')}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
            <div className="flex items-start gap-3 flex-1">
              <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="notification_property_updates" className="text-base font-medium cursor-pointer">
                  Mises à jour des propriétés
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Notifications sur les mises à jour de vos annonces
                </p>
              </div>
            </div>
            <Switch
              id="notification_property_updates"
              checked={settings.notification_property_updates}
              onCheckedChange={() => handleToggle('notification_property_updates')}
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-secondary hover:bg-secondary-glow text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer les préférences"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
