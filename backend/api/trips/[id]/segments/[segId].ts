import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createUserClient, supabaseAdmin } from '../../../../lib/supabase'

function getToken(req: VercelRequest): string | null {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = getToken(req)
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const client = createUserClient(token)
  const { data: { user }, error: authError } = await client.auth.getUser()
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

  const tripId = req.query.id as string
  const segId = req.query.segId as string

  // Verify trip exists and user is owner or collaborator
  const { data: trip } = await supabaseAdmin
    .from('trips')
    .select('id, owner_id, start_date, end_date')
    .eq('id', tripId)
    .single()

  if (!trip) return res.status(404).json({ error: 'Trip not found' })

  const isOwner = trip.owner_id === user.id
  if (!isOwner) {
    const { data: collab } = await supabaseAdmin
      .from('trip_collaborators')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()
    if (!collab) return res.status(403).json({ error: 'Forbidden' })
  }

  // Only the owner can modify or delete segments
  if (!isOwner) return res.status(403).json({ error: 'Only the trip owner can modify segments' })

  // Verify the segment belongs to this trip
  const { data: segment } = await supabaseAdmin
    .from('trip_segments')
    .select('id, start_date, end_date')
    .eq('id', segId)
    .eq('trip_id', tripId)
    .single()

  if (!segment) return res.status(404).json({ error: 'Segment not found' })

  if (req.method === 'PATCH') {
    const { title, start_date, end_date } = req.body ?? {}
    const updates: Record<string, string> = {}

    if (title !== undefined) updates.title = title
    if (start_date !== undefined) updates.start_date = start_date
    if (end_date !== undefined) updates.end_date = end_date

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    // Validate dates against trip range if either is being updated
    const newStart = updates.start_date ?? segment.start_date
    const newEnd = updates.end_date ?? segment.end_date

    if (newStart && newEnd) {
      if (newStart < trip.start_date || newEnd > trip.end_date) {
        return res.status(422).json({
          error: 'Segment dates must fall within the trip date range',
          trip_start: trip.start_date,
          trip_end: trip.end_date,
        })
      }
      if (newStart > newEnd) {
        return res.status(422).json({ error: 'start_date must be before or equal to end_date' })
      }
    }

    const { data, error } = await supabaseAdmin
      .from('trip_segments')
      .update(updates)
      .eq('id', segId)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin
      .from('trip_segments')
      .delete()
      .eq('id', segId)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(204).end()
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
