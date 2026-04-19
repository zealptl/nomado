import type { VercelRequest } from '@vercel/node'
import { createUserClient } from './supabase'

export function getToken(req: VercelRequest): string | null {
  const auth = req.headers['authorization']
  if (typeof auth !== 'string' || !auth.startsWith('Bearer ')) return null
  return auth.slice(7)
}

export async function getAuthenticatedUser(req: VercelRequest) {
  const token = getToken(req)
  if (!token) return { user: null, supabase: null }

  const supabase = createUserClient(token)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return { user: null, supabase: null }

  return { user, supabase }
}
