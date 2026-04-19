import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAuthenticatedUser } from '../../lib/auth'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { user, supabase } = await getAuthenticatedUser(req)
  if (!user || !supabase) return res.status(401).json({ error: 'Unauthorized' })

  const tripId = req.query.id as string

  if (req.method === 'GET') {
    const { data: trip, error } = await supabase
      .from('trips')
      .select('*, trip_collaborators(user_id, joined_at)')
      .eq('id', tripId)
      .single()

    if (error || !trip) return res.status(404).json({ error: 'Trip not found' })
    return res.status(200).json(trip)
  }

  if (req.method === 'PATCH') {
    const { data: trip, error: fetchError } = await supabase
      .from('trips')
      .select('owner_id')
      .eq('id', tripId)
      .single()

    if (fetchError || !trip) return res.status(404).json({ error: 'Trip not found' })
    if (trip.owner_id !== user.id) return res.status(403).json({ error: 'Forbidden' })

    const { name, destination, start_date, end_date, cover_image_url } = req.body ?? {}
    const updates: Record<string, unknown> = {}
    if (name !== undefined) updates.name = name
    if (destination !== undefined) updates.destination = destination
    if (start_date !== undefined) updates.start_date = start_date
    if (end_date !== undefined) updates.end_date = end_date
    if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url

    const { data, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', tripId)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const { data: trip, error: fetchError } = await supabase
      .from('trips')
      .select('owner_id')
      .eq('id', tripId)
      .single()

    if (fetchError || !trip) return res.status(404).json({ error: 'Trip not found' })
    if (trip.owner_id !== user.id) return res.status(403).json({ error: 'Forbidden' })

    // Collect item IDs to find associated Storage photos
    const { data: items } = await supabaseAdmin
      .from('itinerary_items')
      .select('id')
      .eq('trip_id', tripId)

    const itemIds = items?.map((i) => i.id) ?? []

    if (itemIds.length > 0) {
      const { data: photos } = await supabaseAdmin
        .from('item_photos')
        .select('storage_url')
        .in('item_id', itemIds)

      if (photos && photos.length > 0) {
        const paths = photos
          .map((p) => {
            try {
              const url = new URL(p.storage_url)
              return url.pathname.split('/object/public/item-photos/')[1] ?? null
            } catch {
              return null
            }
          })
          .filter((p): p is string => p !== null)

        if (paths.length > 0) {
          await supabaseAdmin.storage.from('item-photos').remove(paths)
        }
      }
    }

    // Delete trip — DB cascades: segments, items, item_photos, collaborators, invites
    const { error } = await supabaseAdmin.from('trips').delete().eq('id', tripId)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(204).end()
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
