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

  // Verify user is owner or collaborator
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

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('trip_segments')
      .select('*')
      .eq('trip_id', tripId)
      .order('start_date', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    if (!isOwner) return res.status(403).json({ error: 'Only the trip owner can create segments' })

    const { title, start_date, end_date } = req.body ?? {}
    if (!title || !start_date || !end_date) {
      return res.status(400).json({ error: 'title, start_date, and end_date are required' })
    }

    if (start_date < trip.start_date || end_date > trip.end_date) {
      return res.status(422).json({
        error: 'Segment dates must fall within the trip date range',
        trip_start: trip.start_date,
        trip_end: trip.end_date,
      })
    }

    if (start_date > end_date) {
      return res.status(422).json({ error: 'start_date must be before or equal to end_date' })
    }

    const { data, error } = await supabaseAdmin
      .from('trip_segments')
      .insert({ trip_id: tripId, title, start_date, end_date })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
