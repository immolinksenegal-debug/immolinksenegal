import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sha256(value: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const contentType = req.headers.get('content-type') ?? ''
    let body: Record<string, unknown> = {}
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
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const refCommand = String(body.ref_command ?? '')
    const typeEvent = String(body.type_event ?? '')
    if (!refCommand) {
      return new Response(JSON.stringify({ error: 'Référence manquante' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: sub } = await supabase
      .from('pack_subscriptions')
      .select('id, amount, billing, status')
      .eq('payment_ref', refCommand)
      .maybeSingle()

    if (!sub) {
      console.error('Subscription not found for ref', refCommand)
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (typeEvent !== 'sale_complete') {
      await supabase.from('pack_subscriptions').update({ status: 'cancelled' }).eq('id', sub.id)
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const paidAmount = Number(body.item_price ?? 0)
    if (paidAmount && paidAmount < Number(sub.amount)) {
      console.error('Amount mismatch', paidAmount, sub.amount)
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const now = new Date()
    const expires = new Date(now)
    if (sub.billing === 'yearly') expires.setFullYear(expires.getFullYear() + 1)
    else expires.setMonth(expires.getMonth() + 1)

    await supabase
      .from('pack_subscriptions')
      .update({
        status: 'active',
        starts_at: now.toISOString(),
        expires_at: expires.toISOString(),
      })
      .eq('id', sub.id)

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('IPN error', error)
    return new Response(JSON.stringify({ error: 'Erreur' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
