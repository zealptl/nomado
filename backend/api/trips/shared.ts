import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAuthenticatedUser } from '../../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { user, supabase } = await getAuthenticatedUser(req)
  if (!user || !supabase) return res.status(401).json({ error: 'Unauthorized' })

  const { data, error } = await supabase
    .from('trip_collaborators')
    .select('trips(*)')
    .eq('user_id', user.id)

  if (error) return res.status(500).json({ error: error.message })

  const trips = (data ?? []).map((row: any) => row.trips).filter(Boolean)
  return res.status(200).json(trips)
}
