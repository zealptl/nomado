import { createUserClient } from '../../../../lib/supabase'

function getBearerToken(req: any): string | null {
  const auth = req.headers['authorization'] as string | undefined
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' })

  const token = getBearerToken(req)
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const client = createUserClient(token)
  const { id: tripId, tagId } = req.query as { id: string; tagId: string }

  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { data: tag, error: fetchError } = await client
    .from('trip_tags')
    .select('id, name')
    .eq('id', tagId)
    .eq('trip_id', tripId)
    .maybeSingle()

  if (fetchError) return res.status(500).json({ error: fetchError.message })
  if (!tag) return res.status(404).json({ error: 'Tag not found' })

  const { data: referencingItems, error: itemsError } = await client
    .from('itinerary_items')
    .select('id')
    .eq('trip_id', tripId)
    .contains('tags', [tag.name])
    .limit(1)

  if (itemsError) return res.status(500).json({ error: itemsError.message })

  if (referencingItems && referencingItems.length > 0) {
    return res.status(409).json({ error: 'Tag is still referenced by one or more items' })
  }

  const { error: deleteError } = await client
    .from('trip_tags')
    .delete()
    .eq('id', tagId)
    .eq('trip_id', tripId)

  if (deleteError) return res.status(500).json({ error: deleteError.message })

  return res.status(204).end()
}
