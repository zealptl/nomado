import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAuthenticatedUser } from '../../../../lib/auth'
import { supabaseAdmin } from '../../../../lib/supabase'

function storagePathFromUrl(url: string): string | null {
  const match = url.match(/\/object\/public\/[^/]+\/(.+)$/)
  return match ? match[1]! : null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { user, supabase } = await getAuthenticatedUser(req)
  if (!user || !supabase) return res.status(401).json({ error: 'Unauthorized' })

  const tripId = req.query.id as string
  const itemId = req.query.itemId as string

  if (req.method === 'PATCH') {
    const { updated_at, ...fields } = req.body ?? {}

    if (!updated_at) return res.status(400).json({ error: 'updated_at is required' })

    const { data: current, error: fetchError } = await supabase
      .from('itinerary_items')
      .select('updated_at')
      .eq('id', itemId)
      .eq('trip_id', tripId)
      .single()

    if (fetchError || !current) return res.status(404).json({ error: 'Item not found' })

    if (new Date(current.updated_at).toISOString() !== new Date(updated_at).toISOString()) {
      return res.status(409).json({
        error: 'This item was updated by someone else. Please refresh.',
      })
    }

    const { data, error } = await supabase
      .from('itinerary_items')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .eq('trip_id', tripId)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ item: data })
  }

  if (req.method === 'DELETE') {
    const { data: photos } = await supabase
      .from('item_photos')
      .select('storage_url')
      .eq('item_id', itemId)

    const { error } = await supabase
      .from('itinerary_items')
      .delete()
      .eq('id', itemId)
      .eq('trip_id', tripId)

    if (error) return res.status(500).json({ error: error.message })

    if (photos && photos.length > 0) {
      const paths = photos
        .map((p) => storagePathFromUrl(p.storage_url))
        .filter((p): p is string => p !== null)

      if (paths.length > 0) {
        await supabaseAdmin.storage.from('item-photos').remove(paths)
      }
    }

    return res.status(204).end()
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
