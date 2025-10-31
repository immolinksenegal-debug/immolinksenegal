import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  };
}

interface CommentSectionProps {
  propertyId?: string;
  articleId?: string;
}

const CommentSection = ({ propertyId, articleId }: CommentSectionProps) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchComments();
  }, [propertyId, articleId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('comments')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      } else if (articleId) {
        query = query.eq('article_id', articleId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour commenter",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Erreur",
        description: "Le commentaire ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const commentData: any = {
        content: newComment.trim(),
        user_id: user.id,
        status: 'pending',
      };

      if (propertyId) {
        commentData.property_id = propertyId;
      } else if (articleId) {
        commentData.article_id = articleId;
      }

      const { error } = await supabase
        .from('comments')
        .insert([commentData]);

      if (error) throw error;

      toast({
        title: "Commentaire envoyé",
        description: "Votre commentaire sera visible après validation",
      });

      setNewComment("");
      fetchComments();
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de publier le commentaire",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      if (diffInHours < 1) return "À l'instant";
      return `Il y a ${diffInHours}h`;
    }

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-secondary" />
        <h3 className="text-xl font-semibold text-foreground">
          Commentaires ({comments.length})
        </h3>
      </div>

      {/* Add Comment */}
      {user && (
        <Card className="shadow-soft border-border/50">
          <CardContent className="pt-6 space-y-4">
            <Textarea
              placeholder="Partagez votre avis..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim()}
                className="bg-secondary hover:bg-secondary-glow text-white rounded-xl"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Envoi...' : 'Publier'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Chargement des commentaires...</p>
        ) : comments.length === 0 ? (
          <Card className="shadow-soft border-border/50">
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">Aucun commentaire pour le moment</p>
              {!user && (
                <p className="text-sm text-muted-foreground mt-2">
                  Connectez-vous pour être le premier à commenter
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="shadow-soft border-border/50 hover:shadow-glow-secondary transition-smooth">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 border-2 border-secondary/20">
                    <AvatarFallback className="bg-secondary/10 text-secondary font-semibold">
                      {getInitials(comment.profiles?.full_name || 'Utilisateur')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">
                        {comment.profiles?.full_name || 'Utilisateur'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;