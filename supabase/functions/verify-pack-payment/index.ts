import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sha256(value: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Retire les champs sensibles avant journalisation
function safePayload(body: Record<string, unknown>) {
  const clone: Record<string, unknown> = { ...body }
  delete clone.api_key_sha256
  delete clone.api_secret_sha256
  return clone
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  let body: Record<string, unknown> = {}

  const log = async (
    status: string,
    message: string,
    extra: Record<string, unknown> = {},
  ) => {
    try {
      await supabase.from('payment_webhook_logs').insert({
        provider: 'paytech',
        ref_command: body?.ref_command ? String(body.ref_command) : null,
        event_type: body?.type_event ? String(body.type_event) : null,
        status,
        message,
        payload: safePayload(body),
        ...extra,
      })
    } catch (e) {
      console.error('log insert failed', e)
    }
  }

  try {
    const contentType = req.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      body = await req.json()
    } else {
      const form = await req.formData()
      form.forEach((v, k) => (body[k] = typeof v === 'string' ? v : ''))
    }

    const apiKey = Deno.env.get('PAYTECH_API_KEY')!
    const secretKey = Deno.env.get('PAYTECH_SECRET_KEY')!

    // PayTech IPN authenticity check
    const [expectedKey, expectedSecret] = await Promise.all([sha256(apiKey), sha256(secretKey)])
    if (body.api_key_sha256 !== expectedKey || body.api_secret_sha256 !== expectedSecret) {
      console.error('Invalid IPN credentials')
      await log('unauthorized', 'Signature IPN invalide')
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const refCommand = String(body.ref_command ?? '')
    const typeEvent = String(body.type_event ?? '')
    if (!refCommand) {
      await log('error', 'Référence de commande manquante')
      return new Response(JSON.stringify({ error: 'Référence manquante' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: sub } = await supabase
      .from('pack_subscriptions')
      .select('id, user_id, pack_id, amount, billing, status')
      .eq('payment_ref', refCommand)
      .maybeSingle()

    if (!sub) {
      console.error('Subscription not found for ref', refCommand)
      await log('error', 'Aucune commande ne correspond à cette référence')
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const ctx = { subscription_id: sub.id, user_id: sub.user_id, amount: Number(sub.amount) }

    if (typeEvent !== 'sale_complete') {
      await supabase.from('pack_subscriptions').update({ status: 'cancelled' }).eq('id', sub.id)
      await log('cancelled', `Paiement non finalisé (${typeEvent || 'événement inconnu'})`, ctx)
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const paidAmount = Number(body.item_price ?? 0)
    if (paidAmount && paidAmount < Number(sub.amount)) {
      console.error('Amount mismatch', paidAmount, sub.amount)
      await log('error', `Montant insuffisant : ${paidAmount} reçu pour ${sub.amount} attendu`, ctx)
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (sub.status === 'active') {
      // IPN rejoué : la durée de validité ne doit pas être prolongée deux fois
      await log('duplicate', 'IPN rejoué : abonnement déjà actif, aucune prolongation', ctx)
      return new Response(JSON.stringify({ received: true, alreadyProcessed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const now = new Date()

    // Renouvellement : on prolonge à partir de la fin de l'abonnement en cours
    const { data: current } = await supabase
      .from('pack_subscriptions')
      .select('id, expires_at')
      .eq('user_id', sub.user_id)
      .eq('pack_id', sub.pack_id)
      .eq('status', 'active')
      .gt('expires_at', now.toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const base = current?.expires_at ? new Date(current.expires_at) : now
    const expires = new Date(base)
    if (sub.billing === 'yearly') expires.setFullYear(expires.getFullYear() + 1)
    else expires.setMonth(expires.getMonth() + 1)

    if (current?.id) {
      // L'ancien abonnement est remplacé par le nouveau (durée cumulée)
      await supabase.from('pack_subscriptions').update({ status: 'expired' }).eq('id', current.id)
    }

    const { error: updateError } = await supabase
      .from('pack_subscriptions')
      .update({
        status: 'active',
        starts_at: (current?.expires_at ? new Date(current.expires_at) : now).toISOString(),
        expires_at: expires.toISOString(),
      })
      .eq('id', sub.id)

    if (updateError) {
      console.error('Activation error', updateError)
      await log('error', `Échec d'activation : ${updateError.message}`, ctx)
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await log(
      current?.id ? 'renewed' : 'success',
      `Pack ${sub.pack_id} (${sub.billing}) actif jusqu'au ${expires.toISOString().slice(0, 10)}`,
      ctx,
    )

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('IPN error', error)
    await log('error', error instanceof Error ? error.message : 'Erreur inattendue')
    return new Response(JSON.stringify({ error: 'Erreur' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
