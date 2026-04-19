import { createUserClient, supabaseAdmin } from '../../../../lib/supabase';
import { getAuthToken } from '../../../../lib/helpers';

async function verifyAccess(userId: string, tripId: string) {
  const { data: trip } = await supabaseAdmin
    .from('trips')
    .select('id, owner_id')
    .eq('id', tripId)
    .maybeSingle();

  if (!trip) return null;
  if (trip.owner_id === userId) return { isOwner: true };

  const { data: collab } = await supabaseAdmin
    .from('trip_collaborators')
    .select('id')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  if (collab) return { isOwner: false };
  return null;
}

export default async function handler(req: any, res: any) {
  const token = getAuthToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const userClient = createUserClient(token);
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const tripId = req.query.id as string;

  if (req.method === 'GET') {
    const access = await verifyAccess(user.id, tripId);
    if (!access) return res.status(403).json({ error: 'Access denied' });

    const { data, error } = await supabaseAdmin
      .from('itinerary_items')
      .select('*, item_photos(id, storage_url, created_at)')
      .eq('trip_id', tripId)
      .order('date', { ascending: true })
      .order('position', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    // Group by date
    const grouped: Record<string, any[]> = {};
    for (const item of data ?? []) {
      if (!grouped[item.date]) grouped[item.date] = [];
      grouped[item.date].push(item);
    }
    return res.status(200).json(grouped);
  }

  if (req.method === 'POST') {
    const access = await verifyAccess(user.id, tripId);
    if (!access) return res.status(403).json({ error: 'Access denied' });

    const { date, title, location, maps_url, time_start, time_end, description, tags, position } = req.body ?? {};
    if (!date || !title) {
      return res.status(400).json({ error: 'date and title are required' });
    }

    // Compute position: place after the last item on this date
    let pos = position;
    if (pos === undefined) {
      const { data: existing } = await supabaseAdmin
        .from('itinerary_items')
        .select('position')
        .eq('trip_id', tripId)
        .eq('date', date)
        .order('position', { ascending: false })
        .limit(1);
      pos = existing && existing.length > 0 ? existing[0].position + 1.0 : 1.0;
    }

    const { data, error } = await supabaseAdmin
      .from('itinerary_items')
      .insert({
        trip_id: tripId,
        date,
        title,
        location: location ?? null,
        maps_url: maps_url ?? null,
        time_start: time_start ?? null,
        time_end: time_end ?? null,
        description: description ?? null,
        tags: tags ?? [],
        position: pos,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
