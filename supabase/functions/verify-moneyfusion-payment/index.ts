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
    const { token, propertyId } = await req.json()

    if (!token || !propertyId) {
      return new Response(
        JSON.stringify({ error: 'Token et propertyId requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier le statut du paiement avec l'API MoneyFusion
    const verificationResponse = await fetch(
      `https://www.pay.moneyfusion.net/paiementNotif/${token}`
    )

    if (!verificationResponse.ok) {
      throw new Error('Impossible de vérifier le paiement')
    }

    const paymentData = await verificationResponse.json()

    // Vérifier que le paiement est réussi et que le montant est correct (6500 FCFA)
    if (paymentData.statut !== true || paymentData.data?.statut !== 'paid') {
      return new Response(
        JSON.stringify({ 
          error: 'Le paiement n\'est pas encore confirmé',
          status: paymentData.data?.statut || 'unknown'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (paymentData.data.Montant < 6500) {
      return new Response(
        JSON.stringify({ error: 'Le montant du paiement est insuffisant' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialiser le client Supabase avec la clé de service
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Vérifier que la propriété existe et appartient à l'utilisateur
    const authHeader = req.headers.get('Authorization')!
    const token_user = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token_user)

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('user_id', user.id)
      .single()

    if (propertyError || !property) {
      return new Response(
        JSON.stringify({ error: 'Propriété non trouvée' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mettre à jour la propriété pour la rendre premium pendant 30 jours
    const premiumExpiresAt = new Date()
    premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30)

    const { error: updateError } = await supabase
      .from('properties')
      .update({
        is_premium: true,
        premium_expires_at: premiumExpiresAt.toISOString()
      })
      .eq('id', propertyId)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Votre annonce est maintenant premium !',
        expiresAt: premiumExpiresAt.toISOString(),
        paymentInfo: {
          transaction: paymentData.data.numeroTransaction,
          amount: paymentData.data.Montant,
          method: paymentData.data.moyen
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
