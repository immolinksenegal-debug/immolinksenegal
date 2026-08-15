import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Loader2, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type WebhookLog = {
  id: string;
  provider: string;
  ref_command: string | null;
  event_type: string | null;
  status: string;
  message: string | null;
  amount: number | null;
  subscription_id: string | null;
  user_id: string | null;
  created_at: string;
};

const STATUS_META: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  success: { label: "Succès", className: "bg-primary text-primary-foreground", icon: CheckCircle2 },
  renewed: { label: "Renouvelé", className: "bg-primary text-primary-foreground", icon: RefreshCw },
  duplicate: { label: "IPN rejoué", className: "bg-secondary text-secondary-foreground", icon: Clock },
  cancelled: { label: "Annulé", className: "bg-muted text-muted-foreground", icon: XCircle },
  unauthorized: { label: "Non autorisé", className: "bg-destructive text-destructive-foreground", icon: ShieldAlert },
  error: { label: "Erreur", className: "bg-destructive text-destructive-foreground", icon: AlertTriangle },
};

export const AdminPaymentLogs = () => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from("payment_webhook_logs")
      .select("id, provider, ref_command, event_type, status, message, amount, subscription_id, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setLogs((data as WebhookLog[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const counts = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="px-3 xs:px-6 py-4 xs:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-lg xs:text-xl md:text-2xl">Journal des paiements (IPN)</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px] rounded-xl">
                <SelectValue placeholder="Filtrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les événements</SelectItem>
                <SelectItem value="success">Succès</SelectItem>
                <SelectItem value="renewed">Renouvellements</SelectItem>
                <SelectItem value="duplicate">IPN rejoués</SelectItem>
                <SelectItem value="cancelled">Annulés</SelectItem>
                <SelectItem value="error">Erreurs</SelectItem>
                <SelectItem value="unauthorized">Non autorisés</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={load} disabled={loading} className="rounded-xl">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        {!loading && logs.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3">
            {Object.entries(counts).map(([status, count]) => (
              <Badge key={status} className={STATUS_META[status]?.className ?? "bg-muted text-muted-foreground"}>
                {(STATUS_META[status]?.label ?? status)} : {count}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-3 xs:px-6 pb-6">
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">Aucun événement de paiement enregistré.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const meta = STATUS_META[log.status] ?? {
                label: log.status,
                className: "bg-muted text-muted-foreground",
                icon: AlertTriangle,
              };
              const Icon = meta.icon;
              return (
                <div key={log.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={meta.className}>{meta.label}</Badge>
                        {log.event_type && (
                          <span className="text-xs text-muted-foreground">{log.event_type}</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString("fr-FR")}
                        </span>
                      </div>
                      {log.message && <p className="text-sm mt-1">{log.message}</p>}
                      <p className="text-xs text-muted-foreground mt-1 break-all">
                        {log.ref_command ? `Réf. ${log.ref_command}` : "Sans référence"}
                        {log.amount ? ` · ${Number(log.amount).toLocaleString("fr-FR")} XOF` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPaymentLogs;
