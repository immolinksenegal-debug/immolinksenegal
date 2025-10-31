import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { subscriptionId } = await req.json()
    console.log('📄 Generating invoice for subscription:', subscriptionId)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch subscription with invoice data
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription || !subscription.invoice_data || !subscription.invoice_number) {
      console.error('❌ Subscription not found or no invoice data')
      return new Response(
        JSON.stringify({ error: 'Facture non disponible' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const invoiceData = subscription.invoice_data
    const invoiceDate = new Date(invoiceData.paidAt).toLocaleDateString('fr-FR')

    // Generate HTML invoice
    const htmlInvoice = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${subscription.invoice_number}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
        .invoice-container { max-width: 800px; margin: 40px auto; padding: 40px; background: white; }
        .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; border-bottom: 3px solid #8B4513; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #8B4513; }
        .invoice-info { text-align: right; }
        .invoice-number { font-size: 24px; font-weight: bold; color: #1a365d; margin-bottom: 5px; }
        .invoice-date { color: #666; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: bold; color: #1a365d; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e0e0e0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .info-block { padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .info-label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
        .info-value { font-size: 16px; color: #333; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .items-table th { background: #1a365d; color: white; padding: 15px; text-align: left; font-weight: 600; }
        .items-table td { padding: 15px; border-bottom: 1px solid #e0e0e0; }
        .items-table tr:last-child td { border-bottom: none; }
        .total-section { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; }
        .total-row.grand-total { border-top: 2px solid #8B4513; margin-top: 10px; padding-top: 15px; font-size: 22px; font-weight: bold; color: #1a365d; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; color: #666; font-size: 12px; }
        .paid-stamp { display: inline-block; padding: 10px 30px; background: #22c55e; color: white; font-weight: bold; border-radius: 8px; font-size: 18px; margin: 20px 0; }
        @media print { body { margin: 0; } .invoice-container { margin: 0; box-shadow: none; } }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div>
                <div class="logo">🏡 Immo Link Sénégal</div>
                <div style="color: #666; margin-top: 5px;">Plateforme immobilière moderne</div>
            </div>
            <div class="invoice-info">
                <div class="invoice-number">FACTURE</div>
                <div class="invoice-date">N° ${subscription.invoice_number}</div>
                <div class="invoice-date">Date: ${invoiceDate}</div>
            </div>
        </div>

        <div class="info-grid">
            <div class="info-block">
                <div class="info-label">Facturé à</div>
                <div class="info-value" style="font-weight: bold; margin-bottom: 5px;">${invoiceData.customerName}</div>
                <div class="info-value" style="font-size: 14px; color: #666;">${invoiceData.customerPhone || ''}</div>
            </div>
            <div class="info-block">
                <div class="info-label">Propriété</div>
                <div class="info-value" style="font-weight: bold; margin-bottom: 5px;">${invoiceData.propertyTitle}</div>
                <div class="info-value" style="font-size: 14px; color: #666;">${invoiceData.propertyLocation}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Détails de la transaction</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Plan</th>
                        <th>Durée</th>
                        <th style="text-align: right;">Montant</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>Abonnement Premium</strong><br>
                            <span style="font-size: 14px; color: #666;">Badge Premium + Affichage vedette + Visibilité maximale</span>
                        </td>
                        <td>${invoiceData.plan}</td>
                        <td>${invoiceData.plan === 'Annuel' ? '12 mois' : '1 mois'}</td>
                        <td style="text-align: right; font-weight: bold;">${invoiceData.amount.toLocaleString()} ${invoiceData.currency}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="total-section">
            <div class="total-row">
                <span>Sous-total</span>
                <span>${invoiceData.amount.toLocaleString()} ${invoiceData.currency}</span>
            </div>
            <div class="total-row">
                <span>TVA (0%)</span>
                <span>0 ${invoiceData.currency}</span>
            </div>
            <div class="total-row grand-total">
                <span>TOTAL</span>
                <span>${invoiceData.amount.toLocaleString()} ${invoiceData.currency}</span>
            </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <span class="paid-stamp">✓ PAYÉ</span>
        </div>

        <div class="section">
            <div class="section-title">Informations de paiement</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div>
                    <div class="info-label">Référence de paiement</div>
                    <div class="info-value">${invoiceData.paymentRef}</div>
                </div>
                <div>
                    <div class="info-label">Méthode de paiement</div>
                    <div class="info-value">${invoiceData.paymentMethod}</div>
                </div>
                <div>
                    <div class="info-label">Date de paiement</div>
                    <div class="info-value">${invoiceDate}</div>
                </div>
                <div>
                    <div class="info-label">Statut</div>
                    <div class="info-value" style="color: #22c55e; font-weight: bold;">Payé</div>
                </div>
            </div>
        </div>

        <div class="footer">
            <p><strong>Immo Link Sénégal</strong> - Plateforme immobilière moderne</p>
            <p style="margin-top: 5px;">Contact: contact@immo-link.sn | WhatsApp: +221 XX XXX XX XX</p>
            <p style="margin-top: 10px;">Merci pour votre confiance !</p>
        </div>
    </div>
</body>
</html>
    `

    return new Response(htmlInvoice, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="facture-${subscription.invoice_number}.html"`,
      },
    })

  } catch (error) {
    console.error('💥 Error generating invoice:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})