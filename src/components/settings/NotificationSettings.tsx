import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Mail, MessageSquare, Home, Loader2, ShieldCheck, CalendarClock, Smartphone } from "lucide-react";

type Settings = {
  notification_email: boolean;
  notification_sms: boolean;
  notification_new_messages: boolean;
  notification_property_updates: boolean;
  notification_account_emails: boolean;
  notification_pack_expiry: boolean;
};

const DEFAULTS: Settings = {
  notification_email: true,
  notification_sms: false,
  notification_new_messages: true,
  notification_property_updates: true,
  notification_account_emails: true,
  notification_pack_expiry: true,
};

const EMAIL_ITEMS: {
  key: keyof Settings;
  icon: typeof Mail;
  title: string;
  description: string;
}[] = [
  {
    key: "notification_account_emails",
    icon: ShieldCheck,
    title: "Compte et sécurité",
    description: "Inscription, confirmation d'email et réinitialisation de mot de passe",
  },
  {
    key: "notification_property_updates",
    icon: Home,
    title: "Mes annonces",
    description: "Annonce publiée, approuvée ou refusée par l'équipe",
  },
  {
    key: "notification_pack_expiry",
    icon: CalendarClock,
    title: "Rappels d'expiration",
    description: "Alerte avant l'expiration de votre pack ou de vos options premium",
  },
  {
    key: "notification_new_messages",
    icon: MessageSquare,
    title: "Nouveaux messages",
    description: "Un visiteur vous contacte au sujet d'un de vos biens",
  },
];

export const NotificationSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('notification_email, notification_sms, notification_new_messages, notification_property_updates, notification_account_emails, notification_pack_expiry')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          notification_email: data.notification_email ?? DEFAULTS.notification_email,
          notification_sms: data.notification_sms ?? DEFAULTS.notification_sms,
          notification_new_messages: data.notification_new_messages ?? DEFAULTS.notification_new_messages,
          notification_property_updates: data.notification_property_updates ?? DEFAULTS.notification_property_updates,
          notification_account_emails: data.notification_account_emails ?? DEFAULTS.notification_account_emails,
          notification_pack_expiry: data.notification_pack_expiry ?? DEFAULTS.notification_pack_expiry,
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

  const handleToggle = (key: keyof Settings) => {
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

  const emailsDisabled = !settings.notification_email;

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Bell className="h-6 w-6 text-secondary" />
          Notifications
        </CardTitle>
        <CardDescription>
          Choisissez précisément les emails automatiques que vous souhaitez recevoir
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg border border-primary/30 bg-primary/5">
          <div className="flex items-start gap-3 flex-1">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="notification_email" className="text-base font-semibold cursor-pointer">
                Recevoir les emails automatiques
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Interrupteur principal : désactivez-le pour ne plus recevoir aucun email (hors emails légaux indispensables)
              </p>
            </div>
          </div>
          <Switch
            id="notification_email"
            checked={settings.notification_email}
            onCheckedChange={() => handleToggle('notification_email')}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Types d'emails</p>

          {EMAIL_ITEMS.map(({ key, icon: Icon, title, description }) => (
            <div
              key={key}
              className={`flex items-center justify-between p-4 rounded-lg border border-border bg-card transition-opacity ${emailsDisabled ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-3 flex-1">
                <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor={key} className="text-base font-medium cursor-pointer">
                    {title}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
              </div>
              <Switch
                id={key}
                disabled={emailsDisabled}
                checked={settings[key] && !emailsDisabled}
                onCheckedChange={() => handleToggle(key)}
              />
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
          <div className="flex items-start gap-3 flex-1">
            <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5" />
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

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
