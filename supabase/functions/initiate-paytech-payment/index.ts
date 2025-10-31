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
    const { propertyId, plan = 'monthly' } = await req.json()
    
    // SECURITY: Define prices server-side to prevent tampering
    const SUBSCRIPTION_PRICES = {
      monthly: 6500,  // 6,500 FCFA per month
      yearly: 78000   // 78,000 FCFA per year (12 months)
    }
    
    const amount = SUBSCRIPTION_PRICES[plan as keyof typeof SUBSCRIPTION_PRICES]
    
    if (!amount) {
      console.error('❌ Invalid subscription plan')
      return new Response(
        JSON.stringify({ error: 'Formule d\'abonnement invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('📥 Payment initiation request:', { propertyId, plan, amount })

    // Validate propertyId
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!propertyId || !uuidPattern.test(propertyId)) {
      console.error('❌ Invalid propertyId format')
      return new Response(
        JSON.stringify({ error: 'ID de propriété invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    // Verify property ownership
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('user_id', user.id)
      .single()

    if (propertyError || !property) {
      console.error('❌ Property not found or unauthorized')
      return new Response(
        JSON.stringify({ error: 'Propriété non trouvée' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get PayTech credentials
    const paytechApiKey = Deno.env.get('PAYTECH_API_KEY')
    const paytechSecretKey = Deno.env.get('PAYTECH_SECRET_KEY')

    if (!paytechApiKey || !paytechSecretKey) {
      console.error('❌ PayTech credentials not configured')
      return new Response(
        JSON.stringify({ error: 'Configuration PayTech manquante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Construct frontend URL from Supabase URL
    // Convert https://xxx.supabase.co to https://xxx.lovableproject.com
    const frontendUrl = supabaseUrl.replace('.supabase.co', '.lovableproject.com')
    console.log('🌐 Frontend URL:', frontendUrl)
    console.log('🔗 IPN URL:', `${supabaseUrl}/functions/v1/verify-paytech-payment`)

    // Create payment with PayTech
    console.log('🚀 Creating PayTech payment...')
    const planLabel = plan === 'yearly' ? 'Annuel' : 'Mensuel'
    const paytechPayload = {
      item_name: `Abonnement ${planLabel} - ${property.title}`,
      item_price: amount,
      currency: 'XOF',
      ref_command: `PROP_${propertyId}_${Date.now()}`,
      command_name: `Abonnement ${planLabel} #${propertyId.substring(0, 8)}`,
      env: 'prod',
      ipn_url: `${supabaseUrl}/functions/v1/verify-paytech-payment`,
      success_url: `${frontendUrl}/dashboard`,
      cancel_url: `${frontendUrl}/dashboard`,
      custom_field: JSON.stringify({
        propertyId,
        userId: user.id,
        plan,
        expectedAmount: amount,
      }),
    }

    console.log('📦 PayTech payload:', JSON.stringify(paytechPayload, null, 2))

    const paytechResponse = await fetch('https://paytech.sn/api/payment/request-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'API_KEY': paytechApiKey,
        'API_SECRET': paytechSecretKey,
      },
      body: JSON.stringify(paytechPayload),
    })

    if (!paytechResponse.ok) {
      const errorText = await paytechResponse.text()
      console.error('❌ PayTech API error:', errorText)
      throw new Error('Erreur lors de la création du paiement')
    }

    const paymentData = await paytechResponse.json()
    console.log('✅ PayTech payment created:', paymentData)

    // Create subscription record with plan information
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        property_id: propertyId,
        subscription_type: 'premium',
        plan,
        amount,
        currency: 'XOF',
        status: 'pending',
        payment_token: paymentData.token,
        payment_ref: paymentData.ref_command,
      })

    if (subscriptionError) {
      console.error('❌ Failed to create subscription:', subscriptionError)
      throw subscriptionError
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: paymentData.redirect_url,
        token: paymentData.token,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
