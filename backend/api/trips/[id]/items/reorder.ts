import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createUserClient } from '../../../../lib/supabase'

function getToken(req: VercelRequest): string | null {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

interface ReorderEntry {
  id: string
  position: number
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })

  const token = getToken(req)
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const supabase = createUserClient(token)
  const tripId = req.query.id as string

  const { items } = req.body ?? {}
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items array is required' })
  }

  const entries = items as ReorderEntry[]

  // Validate all items belong to this trip before updating
  const ids = entries.map((e) => e.id)
  const { data: existing, error: fetchError } = await supabase
    .from('itinerary_items')
    .select('id')
    .eq('trip_id', tripId)
    .in('id', ids)

  if (fetchError) return res.status(500).json({ error: fetchError.message })
  if (!existing || existing.length !== ids.length) {
    return res.status(403).json({ error: 'One or more items do not belong to this trip' })
  }

  // Update positions sequentially (Supabase JS client has no multi-row update in one call)
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
