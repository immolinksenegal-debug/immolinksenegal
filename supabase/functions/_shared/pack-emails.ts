// Notifications e-mail liées au cycle de vie d'un pack (activation / expiration)

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM = 'Immo Link Sénégal <contact@immolinksenegal.com>'

const PACK_LABELS: Record<string, string> = {
  boost: 'Boost',
  premium: 'Premium',
  agence: 'Agence',
}

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY manquant : notification non envoyée')
    return false
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  })
  if (!res.ok) {
    console.error('Resend error', res.status, await res.text())
    return false
  }
  return true
}

// deno-lint-ignore no-explicit-any
export async function getUserEmail(supabase: any, userId: string): Promise<string | null> {
  try {
    const { data } = await supabase.auth.admin.getUserById(userId)
    return data?.user?.email ?? null
  } catch (e) {
    console.error('getUserEmail failed', e)
    return null
  }
}

export async function sendPackActivatedEmail(opts: {
  to: string
  packId: string
  billing: string
  expiresAt: string
  renewal?: boolean
}) {
  const pack = PACK_LABELS[opts.packId] ?? opts.packId
  const cycle = opts.billing === 'yearly' ? 'annuel' : 'mensuel'
  const subject = opts.renewal
    ? `Votre pack ${pack} a été renouvelé – Immo Link Sénégal`
    : `Votre pack ${pack} est activé – Immo Link Sénégal`
  const html = `
    <div style="font-family:Arial,sans-serif;color:#1a1a1a">
      <h2 style="color:#0B7A3B">Paiement confirmé ✅</h2>
      <p>Bonne nouvelle : votre paiement a bien été reçu et votre pack
        <strong>${esc(pack)}</strong> (abonnement ${esc(cycle)}) est désormais
        <strong>actif</strong>.</p>
      <p><strong>Valide jusqu'au :</strong> ${esc(fmtDate(opts.expiresAt))}</p>
      <p>Vous pouvez suivre votre abonnement depuis votre tableau de bord, onglet « Mes packs ».</p>
      <p style="margin-top:24px">— L'équipe Immo Link Sénégal</p>
    </div>`
  return sendEmail(opts.to, subject, html)
}

export async function sendPackExpiredEmail(opts: {
  to: string
  packId: string
  billing: string
  kind: 'subscription' | 'payment_link'
}) {
  const pack = PACK_LABELS[opts.packId] ?? opts.packId
  const cycle = opts.billing === 'yearly' ? 'annuel' : 'mensuel'
  const isLink = opts.kind === 'payment_link'
  const subject = isLink
    ? `Votre lien de paiement pour le pack ${pack} a expiré`
    : `Votre pack ${pack} est arrivé à expiration`
  const html = `
    <div style="font-family:Arial,sans-serif;color:#1a1a1a">
      <h2 style="color:#D21B1B">${isLink ? 'Lien de paiement expiré' : 'Abonnement expiré'}</h2>
      <p>${
        isLink
          ? `Votre lien de paiement pour le pack <strong>${esc(pack)}</strong> (${esc(cycle)}) n'est plus valable (durée de validité : 30 minutes).`
          : `Votre abonnement au pack <strong>${esc(pack)}</strong> (${esc(cycle)}) est arrivé à échéance.`
      }</p>
      <p>Vous pouvez relancer le paiement en un clic, le pack et la facturation restent identiques :</p>
      <p><a href="https://immolinksenegal.com/checkout?pack=${encodeURIComponent(opts.packId)}&billing=${encodeURIComponent(opts.billing)}"
        style="display:inline-block;background:#0B7A3B;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">
        ${isLink ? 'Relancer le paiement' : 'Renouveler mon pack'}</a></p>
      <p style="margin-top:24px">— L'équipe Immo Link Sénégal</p>
    </div>`
  return sendEmail(opts.to, subject, html)
}
