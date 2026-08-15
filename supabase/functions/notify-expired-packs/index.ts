import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { getUserEmail, sendPackExpiredEmail } from '../_shared/pack-emails.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    // 1) Bascule les abonnements/liens périmés
    await supabase.rpc('expire_old_pack_subscriptions')

    // 2) Notifie une seule fois chaque expiration
    const { data: rows, error } = await supabase
      .from('pack_subscriptions')
      .select('id, user_id, pack_id, billing, starts_at')
      .eq('status', 'expired')
      .is('notified_expired_at', null)
      .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(50)

    if (error) return json({ error: error.message }, 500)

    let sent = 0
    for (const row of rows ?? []) {
      const email = await getUserEmail(supabase, row.user_id)
      const stamp = new Date().toISOString()
      if (email) {
        const ok = await sendPackExpiredEmail({
          to: email,
          packId: row.pack_id,
          billing: row.billing,
          // Un abonnement jamais démarré = lien de paiement périmé
          kind: row.starts_at ? 'subscription' : 'payment_link',
        })
        if (ok) sent++
      }
      await supabase
        .from('pack_subscriptions')
        .update({ notified_expired_at: stamp })
        .eq('id', row.id)

      await supabase.from('payment_webhook_logs').insert({
        provider: 'paytech',
        status: 'expired',
        message: email
          ? `Notification d'expiration envoyée (${row.pack_id}/${row.billing})`
          : `Expiration détectée mais aucun email trouvé (${row.pack_id}/${row.billing})`,
        subscription_id: row.id,
        user_id: row.user_id,
      })
    }

    return json({ success: true, processed: rows?.length ?? 0, sent })
  } catch (err) {
    console.error('notify-expired-packs error', err)
    return json({ error: 'Erreur inattendue' }, 500)
  }
})
