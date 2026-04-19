import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAuthenticatedUser } from '../../../../lib/auth'

interface ReorderEntry {
  id: string
  position: number
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })

  const { user, supabase } = await getAuthenticatedUser(req)
  if (!user || !supabase) return res.status(401).json({ error: 'Unauthorized' })

  const tripId = req.query.id as string

  const { items } = req.body ?? {}
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items array is required' })
  }

  const entries = items as ReorderEntry[]
  const ids = entries.map((e) => e.id)

  // Verify all items belong to this trip before updating
  const { data: existing, error: fetchError } = await supabase
    .from('itinerary_items')
    .select('id')
    .eq('trip_id', tripId)
    .in('id', ids)

  if (fetchError) return res.status(500).json({ error: fetchError.message })
  if (!existing || existing.length !== ids.length) {
    return res.status(403).json({ error: 'One or more items do not belong to this trip' })
  }

  const updates = await Promise.all(
    entries.map(({ id, position }) =>
      supabase
        .from('itinerary_items')
        .update({ position })
        .eq('id', id)
        .eq('trip_id', tripId)
    )
  )

  const failed = updates.find((r) => r.error)
  if (failed?.error) return res.status(500).json({ error: failed.error.message })

  return res.status(200).json({ ok: true })
}
