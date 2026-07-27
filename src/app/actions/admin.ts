'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function adminUpdateUser(userId: string, email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, { email })
  if (error) return { error: error.message }
  return { success: true }
}

export async function adminResetPassword(email: string) {
  const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(email)
  if (error) return { error: error.message }
  return { success: true }
}
