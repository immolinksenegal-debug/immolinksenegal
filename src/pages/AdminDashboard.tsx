import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Shield,
  TrendingUp,
  Users,
  AlertCircle,
  Mail,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminPropertiesManager } from "@/components/admin/AdminPropertiesManager";
import { AdminArticlesManager } from "@/components/admin/AdminArticlesManager";
import { AdminCommentsManager } from "@/components/admin/AdminCommentsManager";
import { AdminSiteSettings } from "@/components/admin/AdminSiteSettings";
import AdminContactMessages from "@/components/admin/AdminContactMessages";
import { AdminContractsManager } from "@/components/admin/AdminContractsManager";

interface Stats {
  totalProperties: number;
  pendingProperties: number;
  totalUsers: number;
  totalArticles: number;
  pendingArticles: number;
  totalComments: number;
  pendingComments: number;
  totalReports: number;
  totalContactMessages: number;
  pendingContactMessages: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    pendingProperties: 0,
    totalUsers: 0,
    totalArticles: 0,
    pendingArticles: 0,
    totalComments: 0,
    pendingComments: 0,
    totalReports: 0,
    totalContactMessages: 0,
    pendingContactMessages: 0,
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      const hasAdminRole = roles?.some(r => r.role === 'admin');
      
      if (!hasAdminRole) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions d'administrateur",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
      loadStats();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error checking admin status:', error);
      }
      navigate('/dashboard');
    }
  };

  const loadStats = async () => {
    try {
      setIsLoading(true);

      // Fetch properties stats
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      const { count: pendingProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'pending');

      // Fetch users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch articles stats
      const { count: totalArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      const { count: pendingArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch comments stats
      const { count: totalComments } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });

      const { count: pendingComments } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch reports count
      const { count: totalReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch contact messages stats
      const { count: totalContactMessages } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true });

      const { count: pendingContactMessages } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalProperties: totalProperties || 0,
        pendingProperties: pendingProperties || 0,
        totalUsers: totalUsers || 0,
        totalArticles: totalArticles || 0,
        pendingArticles: pendingArticles || 0,
        totalComments: totalComments || 0,
        pendingComments: pendingComments || 0,
        totalReports: totalReports || 0,
        totalContactMessages: totalContactMessages || 0,
        pendingContactMessages: pendingContactMessages || 0,
      });

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading stats:', error);
      }
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 xs:pt-28 md:pt-32 pb-8 xs:pb-12 bg-gradient-subtle">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <div className="mb-8 xs:mb-10 md:mb-12 text-center animate-fade-in-up">
            <h1 className="text-3xl xs:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 md:mb-4">
              Administration
            </h1>
            <p className="text-base xs:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Contrôle et gestion de la plateforme Immo Link Sénégal
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 md:gap-6 mb-6 xs:mb-8">
            <Card className="hover-lift shadow-card border-border/50 animate-scale-in">
              <CardContent className="pt-6 pb-6 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Annonces</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalProperties}</p>
                    {stats.pendingProperties > 0 && (
                      <p className="text-xs text-orange-500 mt-1">
                        {stats.pendingProperties} en attente
                      </p>
                    )}
                  </div>
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <Home className="h-7 w-7 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift shadow-card border-border/50 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <CardContent className="pt-6 pb-6 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Utilisateurs</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                  </div>
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift shadow-card border-border/50 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="pt-6 pb-6 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Articles</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalArticles}</p>
                    {stats.pendingArticles > 0 && (
                      <p className="text-xs text-orange-500 mt-1">
                        {stats.pendingArticles} en attente
                      </p>
                    )}
                  </div>
                  <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <FileText className="h-7 w-7 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift shadow-card border-border/50 animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <CardContent className="pt-6 pb-6 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Messages Contact</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalContactMessages}</p>
                    {stats.pendingContactMessages > 0 && (
                      <p className="text-xs text-orange-500 mt-1">
                        {stats.pendingContactMessages} en attente
                      </p>
                    )}
                  </div>
                  <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Mail className="h-7 w-7 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Tabs */}
          <Tabs defaultValue="properties" className="animate-fade-in">
            <TabsList className="mb-4 xs:mb-6 bg-card shadow-soft flex-wrap h-auto p-1 gap-1">
              <TabsTrigger
                value="properties"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white transition-smooth text-xs xs:text-sm px-2 xs:px-3 py-2"
              >
                <Home className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                Annonces
              </TabsTrigger>
              <TabsTrigger
                value="articles"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white transition-smooth text-xs xs:text-sm px-2 xs:px-3 py-2"
              >
                <FileText className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                Articles
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white transition-smooth text-xs xs:text-sm px-2 xs:px-3 py-2"
              >
                <MessageSquare className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                Commentaires
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white transition-smooth text-xs xs:text-sm px-2 xs:px-3 py-2"
              >
                <Mail className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                Messages
              </TabsTrigger>
              <TabsTrigger
                value="contracts"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white transition-smooth text-xs xs:text-sm px-2 xs:px-3 py-2"
              >
                <FileText className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                Contrats
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white transition-smooth text-xs xs:text-sm px-2 xs:px-3 py-2"
              >
                <Settings className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties">
              <AdminPropertiesManager onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="articles">
              <AdminArticlesManager onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="comments">
              <AdminCommentsManager onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="contact">
              <AdminContactMessages />
            </TabsContent>

            <TabsContent value="contracts">
              <AdminContractsManager />
            </TabsContent>

            <TabsContent value="settings">
              <AdminSiteSettings />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
