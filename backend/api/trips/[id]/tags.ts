import { createUserClient } from '../../../lib/supabase'

const DEFAULT_TAGS = ['food', 'drinks', 'stay', 'activity', 'going out']

function getBearerToken(req: any): string | null {
  const auth = req.headers['authorization'] as string | undefined
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

export default async function handler(req: any, res: any) {
  const token = getBearerToken(req)
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const client = createUserClient(token)
  const tripId = req.query.id as string

  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    const { data: customTags, error } = await client
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
    const { name } = req.body ?? {}
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required' })
    }

    const trimmedName = name.trim().toLowerCase()

    if (DEFAULT_TAGS.includes(trimmedName)) {
      return res.status(409).json({ error: 'Tag already exists as a default tag' })
    }

    const { data: existing } = await client
      .from('trip_tags')
      .select('id')
      .eq('trip_id', tripId)
      .eq('name', trimmedName)
      .maybeSingle()

    if (existing) return res.status(409).json({ error: 'Tag already exists' })

    const { data: tag, error } = await client
      .from('trip_tags')
      .insert({ trip_id: tripId, name: trimmedName })
      .select('id, name')
      .single()

    if (error) return res.status(500).json({ error: error.message })

    return res.status(201).json({ tag: { ...tag, isDefault: false } })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
