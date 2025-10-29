import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Trash2, Sparkles, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  is_featured: boolean;
  views: number;
  created_at: string;
  author_id: string;
}

interface AdminArticlesManagerProps {
  onStatsUpdate: () => void;
}

export const AdminArticlesManager = ({ onStatsUpdate }: AdminArticlesManagerProps) => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'published' | 'draft'>('all');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [articleIdea, setArticleIdea] = useState("");

  useEffect(() => {
    loadArticles();
  }, [filter]);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
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

  const handleStatusChange = async (articleId: string, status: 'published' | 'rejected') => {
    try {
      const updateData: any = { status };
      if (status === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', articleId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Article ${status === 'published' ? 'publié' : 'rejeté'}`,
      });

      loadArticles();
      onStatsUpdate();
    } catch (error) {
      console.error('Error updating article status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (articleId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Article supprimé",
      });

      loadArticles();
      onStatsUpdate();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article",
        variant: "destructive",
      });
    }
  };

  const handleGenerateArticle = async () => {
    if (!articleIdea.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une idée d'article",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase.functions.invoke('generate-article', {
        body: { idea: articleIdea }
      });

      if (error) throw error;

      const slug = data.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { error: insertError } = await supabase
        .from('articles')
        .insert({
          title: data.title,
          slug,
          content: data.content,
          excerpt: data.excerpt,
          featured_image: data.featured_image || null,
          author_id: user.id,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "Article et image générés avec succès ! En attente de validation.",
      });

      setShowGenerateDialog(false);
      setArticleIdea("");
      loadArticles();
      onStatsUpdate();
    } catch (error) {
      console.error('Error generating article:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'article",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      published: "bg-green-500/10 text-green-500 border-green-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20",
      draft: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };

    const labels: Record<string, string> = {
      pending: "En attente",
      published: "Publié",
      rejected: "Rejeté",
      draft: "Brouillon",
    };

    return (
      <Badge className={`${variants[status]} border`}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <>
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-2xl">Gestion des articles</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={() => setShowGenerateDialog(true)}
                className="bg-secondary hover:bg-secondary-glow text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Générer avec l'IA
              </Button>
              <Button
                size="sm"
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                Tous
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
                variant={filter === 'published' ? 'default' : 'outline'}
                onClick={() => setFilter('published')}
              >
                Publiés
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
                    <TableHead>Extrait</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {article.title}
                          {article.is_featured && (
                            <Sparkles className="h-4 w-4 text-secondary" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {article.excerpt || "Pas d'extrait"}
                      </TableCell>
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
                      <TableCell>{article.views}</TableCell>
                      <TableCell>{new Date(article.created_at).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {article.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleStatusChange(article.id, 'published')}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Publier
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusChange(article.id, 'rejected')}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejeter
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(article.id)}
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

      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Générer un article avec l'IA</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Idée ou sujet de l'article
            </label>
            <Textarea
              value={articleIdea}
              onChange={(e) => setArticleIdea(e.target.value)}
              placeholder="Ex: Les tendances du marché immobilier à Dakar en 2025..."
              rows={4}
              disabled={isGenerating}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGenerateDialog(false)}
              disabled={isGenerating}
            >
              Annuler
            </Button>
            <Button
              onClick={handleGenerateArticle}
              disabled={isGenerating}
              className="bg-secondary hover:bg-secondary-glow text-white"
            >
              {isGenerating ? (
                <>Génération en cours...</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Générer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
