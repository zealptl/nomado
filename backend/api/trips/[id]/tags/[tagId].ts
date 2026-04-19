import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAuthenticatedUser } from '../../../../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' })

  const { user, supabase } = await getAuthenticatedUser(req)
  if (!user || !supabase) return res.status(401).json({ error: 'Unauthorized' })

  const { id: tripId, tagId } = req.query as { id: string; tagId: string }

  const { data: tag, error: fetchError } = await supabase
    .from('trip_tags')
    .select('id, name')
    .eq('id', tagId)
    .eq('trip_id', tripId)
    .maybeSingle()

  if (fetchError) return res.status(500).json({ error: fetchError.message })
  if (!tag) return res.status(404).json({ error: 'Tag not found' })

  const { data: referencingItems, error: itemsError } = await supabase
    .from('itinerary_items')
    .select('id')
    .eq('trip_id', tripId)
    .contains('tags', [tag.name])
    .limit(1)

  if (itemsError) return res.status(500).json({ error: itemsError.message })

  if (referencingItems && referencingItems.length > 0) {
    return res.status(409).json({ error: 'Tag is still referenced by one or more items' })
  }

  const { error: deleteError } = await supabase
    .from('trip_tags')
    .delete()
    .eq('id', tagId)
    .eq('trip_id', tripId)

  if (deleteError) return res.status(500).json({ error: deleteError.message })

  return res.status(204).end()
}
