import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Eye, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import bannerFiscalite from "@/assets/banner-fiscalite-senegal.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  created_at: string;
  views: number;
  is_featured: boolean;
}

const Articles = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadArticles();
    loadSidebarArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les articles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSidebarArticles = async () => {
    try {
      // Articles populaires (par vues)
      const { data: popular } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('views', { ascending: false })
        .limit(5);

      // Articles récents
      const { data: recent } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);

      setPopularArticles(popular || []);
      setRecentArticles(recent || []);
    } catch (error) {
      console.error('Error loading sidebar articles:', error);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 xs:pt-28 md:pt-32 lg:pt-36">
      {/* Hero Banner */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img 
          src={bannerFiscalite} 
          alt="Fiscalité Immobilière au Sénégal" 
          className="w-full h-full object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/20 to-transparent flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-2xl">
              Actualités Immobilières
            </h1>
            <p className="text-white text-lg md:text-xl max-w-2xl mx-auto drop-shadow-lg">
              Restez informé des dernières tendances du marché immobilier sénégalais
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-10 pb-16">

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg shadow-card border-2 focus:border-secondary transition-base"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Articles List */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Chargement des articles...</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun article trouvé</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="hover-lift shadow-card border-border/50 overflow-hidden">
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Image */}
                      <div className="md:col-span-1">
                        <div className="relative h-48 md:h-full">
                          {article.featured_image ? (
                            <img
                              src={article.featured_image}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-modern flex items-center justify-center">
                              <span className="text-white text-4xl">📰</span>
                            </div>
                          )}
                          {article.is_featured && (
                            <Badge className="absolute top-3 left-3 bg-accent text-white border-0">
                              À la une
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <CardContent className="md:col-span-2 p-6">
                        <Link to={`/articles/${article.slug}`}>
                          <h3 className="text-2xl font-bold mb-3 hover:text-secondary transition-base">
                            {article.title}
                          </h3>
                        </Link>
                        
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {article.excerpt || "Lisez cet article pour en savoir plus..."}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(article.created_at).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {article.views} vues
                          </span>
                        </div>

                        <Link to={`/articles/${article.slug}`}>
                          <Button className="bg-secondary hover:bg-secondary-glow text-white">
                            Lire la suite
                          </Button>
                        </Link>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Articles Populaires */}
            <Card className="shadow-card border-border/50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Articles Populaires
                </h3>
                <div className="space-y-3">
                  {popularArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/articles/${article.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          {article.featured_image ? (
                            <img
                              src={article.featured_image}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-modern flex items-center justify-center text-white">
                              📰
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-secondary transition-base">
                            {article.title}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Eye className="h-3 w-3" />
                            {article.views}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Articles Récents */}
            <Card className="shadow-card border-border/50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-secondary" />
                  Articles Récents
                </h3>
                <div className="space-y-3">
                  {recentArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/articles/${article.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          {article.featured_image ? (
                            <img
                              src={article.featured_image}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-modern flex items-center justify-center text-white">
                              📰
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-secondary transition-base">
                            {article.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(article.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default Articles;
