import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// SECURITY: prices are defined server-side only
const PACKS: Record<string, { name: string; monthly: number; yearly: number }> = {
  boost: { name: 'Boost', monthly: 12000, yearly: 120000 },
  premium: { name: 'Premium', monthly: 25000, yearly: 250000 },
  agence: { name: 'Agence', monthly: 25000, yearly: 250000 },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const packId = String(body?.packId ?? '')
    const billing = body?.billing === 'yearly' ? 'yearly' : 'monthly'
    const origin = typeof body?.origin === 'string' && /^https?:\/\//.test(body.origin)
      ? body.origin.replace(/\/$/, '')
      : null

    const pack = PACKS[packId]
    if (!pack) {
      return new Response(JSON.stringify({ error: 'Pack invalide' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Connectez-vous pour souscrire' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Connectez-vous pour souscrire' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const paytechApiKey = Deno.env.get('PAYTECH_API_KEY')
    const paytechSecretKey = Deno.env.get('PAYTECH_SECRET_KEY')
    if (!paytechApiKey || !paytechSecretKey) {
      return new Response(JSON.stringify({ error: 'Configuration de paiement manquante' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Expire les paiements périmés / abonnements échus avant toute décision
    await supabase.rpc('expire_old_pack_subscriptions')

    const amount = billing === 'yearly' ? pack.yearly : pack.monthly
    const mode = body?.mode === 'status' ? 'status' : 'start'
    const forceNew = body?.forceNew === true

    const json = (payload: unknown, status = 200) =>
      new Response(JSON.stringify(payload), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    // Abonnement déjà actif pour ce pack ?
    const { data: activeSub } = await supabase
      .from('pack_subscriptions')
      .select('expires_at')
      .eq('user_id', user.id)
      .eq('pack_id', packId)
      .eq('status', 'active')
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

    // Paiement en attente encore valable (< 30 min)
    const { data: recentPending } = await supabase
      .from('pack_subscriptions')
      .select('payment_url, payment_token, created_at')
      .eq('user_id', user.id)
      .eq('pack_id', packId)
      .eq('billing', billing)
      .eq('status', 'pending')
      .gte('created_at', thirtyMinAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Dernier paiement expiré (lien périmé) pour ce pack/billing
    const { data: lastExpired } = await supabase
      .from('pack_subscriptions')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('pack_id', packId)
      .eq('billing', billing)
      .eq('status', 'expired')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const state = activeSub
      ? 'active'
      : recentPending
        ? 'pending'
        : lastExpired
          ? 'expired'
          : 'none'

    if (mode === 'status') {
      return json({
        success: true,
        state,
        expiresAt: activeSub?.expires_at ?? null,
        paymentUrl: recentPending?.payment_url ?? null,
        pendingSince: recentPending?.created_at ?? null,
      })
    }

    // IDEMPOTENCE: une même intention d'achat ne doit créer qu'une seule commande.
    const rawKey = typeof body?.idempotencyKey === 'string' ? body.idempotencyKey.trim() : ''
    const clientKey = /^[A-Za-z0-9_-]{8,80}$/.test(rawKey) ? rawKey : ''
    let idempotencyKey = `${user.id}:${packId}:${billing}:${clientKey || 'default'}`

    // 1) Même clé déjà utilisée -> lien existant si toujours en attente,
    //    sinon rotation de la clé pour relancer un nouveau lien (pack/billing inchangés).
    const { data: existingByKey } = await supabase
      .from('pack_subscriptions')
      .select('payment_url, payment_token, status')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()

    if (existingByKey && (existingByKey.status !== 'pending' || forceNew)) {
      idempotencyKey = `${idempotencyKey}:${Date.now()}`
    } else if (existingByKey?.payment_url && existingByKey.status === 'pending') {
      return json({
        success: true,
        reused: true,
        state: 'pending',
        paymentUrl: existingByKey.payment_url,
        token: existingByKey.payment_token,
      })
    }

    if (recentPending?.payment_url && !forceNew) {
      return json({
        success: true,
        reused: true,
        state: 'pending',
        paymentUrl: recentPending.payment_url,
        token: recentPending.payment_token,
      })
    }

    // Relance manuelle: on clôture les liens en attente devenus inutiles
    if (forceNew) {
      await supabase
        .from('pack_subscriptions')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('pack_id', packId)
        .eq('billing', billing)
        .eq('status', 'pending')
    }


    const refCommand = `PACK_${packId}_${user.id.substring(0, 8)}_${Date.now()}`
    const frontendUrl = origin ?? 'https://immolinksenegal.com'

    const paytechResponse = await fetch('https://paytech.sn/api/payment/request-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        API_KEY: paytechApiKey,
        API_SECRET: paytechSecretKey,
      },
      body: JSON.stringify({
        item_name: `Pack ${pack.name} (${billing === 'yearly' ? 'Annuel' : 'Mensuel'})`,
        item_price: amount,
        currency: 'XOF',
        ref_command: refCommand,
        command_name: `Pack ${pack.name}`,
        env: 'prod',
        ipn_url: `${supabaseUrl}/functions/v1/verify-pack-payment`,
        success_url: `${frontendUrl}/dashboard?pack=success`,
        cancel_url: `${frontendUrl}/?pack=cancel`,
        custom_field: JSON.stringify({ userId: user.id, packId, billing, expectedAmount: amount }),
      }),
    })

    const paymentData = await paytechResponse.json().catch(() => null)
    if (!paytechResponse.ok || !paymentData?.redirect_url) {
      console.error('PayTech error', paytechResponse.status, JSON.stringify(paymentData))
      return new Response(JSON.stringify({ error: 'Impossible de créer le paiement' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { error: insertError } = await supabase.from('pack_subscriptions').insert({
      user_id: user.id,
      pack_id: packId,
      billing,
      amount,
      currency: 'XOF',
      status: 'pending',
      payment_token: paymentData.token,
      payment_ref: refCommand,
      payment_url: paymentData.redirect_url,
      idempotency_key: idempotencyKey,
    })
    if (insertError) {
      // 23505 = clé d'idempotence déjà présente (double appel concurrent)
      if ((insertError as { code?: string }).code === '23505') {
        const { data: winner } = await supabase
          .from('pack_subscriptions')
          .select('payment_url, payment_token')
          .eq('idempotency_key', idempotencyKey)
          .maybeSingle()
        if (winner?.payment_url) {
          return new Response(
            JSON.stringify({ success: true, reused: true, paymentUrl: winner.payment_url, token: winner.payment_token }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          )
        }
      } else {
        console.error('Insert error', insertError)
      }
    }

    return new Response(
      JSON.stringify({ success: true, paymentUrl: paymentData.redirect_url, token: paymentData.token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error', error)
    return new Response(JSON.stringify({ error: 'Erreur inattendue' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
