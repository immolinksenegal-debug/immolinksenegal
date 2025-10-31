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
    const body = await req.json()
    console.log('📥 PayTech IPN received:', JSON.stringify(body, null, 2))

    // Extract payment info from PayTech IPN
    const { 
      ref_command, 
      transaction_id, 
      payment_method,
      custom_field 
    } = body

    if (!ref_command) {
      console.error('❌ Missing ref_command in IPN')
      return new Response(
        JSON.stringify({ error: 'Référence de commande manquante' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse custom field to get propertyId and validate expected amount
    let propertyId: string
    let userId: string
    let plan: string
    let expectedAmount: number
    try {
      const customData = JSON.parse(custom_field)
      propertyId = customData.propertyId
      userId = customData.userId
      plan = customData.plan
      expectedAmount = customData.expectedAmount
    } catch (e) {
      console.error('❌ Failed to parse custom_field:', e)
      return new Response(
        JSON.stringify({ error: 'Données personnalisées invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify payment with PayTech API
    const paytechApiKey = Deno.env.get('PAYTECH_API_KEY')
    const paytechSecretKey = Deno.env.get('PAYTECH_SECRET_KEY')

    console.log('🔍 Verifying payment with PayTech API...')
    const verificationResponse = await fetch(`https://paytech.sn/api/payment/verify/${ref_command}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'API_KEY': paytechApiKey!,
        'API_SECRET': paytechSecretKey!,
      },
    })

    if (!verificationResponse.ok) {
      console.error('❌ PayTech verification failed')
      throw new Error('Échec de la vérification du paiement')
    }

    const paymentStatus = await verificationResponse.json()
    console.log('✅ Payment status:', paymentStatus)

    // Check if payment is successful
    if (paymentStatus.status !== 'success') {
      console.error('❌ Payment not successful:', paymentStatus.status)
      return new Response(
        JSON.stringify({ error: 'Paiement non confirmé' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // SECURITY: Validate payment amount matches expected amount
    const paidAmount = paymentStatus.amount || paymentStatus.item_price
    if (paidAmount && expectedAmount && parseInt(paidAmount) !== expectedAmount) {
      console.error('❌ Payment amount mismatch:', { paidAmount, expectedAmount })
      return new Response(
        JSON.stringify({ error: 'Montant du paiement invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate subscription duration based on plan
    const startsAt = new Date()
    const expiresAt = new Date()
    
    // Monthly = 30 days, Yearly = 365 days
    const durationDays = plan === 'yearly' ? 365 : 30
    expiresAt.setDate(expiresAt.getDate() + durationDays)

    // Fetch property and user data for invoice
    const { data: property } = await supabase
      .from('properties')
      .select('title, price, location, city')
      .eq('id', propertyId)
      .single()

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', userId)
      .single()

    // Prepare invoice data
    const invoiceData = {
      propertyTitle: property?.title || 'Non spécifié',
      propertyLocation: `${property?.city || ''}, ${property?.location || ''}`,
      customerName: profile?.full_name || 'Client',
      customerPhone: profile?.phone || '',
      plan: plan === 'yearly' ? 'Annuel' : 'Mensuel',
      amount: expectedAmount,
      currency: 'FCFA',
      paymentRef: ref_command,
      paymentMethod: payment_method || 'PayTech',
      paidAt: new Date().toISOString(),
    }

    const { error: updateSubError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        invoice_data: invoiceData,
      })
      .eq('payment_ref', ref_command)

    if (updateSubError) {
      console.error('❌ Failed to update subscription:', updateSubError)
      throw updateSubError
    }

    // Update property to premium
    const { error: updatePropError } = await supabase
      .from('properties')
      .update({
        is_premium: true,
        premium_expires_at: expiresAt.toISOString(),
      })
      .eq('id', propertyId)

    if (updatePropError) {
      console.error('❌ Failed to update property:', updatePropError)
      throw updatePropError
    }

    console.log('✅ Property updated to premium status')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Paiement confirmé et propriété mise à jour'
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
