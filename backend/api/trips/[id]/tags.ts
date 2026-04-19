import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAuthenticatedUser } from '../../../lib/auth'

const DEFAULT_TAGS = ['food', 'drinks', 'stay', 'activity', 'going out']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { user, supabase } = await getAuthenticatedUser(req)
  if (!user || !supabase) return res.status(401).json({ error: 'Unauthorized' })

  const tripId = req.query.id as string

  if (req.method === 'GET') {
    const { data: customTags, error } = await supabase
      .from('trip_tags')
      .select('id, name')
      .eq('trip_id', tripId)
      .order('name')

    if (error) return res.status(500).json({ error: error.message })

    const defaults = DEFAULT_TAGS.map((name) => ({ id: null, name, isDefault: true }))
    const custom = (customTags ?? []).map((t) => ({ ...t, isDefault: false }))

    return res.status(200).json({ tags: [...defaults, ...custom] })
  }

  if (req.method === 'POST') {
    const { name } = (req.body ?? {}) as { name?: string }
    if (!name?.trim()) return res.status(400).json({ error: 'name is required' })

    const trimmedName = name.trim().toLowerCase()

    if (DEFAULT_TAGS.includes(trimmedName)) {
      return res.status(409).json({ error: 'Tag already exists as a default tag' })
    }

    const { data: existing } = await supabase
      .from('trip_tags')
      .select('id')
      .eq('trip_id', tripId)
      .eq('name', trimmedName)
      .maybeSingle()

    if (existing) return res.status(409).json({ error: 'Tag already exists' })

    const { data: tag, error } = await supabase
      .from('trip_tags')
      .insert({ trip_id: tripId, name: trimmedName })
      .select('id, name')
      .single()

    if (error) return res.status(500).json({ error: error.message })

    return res.status(201).json({ tag: { ...tag, isDefault: false } })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
