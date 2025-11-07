import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Eye, Download, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Contract {
  id: string;
  contract_type: string;
  status: string;
  owner_name: string;
  owner_email: string;
  property_address: string;
  monthly_rent: number;
  start_date: string;
  created_at: string;
  pdf_url?: string;
}

interface FormData {
  contract_type: 'mandat_gestion' | 'contrat_location';
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  owner_address: string;
  owner_id_number: string;
  property_address: string;
  property_type: string;
  property_description: string;
  property_surface: string;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  tenant_address: string;
  tenant_id_number: string;
  start_date: string;
  end_date: string;
  monthly_rent: string;
  commission_rate: string;
  security_deposit: string;
  special_conditions: string;
}

export const AdminContractsManager = () => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    contract_type: 'mandat_gestion',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    owner_address: '',
    owner_id_number: '',
    property_address: '',
    property_type: 'appartement',
    property_description: '',
    property_surface: '',
    tenant_name: '',
    tenant_email: '',
    tenant_phone: '',
    tenant_address: '',
    tenant_id_number: '',
    start_date: '',
    end_date: '',
    monthly_rent: '',
    commission_rate: '10',
    security_deposit: '',
    special_conditions: '',
  });

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les contrats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Insert contract into database
      const { data: contract, error: insertError } = await supabase
        .from('property_contracts')
        .insert({
          user_id: user.id,
          contract_type: formData.contract_type,
          owner_name: formData.owner_name,
          owner_email: formData.owner_email,
          owner_phone: formData.owner_phone,
          owner_address: formData.owner_address,
          owner_id_number: formData.owner_id_number,
          property_address: formData.property_address,
          property_type: formData.property_type,
          property_description: formData.property_description,
          property_surface: formData.property_surface ? parseFloat(formData.property_surface) : null,
          tenant_name: formData.tenant_name || null,
          tenant_email: formData.tenant_email || null,
          tenant_phone: formData.tenant_phone || null,
          tenant_address: formData.tenant_address || null,
          tenant_id_number: formData.tenant_id_number || null,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          monthly_rent: parseFloat(formData.monthly_rent),
          commission_rate: parseFloat(formData.commission_rate),
          security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : null,
          special_conditions: formData.special_conditions || null,
          status: 'draft',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Generate PDF
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-contract-pdf', {
        body: { contractId: contract.id },
      });

      if (pdfError) throw pdfError;

      toast({
        title: "Succès",
        description: "Le contrat a été créé avec succès",
      });

      setIsDialogOpen(false);
      loadContracts();
      resetForm();
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le contrat",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contrat ?")) return;

    try {
      const { error } = await supabase
        .from('property_contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Contrat supprimé",
      });
      loadContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le contrat",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      contract_type: 'mandat_gestion',
      owner_name: '',
      owner_email: '',
      owner_phone: '',
      owner_address: '',
      owner_id_number: '',
      property_address: '',
      property_type: 'appartement',
      property_description: '',
      property_surface: '',
      tenant_name: '',
      tenant_email: '',
      tenant_phone: '',
      tenant_address: '',
      tenant_id_number: '',
      start_date: '',
      end_date: '',
      monthly_rent: '',
      commission_rate: '10',
      security_deposit: '',
      special_conditions: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      draft: "secondary",
      generated: "default",
      sent: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getContractTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'mandat_gestion' ? "secondary" : "default"}>
        {type === 'mandat_gestion' ? 'Mandat de Gestion' : 'Contrat de Location'}
      </Badge>
    );
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Gestion des Contrats
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Contrat
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un Nouveau Contrat</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contract Type */}
              <div className="space-y-2">
                <Label htmlFor="contract_type">Type de Contrat *</Label>
                <Select
                  value={formData.contract_type}
                  onValueChange={(value: 'mandat_gestion' | 'contrat_location') =>
                    setFormData({ ...formData, contract_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mandat_gestion">Mandat de Gestion</SelectItem>
                    <SelectItem value="contrat_location">Contrat de Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Owner Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informations du Propriétaire</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner_name">Nom Complet *</Label>
                    <Input
                      id="owner_name"
                      value={formData.owner_name}
                      onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner_email">Email *</Label>
                    <Input
                      id="owner_email"
                      type="email"
                      value={formData.owner_email}
                      onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner_phone">Téléphone</Label>
                    <Input
                      id="owner_phone"
                      value={formData.owner_phone}
                      onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner_id_number">N° Pièce d'Identité</Label>
                    <Input
                      id="owner_id_number"
                      value={formData.owner_id_number}
                      onChange={(e) => setFormData({ ...formData, owner_id_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="owner_address">Adresse Complète *</Label>
                    <Textarea
                      id="owner_address"
                      value={formData.owner_address}
                      onChange={(e) => setFormData({ ...formData, owner_address: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informations du Bien</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="property_address">Adresse du Bien *</Label>
                    <Input
                      id="property_address"
                      value={formData.property_address}
                      onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property_type">Type de Bien *</Label>
                    <Select
                      value={formData.property_type}
                      onValueChange={(value) => setFormData({ ...formData, property_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appartement">Appartement</SelectItem>
                        <SelectItem value="maison">Maison</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="bureau">Bureau</SelectItem>
                        <SelectItem value="commerce">Commerce</SelectItem>
                        <SelectItem value="terrain">Terrain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property_surface">Surface (m²)</Label>
                    <Input
                      id="property_surface"
                      type="number"
                      value={formData.property_surface}
                      onChange={(e) => setFormData({ ...formData, property_surface: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="property_description">Description du Bien</Label>
                    <Textarea
                      id="property_description"
                      value={formData.property_description}
                      onChange={(e) => setFormData({ ...formData, property_description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Tenant Information - Only for rental contracts */}
              {formData.contract_type === 'contrat_location' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Informations du Locataire</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tenant_name">Nom Complet</Label>
                      <Input
                        id="tenant_name"
                        value={formData.tenant_name}
                        onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenant_email">Email</Label>
                      <Input
                        id="tenant_email"
                        type="email"
                        value={formData.tenant_email}
                        onChange={(e) => setFormData({ ...formData, tenant_email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenant_phone">Téléphone</Label>
                      <Input
                        id="tenant_phone"
                        value={formData.tenant_phone}
                        onChange={(e) => setFormData({ ...formData, tenant_phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenant_id_number">N° Pièce d'Identité</Label>
                      <Input
                        id="tenant_id_number"
                        value={formData.tenant_id_number}
                        onChange={(e) => setFormData({ ...formData, tenant_id_number: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="tenant_address">Adresse Complète</Label>
                      <Textarea
                        id="tenant_address"
                        value={formData.tenant_address}
                        onChange={(e) => setFormData({ ...formData, tenant_address: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contract Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Détails du Contrat</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Date de Début *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">Date de Fin</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly_rent">Loyer Mensuel (FCFA) *</Label>
                    <Input
                      id="monthly_rent"
                      type="number"
                      value={formData.monthly_rent}
                      onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commission_rate">Taux de Commission (%)</Label>
                    <Input
                      id="commission_rate"
                      type="number"
                      value={formData.commission_rate}
                      onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="security_deposit">Caution (FCFA)</Label>
                    <Input
                      id="security_deposit"
                      type="number"
                      value={formData.security_deposit}
                      onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="special_conditions">Conditions Particulières</Label>
                    <Textarea
                      id="special_conditions"
                      value={formData.special_conditions}
                      onChange={(e) => setFormData({ ...formData, special_conditions: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={generating}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={generating}>
                  {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer et Générer le PDF
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun contrat trouvé
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Propriétaire</TableHead>
                <TableHead>Adresse du Bien</TableHead>
                <TableHead>Loyer</TableHead>
                <TableHead>Date Début</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{getContractTypeBadge(contract.contract_type)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{contract.owner_name}</div>
                      <div className="text-sm text-muted-foreground">{contract.owner_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{contract.property_address}</TableCell>
                  <TableCell>{contract.monthly_rent.toLocaleString()} FCFA</TableCell>
                  <TableCell>
                    {format(new Date(contract.start_date), 'dd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {contract.pdf_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(contract.pdf_url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(contract.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};