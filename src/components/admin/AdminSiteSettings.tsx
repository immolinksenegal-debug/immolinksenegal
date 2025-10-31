import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SiteInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface SocialLinks {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
}

interface Features {
  blog_enabled: boolean;
  estimation_enabled: boolean;
  ai_chat_enabled: boolean;
}

interface PayTechConfig {
  api_key: string;
  secret_key: string;
}

interface SEO {
  site_title: string;
  meta_description: string;
  keywords: string;
}

export const AdminSiteSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  });

  const [features, setFeatures] = useState<Features>({
    blog_enabled: true,
    estimation_enabled: true,
    ai_chat_enabled: true,
  });

  const [paytechConfig, setPaytechConfig] = useState<PayTechConfig>({
    api_key: "",
    secret_key: "",
  });

  const [seo, setSeo] = useState<SEO>({
    site_title: "",
    meta_description: "",
    keywords: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      data?.forEach((setting) => {
        switch (setting.setting_key) {
          case 'site_info':
            setSiteInfo(setting.setting_value as unknown as SiteInfo);
            break;
          case 'social_links':
            setSocialLinks(setting.setting_value as unknown as SocialLinks);
            break;
          case 'features':
            setFeatures(setting.setting_value as unknown as Features);
            break;
          case 'paytech_config':
            setPaytechConfig(setting.setting_value as unknown as PayTechConfig);
            break;
          case 'seo':
            setSeo(setting.setting_value as unknown as SEO);
            break;
        }
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);

      const settings = [
        { setting_key: 'site_info', setting_value: siteInfo as any },
        { setting_key: 'social_links', setting_value: socialLinks as any },
        { setting_key: 'features', setting_value: features as any },
        { setting_key: 'paytech_config', setting_value: paytechConfig as any },
        { setting_key: 'seo', setting_value: seo as any },
      ];

      for (const setting of settings) {
        const { error } = await supabase
          .from('site_settings')
          .upsert([setting], {
            onConflict: 'setting_key'
          });

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: "Paramètres enregistrés avec succès",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les paramètres",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-card border-border/50">
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Chargement des paramètres...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Site Info */}
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle>Informations du site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nom du site</Label>
              <Input
                value={siteInfo.name}
                onChange={(e) => setSiteInfo({ ...siteInfo, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email de contact</Label>
              <Input
                type="email"
                value={siteInfo.email}
                onChange={(e) => setSiteInfo({ ...siteInfo, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input
                value={siteInfo.phone}
                onChange={(e) => setSiteInfo({ ...siteInfo, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Adresse</Label>
              <Input
                value={siteInfo.address}
                onChange={(e) => setSiteInfo({ ...siteInfo, address: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle>Réseaux sociaux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Facebook</Label>
              <Input
                placeholder="https://facebook.com/..."
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
              />
            </div>
            <div>
              <Label>Twitter</Label>
              <Input
                placeholder="https://twitter.com/..."
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
              />
            </div>
            <div>
              <Label>Instagram</Label>
              <Input
                placeholder="https://instagram.com/..."
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
              />
            </div>
            <div>
              <Label>LinkedIn</Label>
              <Input
                placeholder="https://linkedin.com/..."
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle>Fonctionnalités</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Blog d'actualités</Label>
              <p className="text-sm text-muted-foreground">Activer la section blog</p>
            </div>
            <Switch
              checked={features.blog_enabled}
              onCheckedChange={(checked) => setFeatures({ ...features, blog_enabled: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Estimation gratuite</Label>
              <p className="text-sm text-muted-foreground">Activer le formulaire d'estimation</p>
            </div>
            <Switch
              checked={features.estimation_enabled}
              onCheckedChange={(checked) => setFeatures({ ...features, estimation_enabled: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Chat IA</Label>
              <p className="text-sm text-muted-foreground">Activer l'assistant intelligent</p>
            </div>
            <Switch
              checked={features.ai_chat_enabled}
              onCheckedChange={(checked) => setFeatures({ ...features, ai_chat_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* PayTech Configuration */}
      <Card className="shadow-card border-border/50 border-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💳 Configuration PayTech
            <span className="text-xs font-normal text-muted-foreground">(Clés API de paiement)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground">
              ⚠️ Ces clés sont sensibles et permettent de traiter les paiements. 
              Assurez-vous de les garder confidentielles. Obtenez vos clés depuis votre 
              <a href="https://paytech.sn" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline ml-1">
                compte PayTech
              </a>
            </p>
          </div>
          <div>
            <Label>Clé API (API_KEY)</Label>
            <Input
              type="password"
              placeholder="Entrez votre clé API PayTech"
              value={paytechConfig.api_key}
              onChange={(e) => setPaytechConfig({ ...paytechConfig, api_key: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: Clé publique fournie par PayTech
            </p>
          </div>
          <div>
            <Label>Clé Secrète (SECRET_KEY)</Label>
            <Input
              type="password"
              placeholder="Entrez votre clé secrète PayTech"
              value={paytechConfig.secret_key}
              onChange={(e) => setPaytechConfig({ ...paytechConfig, secret_key: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: Clé privée à ne jamais partager
            </p>
          </div>
          {paytechConfig.api_key && paytechConfig.secret_key && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ Clés API configurées
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO */}
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle>Paramètres SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Titre du site</Label>
            <Input
              value={seo.site_title}
              onChange={(e) => setSeo({ ...seo, site_title: e.target.value })}
            />
          </div>
          <div>
            <Label>Meta description</Label>
            <Textarea
              value={seo.meta_description}
              onChange={(e) => setSeo({ ...seo, meta_description: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label>Mots-clés (séparés par des virgules)</Label>
            <Textarea
              value={seo.keywords}
              onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="bg-secondary hover:bg-secondary-glow text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </div>
  );
};
