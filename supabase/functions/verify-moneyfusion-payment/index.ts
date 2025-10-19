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
    console.log('📥 Payment verification request received:', { token, propertyId })

    if (!token || !propertyId) {
      console.error('❌ Missing required parameters:', { token: !!token, propertyId: !!propertyId })
      return new Response(
        JSON.stringify({ error: 'Token et propertyId requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier le statut du paiement avec l'API MoneyFusion
    console.log('🔍 Verifying payment with MoneyFusion API...')
    const verificationResponse = await fetch(
      `https://www.pay.moneyfusion.net/paiementNotif/${token}`
    )

    console.log('📡 MoneyFusion API response status:', verificationResponse.status)

    if (!verificationResponse.ok) {
      console.error('❌ MoneyFusion API error:', verificationResponse.statusText)
      throw new Error('Impossible de vérifier le paiement avec MoneyFusion')
    }

    const paymentData = await verificationResponse.json()
    console.log('✅ Payment data received:', JSON.stringify(paymentData, null, 2))

    // Vérifier que le paiement est réussi et que le montant est correct (6500 FCFA)
    if (paymentData.statut !== true || paymentData.data?.statut !== 'paid') {
      console.error('❌ Payment not confirmed:', {
        statut: paymentData.statut,
        dataStatut: paymentData.data?.statut
      })
      return new Response(
        JSON.stringify({ 
          error: 'Le paiement n\'est pas encore confirmé',
          status: paymentData.data?.statut || 'unknown',
          details: 'Veuillez vérifier que le paiement a bien été effectué'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const amount = parseInt(paymentData.data.Montant) || 0
    console.log('💰 Payment amount:', amount)

    if (amount < 6500) {
      console.error('❌ Insufficient amount:', amount)
      return new Response(
        JSON.stringify({ 
          error: 'Le montant du paiement est insuffisant',
          expected: 6500,
          received: amount
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialiser le client Supabase avec la clé de service
    console.log('🔐 Initializing Supabase client...')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Vérifier que la propriété existe et appartient à l'utilisateur
    const authHeader = req.headers.get('Authorization')!
    const token_user = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token_user)

    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Non autorisé. Veuillez vous reconnecter.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ User authenticated:', user.id)

    console.log('🏠 Checking property ownership...')
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('user_id', user.id)
      .single()

    if (propertyError || !property) {
      console.error('❌ Property not found or unauthorized:', propertyError)
      return new Response(
        JSON.stringify({ 
          error: 'Propriété non trouvée ou vous n\'êtes pas autorisé',
          details: 'Vérifiez que cette annonce vous appartient'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Property found:', property.id)

    // Mettre à jour la propriété pour la rendre premium pendant 30 jours
    const premiumExpiresAt = new Date()
    premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30)

    console.log('📝 Updating property to premium status...')
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        is_premium: true,
        premium_expires_at: premiumExpiresAt.toISOString()
      })
      .eq('id', propertyId)

    if (updateError) {
      console.error('❌ Failed to update property:', updateError)
      throw updateError
    }

    console.log('✅ Property updated successfully to premium status')

    const responseData = {
      success: true,
      message: 'Votre annonce est maintenant premium !',
      expiresAt: premiumExpiresAt.toISOString(),
      paymentInfo: {
        transaction: paymentData.data.numeroTransaction,
        amount: paymentData.data.Montant,
        method: paymentData.data.moyen
      }
    }

    console.log('🎉 Payment verification successful:', responseData)

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Error in payment verification:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    const errorDetails = error instanceof Error ? error.stack : ''
    
    console.error('Error details:', errorDetails)
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Une erreur est survenue lors de la vérification du paiement'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
