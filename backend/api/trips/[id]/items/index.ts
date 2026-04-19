import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAuthenticatedUser } from '../../../../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { user, supabase } = await getAuthenticatedUser(req)
  if (!user || !supabase) return res.status(401).json({ error: 'Unauthorized' })

  const tripId = req.query.id as string

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('itinerary_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('date', { ascending: true })
      .order('position', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })

    const grouped = (data ?? []).reduce<Record<string, typeof data>>((acc, item) => {
      const date = item.date as string
      if (!acc[date]) acc[date] = []
      acc[date]!.push(item)
      return acc
    }, {})

    return res.status(200).json({ items: grouped })
  }

  if (req.method === 'POST') {
    const { date, title, location, maps_url, time_start, time_end, description, tags, position } =
      req.body ?? {}

    if (!date || !title) return res.status(400).json({ error: 'date and title are required' })

    const { data, error } = await supabase
      .from('itinerary_items')
      .insert({ trip_id: tripId, date, title, location, maps_url, time_start, time_end, description, tags, position })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ item: data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
