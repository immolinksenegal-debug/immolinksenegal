import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PackOrder = {
  id: string;
  pack_id: string;
  billing: string;
  amount: number;
  currency: string;
  status: string;
  payment_url: string | null;
  payment_ref: string | null;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
};

const PACK_LABELS: Record<string, string> = {
  boost: "Boost",
  premium: "Premium",
  agence: "Agence",
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: "Actif", className: "bg-primary text-primary-foreground" },
  pending: { label: "En attente", className: "bg-secondary text-secondary-foreground" },
  expired: { label: "Expiré", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Annulé", className: "bg-destructive text-destructive-foreground" },
};

const fmtDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const isLinkUsable = (order: PackOrder) =>
  order.status === "pending" &&
  !!order.payment_url &&
  Date.now() - new Date(order.created_at).getTime() < 30 * 60 * 1000;

export const PackOrdersHistory = () => {
  const [orders, setOrders] = useState<PackOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("pack_subscriptions")
      .select("id, pack_id, billing, amount, currency, status, payment_url, payment_ref, starts_at, expires_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setOrders((data as PackOrder[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="px-3 xs:px-6 py-4 xs:py-6 flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-lg xs:text-xl md:text-2xl flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Historique des commandes
        </CardTitle>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="rounded-xl">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="px-3 xs:px-6 pb-6">
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-muted-foreground mb-4">Aucune commande de pack pour le moment.</p>
            <Link to="/#packs">
              <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                Découvrir les packs
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = STATUS_LABELS[order.status] ?? {
                label: order.status,
                className: "bg-muted text-muted-foreground",
              };
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">
                        Pack {PACK_LABELS[order.pack_id] ?? order.pack_id}
                      </span>
                      <Badge className={status.className}>{status.label}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {order.billing === "yearly" ? "Annuel" : "Mensuel"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Commandé le {fmtDate(order.created_at)} · {order.amount.toLocaleString("fr-FR")} {order.currency}
                      {order.expires_at && order.status === "active"
                        ? ` · valide jusqu'au ${fmtDate(order.expires_at)}`
                        : ""}
                    </p>
                    {order.payment_ref && (
                      <p className="text-xs text-muted-foreground mt-1 break-all">Réf. {order.payment_ref}</p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {isLinkUsable(order) ? (
                      <a href={order.payment_url!} target="_blank" rel="noopener noreferrer">
                        <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Payer
                        </Button>
                      </a>
                    ) : order.status === "pending" || order.status === "expired" || order.status === "cancelled" ? (
                      <Link to={`/checkout?pack=${order.pack_id}&billing=${order.billing}`}>
                        <Button variant="outline" className="rounded-xl font-semibold">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Relancer
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`/checkout?pack=${order.pack_id}&billing=${order.billing}`}>
                        <Button variant="outline" className="rounded-xl font-semibold">
                          Renouveler
                        </Button>
                      </Link>
                    )}
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

export default PackOrdersHistory;
