import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';
import { shouldSendEmail, getUserIdByEmail, type EmailPreference } from '../_shared/email-prefs.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const ADMIN_EMAIL = 'immolinksenegal@gmail.com';
const DEFAULT_FROM = 'Immo Link Sénégal <contact@immolinksenegal.com>';


const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const nl = (v: string) => esc(v).replace(/\n/g, '<br/>');

const BodySchema = z.discriminatedUnion('purpose', [
  z.object({
    purpose: z.literal('contact_admin'),
    full_name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().max(40).optional().nullable(),
    subject: z.string().trim().min(1).max(150),
    message: z.string().trim().min(1).max(5000),
  }),
  z.object({
    purpose: z.literal('contact_receipt'),
    full_name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(255),
    subject: z.string().trim().min(1).max(150),
    message: z.string().trim().min(1).max(5000),
  }),
  z.object({
    purpose: z.literal('listing_admin'),
    title: z.string().trim().min(1).max(200),
    type: z.string().trim().max(50),
    price: z.union([z.string(), z.number()]),
    city: z.string().trim().max(100),
    location: z.string().trim().max(200),
    propertyId: z.string().uuid(),
  }),
  z.object({
    purpose: z.literal('listing_receipt'),
    title: z.string().trim().min(1).max(200),
  }),
  z.object({
    purpose: z.literal('admin_reply'),
    to: z.string().trim().email().max(255),
    subject: z.string().trim().min(1).max(255),
    html: z.string().min(1).max(50000),
  }),
]);

type Parsed = z.infer<typeof BodySchema>;

async function getCaller(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return { user: null, isAdmin: false };
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await client.auth.getUser(authHeader.replace('Bearer ', ''));
  if (error || !data?.user) return { user: null, isAdmin: false };
  const { data: roles } = await client
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .eq('role', 'admin')
    .maybeSingle();
  return { user: data.user, isAdmin: !!roles };
}

function compose(p: Parsed, callerEmail: string | null): { to: string; subject: string; html: string; reply_to?: string } | null {
  switch (p.purpose) {
    case 'contact_admin':
      return {
        to: ADMIN_EMAIL,
        subject: `[Contact] ${p.subject}`,
        reply_to: p.email,
        html: `<h2>Nouveau message de contact</h2>
          <p><strong>Nom:</strong> ${esc(p.full_name)}</p>
          <p><strong>Email:</strong> ${esc(p.email)}</p>
          <p><strong>Téléphone:</strong> ${esc(p.phone || '-')}</p>
          <p><strong>Sujet:</strong> ${esc(p.subject)}</p>
          <p><strong>Message:</strong></p><p>${nl(p.message)}</p>`,
      };
    case 'contact_receipt':
      return {
        to: p.email,
        subject: 'Nous avons bien reçu votre message – Immo Link Sénégal',
        html: `<h2>Merci ${esc(p.full_name)} !</h2>
          <p>Nous avons bien reçu votre message et notre équipe vous répondra dans les plus brefs délais.</p>
          <p><strong>Sujet:</strong> ${esc(p.subject)}</p>
          <blockquote style="border-left:3px solid #005A1E;padding-left:12px;color:#555;">${nl(p.message)}</blockquote>
          <p>— L'équipe Immo Link Sénégal</p>`,
      };
    case 'listing_admin':
      return {
        to: ADMIN_EMAIL,
        subject: `[Nouvelle annonce] ${p.title}`,
        html: `<h2>Nouvelle annonce à modérer</h2>
          <p><strong>Titre:</strong> ${esc(p.title)}</p>
          <p><strong>Type:</strong> ${esc(p.type)}</p>
          <p><strong>Prix:</strong> ${esc(p.price)} FCFA</p>
          <p><strong>Ville:</strong> ${esc(p.city)}</p>
          <p><strong>Localisation:</strong> ${esc(p.location)}</p>
          <p><strong>ID:</strong> ${esc(p.propertyId)}</p>`,
      };
    case 'listing_receipt':
      if (!callerEmail) return null;
      return {
        to: callerEmail,
        subject: 'Votre annonce a été soumise – Immo Link Sénégal',
        html: `<h2>Merci pour votre annonce !</h2>
          <p>Votre annonce <strong>${esc(p.title)}</strong> a bien été enregistrée et sera publiée après validation par notre équipe.</p>
          <p>— L'équipe Immo Link Sénégal</p>`,
      };
    case 'admin_reply':
      return {
        to: p.to,
        subject: p.subject,
        html: p.html,
        reply_to: ADMIN_EMAIL,
      };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    if (!RESEND_API_KEY) return json({ error: 'Email service not configured' }, 500);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Invalid request' }, 400);

    const payload = parsed.data;
    const { user, isAdmin } = await getCaller(req);

    // Authorization per purpose
    if (payload.purpose === 'admin_reply' && !isAdmin) return json({ error: 'Forbidden' }, 403);
    if ((payload.purpose === 'listing_admin' || payload.purpose === 'listing_receipt') && !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const mail = compose(payload, user?.email ?? null);
    if (!mail) return json({ error: 'Unable to compose email' }, 400);

    // Envoi conditionnel selon les préférences du destinataire (emails automatiques uniquement)
    const PREF_BY_PURPOSE: Partial<Record<Parsed['purpose'], EmailPreference>> = {
      listing_receipt: 'notification_property_updates',
      contact_receipt: 'notification_account_emails',
    };
    const preference = PREF_BY_PURPOSE[payload.purpose];
    if (preference) {
      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const recipientId =
        payload.purpose === 'listing_receipt'
          ? user?.id ?? null
          : await getUserIdByEmail(admin, mail.to);
      const allowed = await shouldSendEmail(admin, recipientId, preference);
      if (!allowed) return json({ success: true, skipped: 'user_preferences' });
    }


    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: DEFAULT_FROM,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        reply_to: mail.reply_to,
      }),
    });

    const body = await response.text();
    if (!response.ok) {
      console.error(`Resend error [${response.status}]: ${body}`);
      return json({ error: 'Email could not be sent' }, 502);
    }

    return json({ success: true });
  } catch (err) {
    console.error('send-email error:', err);
    return json({ error: 'Unexpected error' }, 500);
  }
});
