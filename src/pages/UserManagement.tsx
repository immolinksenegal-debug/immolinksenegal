import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, UserCheck, UserX, Shield, Ban, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  is_banned: boolean;
  email?: string;
  roles: Array<'admin' | 'moderator' | 'user'>;
}

type AppRole = 'admin' | 'moderator' | 'user';

const UserManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole | "">("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    admins: 0,
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
          description: "Vous n'avez pas les permissions nécessaires",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
      loadUsers();
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/dashboard');
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);

      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Get emails from auth.users through a view or join
      // Since we can't directly query auth.users, we'll use the metadata
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      const authUsers = authData?.users || [];

      const usersWithRoles: UserProfile[] = profiles.map(profile => {
        const roles = (userRoles?.filter(r => r.user_id === profile.id).map(r => r.role as AppRole) || []) as Array<'admin' | 'moderator' | 'user'>;
        const authUser = authUsers.find((u: any) => u.id === profile.id);
        
        return {
          ...profile,
          email: authUser?.email,
          roles,
        };
      });

      setUsers(usersWithRoles);

      // Calculate stats
      const totalUsers = usersWithRoles.length;
      const activeUsers = usersWithRoles.filter(u => !u.is_banned).length;
      const bannedUsers = usersWithRoles.filter(u => u.is_banned).length;
      const admins = usersWithRoles.filter(u => u.roles.includes('admin')).length;

      setStats({
        totalUsers,
        activeUsers,
        bannedUsers,
        admins,
      });

    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanToggle = async (userId: string, currentBanStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentBanStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: currentBanStatus ? "Utilisateur débanni" : "Utilisateur banni",
      });

      loadUsers();
    } catch (error) {
      console.error('Error toggling ban status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'utilisateur",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      // Check if role already exists
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', selectedUser.id);

      const hasRole = existingRoles?.some(r => r.role === selectedRole);

      if (hasRole) {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.id)
          .eq('role', selectedRole as AppRole);

        if (error) throw error;

        toast({
          title: "Succès",
          description: `Rôle ${selectedRole} retiré`,
        });
      } else {
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert([{ 
            user_id: selectedUser.id, 
            role: selectedRole as AppRole 
          }]);

        if (error) throw error;

        toast({
          title: "Succès",
          description: `Rôle ${selectedRole} ajouté`,
        });
      }

      setShowRoleDialog(false);
      setSelectedUser(null);
      setSelectedRole("");
      loadUsers();
    } catch (error) {
      console.error('Error changing role:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rôle",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      admin: { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: Shield },
      moderator: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: UserCheck },
      user: { color: "bg-green-500/10 text-green-500 border-green-500/20", icon: Users },
    };

    const variant = variants[role] || variants.user;
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.color} border flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {role}
      </Badge>
    );
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
              Gestion des utilisateurs
            </h1>
            <p className="text-base xs:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Administrez les comptes et les permissions
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 md:gap-6 mb-6 xs:mb-8">
            <Card className="hover-lift shadow-card border-border/50 animate-scale-in">
              <CardContent className="pt-6 pb-6 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total utilisateurs
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.totalUsers}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <Users className="h-7 w-7 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift shadow-card border-border/50 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <CardContent className="pt-6 pb-6 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Utilisateurs actifs
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.activeUsers}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-7 w-7 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift shadow-card border-border/50 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="pt-6 pb-6 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Utilisateurs bannis
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.bannedUsers}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center">
                    <Ban className="h-7 w-7 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift shadow-card border-border/50 animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <CardContent className="pt-6 pb-6 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Administrateurs
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.admins}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="shadow-card border-border/50 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">Liste des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4 animate-pulse" />
                  <p className="text-muted-foreground">Chargement des utilisateurs...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Rôles</TableHead>
                        <TableHead>Date d'inscription</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.full_name || "Non renseigné"}
                          </TableCell>
                          <TableCell>{user.email || "Non disponible"}</TableCell>
                          <TableCell>{user.phone || "Non renseigné"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {user.roles.length > 0 ? (
                                user.roles.map(role => (
                                  <span key={role}>{getRoleBadge(role)}</span>
                                ))
                              ) : (
                                <Badge variant="outline">Aucun rôle</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            {user.is_banned ? (
                              <Badge className="bg-red-500/10 text-red-500 border-red-500/20 border">
                                <Ban className="h-3 w-3 mr-1" />
                                Banni
                              </Badge>
                            ) : (
                              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 border">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Actif
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowRoleDialog(true);
                                }}
                                className="transition-smooth"
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                Rôles
                              </Button>
                              <Button
                                size="sm"
                                variant={user.is_banned ? "default" : "destructive"}
                                onClick={() => handleBanToggle(user.id, user.is_banned)}
                                className="transition-smooth"
                              >
                                {user.is_banned ? (
                                  <>
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Débannir
                                  </>
                                ) : (
                                  <>
                                    <UserX className="h-3 w-3 mr-1" />
                                    Bannir
                                  </>
                                )}
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
        </div>
      </main>

      {/* Role Management Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gérer les rôles</DialogTitle>
            <DialogDescription>
              Utilisateur: {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">Rôles actuels:</p>
            <div className="flex gap-2 mb-4">
              {selectedUser?.roles.length ? (
                selectedUser.roles.map(role => (
                  <span key={role}>{getRoleBadge(role)}</span>
                ))
              ) : (
                <Badge variant="outline">Aucun rôle</Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-2">Modifier les rôles:</p>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as AppRole)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Sélectionner un rôle</option>
              <option value="admin">Admin</option>
              <option value="moderator">Modérateur</option>
              <option value="user">Utilisateur</option>
            </select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRoleDialog(false);
                setSelectedUser(null);
                setSelectedRole("");
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={!selectedRole}
              className="bg-secondary hover:bg-secondary-glow text-white"
            >
              {selectedRole && selectedUser?.roles.includes(selectedRole) ? "Retirer le rôle" : "Ajouter le rôle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default UserManagement;
