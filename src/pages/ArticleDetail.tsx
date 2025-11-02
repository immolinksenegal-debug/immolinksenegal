import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, ArrowLeft, MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from 'dompurify';
import ShareButtons from "@/components/ShareButtons";
import SEOHead from "@/components/SEOHead";

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  created_at: string;
  views: number;
  is_featured: boolean;
  published_at: string | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  status: string;
  user_name?: string;
}

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Vérifier l'authentification
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    if (slug) {
      loadArticle();
      loadComments();
      incrementViews();
    }
  }, [slug]);

  const loadArticle = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (error) {
      console.error('Error loading article:', error);
      toast({
        title: "Erreur",
        description: "Article introuvable",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      // D'abord obtenir l'ID de l'article
      const { data: articleData } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!articleData) return;

      // Ensuite charger les commentaires
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleData.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Charger les profils pour chaque commentaire
      const commentsWithProfiles = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', comment.user_id)
            .single();

          return {
            ...comment,
            user_name: profile?.full_name || 'Utilisateur'
          };
        })
      );

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const incrementViews = async () => {
    try {
      const { data: articleData } = await supabase
        .from('articles')
        .select('id, views')
        .eq('slug', slug)
        .single();

      if (articleData) {
        await supabase
          .from('articles')
          .update({ views: articleData.views + 1 })
          .eq('id', articleData.id);
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour commenter",
        variant: "destructive",
      });
      return;
    }

    if (!commentContent.trim()) {
      toast({
        title: "Erreur",
        description: "Le commentaire ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const { data: articleData } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!articleData) throw new Error("Article introuvable");

      const { error } = await supabase
        .from('comments')
        .insert({
          article_id: articleData.id,
          user_id: user.id,
          content: commentContent,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Commentaire envoyé",
        description: "Votre commentaire sera visible après validation",
      });

      setCommentContent("");
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le commentaire",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <p className="text-muted-foreground">Chargement de l'article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Article introuvable</p>
          <Link to="/articles">
            <Button className="bg-secondary hover:bg-secondary-glow text-white">
              Retour aux articles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEOHead
        title={article.title}
        description={article.excerpt || article.title}
        image={article.featured_image || undefined}
        url={`https://immolinksenegal.com/articles/${article.slug}`}
        type="article"
        publishedTime={article.published_at || article.created_at}
        modifiedTime={article.created_at}
      />
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link to="/articles" className="inline-flex items-center gap-2 mb-6 hover:text-secondary transition-base">
          <ArrowLeft className="h-4 w-4" />
          Retour aux articles
        </Link>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {article.featured_image && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-elevated">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <div className="mb-8">
            {article.is_featured && (
              <Badge className="mb-4 bg-accent text-white border-0">
                À la une
              </Badge>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {article.title}
            </h1>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(article.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {article.views} vues
                </span>
              </div>
              <ShareButtons
                title={article.title}
                description={article.excerpt || article.title}
                url={`https://immolinksenegal.com/articles/${article.slug}`}
                imageUrl={article.featured_image || undefined}
              />
            </div>
          </div>

          {/* Article Body */}
          <Card className="shadow-card border-border/50 mb-12">
            <CardContent className="p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(article.content, {
                    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'br', 'blockquote', 'code', 'pre', 'img', 'div', 'span'],
                    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'style'],
                    ALLOW_DATA_ATTR: false
                  })
                }}
              />
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="shadow-card border-border/50">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-secondary" />
                Commentaires ({comments.length})
              </h2>

              {/* Comment Form */}
              {user ? (
                <form onSubmit={handleSubmitComment} className="mb-8">
                  <Textarea
                    placeholder="Laissez votre commentaire..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={4}
                    className="mb-4"
                    disabled={isSubmitting}
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-secondary hover:bg-secondary-glow text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Envoi..." : "Publier le commentaire"}
                  </Button>
                </form>
              ) : (
                <div className="mb-8 p-4 bg-muted rounded-lg">
                  <p className="text-muted-foreground">
                    <Link to="/auth" className="text-secondary hover:underline">
                      Connectez-vous
                    </Link>
                    {" "}pour laisser un commentaire
                  </p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun commentaire pour le moment. Soyez le premier à commenter !
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="border-b border-border pb-6 last:border-0">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-modern flex items-center justify-center text-white font-bold flex-shrink-0">
                          {comment.user_name?.[0] || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">
                              {comment.user_name || "Utilisateur"}
                            </p>
                            <span className="text-sm text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-foreground">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  );
};

export default ArticleDetail;
