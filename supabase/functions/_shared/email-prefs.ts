// Vérification centralisée des préférences d'emails automatiques d'un utilisateur.
// Toute notification automatique doit passer par shouldSendEmail() avant envoi.

export type EmailPreference =
  | 'notification_account_emails'
  | 'notification_property_updates'
  | 'notification_pack_expiry'
  | 'notification_new_messages'

/**
 * Retourne true si l'utilisateur accepte ce type d'email.
 * - notification_email est l'interrupteur principal : s'il est désactivé, aucun email.
 * - En cas d'absence de profil ou d'erreur, on considère l'envoi autorisé (comportement par défaut opt-in).
 */
// deno-lint-ignore no-explicit-any
export async function shouldSendEmail(
  supabase: any,
  userId: string | null | undefined,
  preference: EmailPreference,
): Promise<boolean> {
  if (!userId) return true

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`notification_email, ${preference}`)
      .eq('id', userId)
      .maybeSingle()

    if (error || !data) return true
    if (data.notification_email === false) return false
    return data[preference] !== false
  } catch (e) {
    console.error('shouldSendEmail failed', e)
    return true
  }
}

/** Résout l'id utilisateur à partir d'une adresse email (auth.users). */
// deno-lint-ignore no-explicit-any
export async function getUserIdByEmail(supabase: any, email: string): Promise<string | null> {
  try {
    const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
    const match = data?.users?.find(
      (u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase(),
    )
    return match?.id ?? null
  } catch (e) {
    console.error('getUserIdByEmail failed', e)
    return null
  }
}
