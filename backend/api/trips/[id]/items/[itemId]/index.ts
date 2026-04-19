import { createUserClient, supabaseAdmin } from '../../../../../lib/supabase';
import { getAuthToken } from '../../../../../lib/helpers';

async function verifyAccess(userId: string, tripId: string) {
  const { data: trip } = await supabaseAdmin
    .from('trips')
    .select('id, owner_id')
    .eq('id', tripId)
    .maybeSingle();

  if (!trip) return null;
  if (trip.owner_id === userId) return true;

  const { data: collab } = await supabaseAdmin
    .from('trip_collaborators')
    .select('id')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  return collab ? true : null;
}

export default async function handler(req: any, res: any) {
  const token = getAuthToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const userClient = createUserClient(token);
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const tripId = req.query.id as string;
  const itemId = req.query.itemId as string;

  const access = await verifyAccess(user.id, tripId);
  if (!access) return res.status(403).json({ error: 'Access denied' });

  if (req.method === 'PATCH') {
    const { updated_at, ...fields } = req.body ?? {};
    if (!updated_at) {
      return res.status(400).json({ error: 'updated_at is required for optimistic concurrency' });
    }

    // Check for stale write
    const { data: current } = await supabaseAdmin
      .from('itinerary_items')
      .select('updated_at')
      .eq('id', itemId)
      .eq('trip_id', tripId)
      .maybeSingle();

    if (!current) return res.status(404).json({ error: 'Item not found' });

    const storedAt = new Date(current.updated_at).getTime();
    const clientAt = new Date(updated_at).getTime();
    if (storedAt > clientAt) {
      return res.status(409).json({ error: 'This item was updated by someone else. Please refresh.' });
    }

    const allowed = ['title', 'location', 'maps_url', 'time_start', 'time_end', 'description', 'tags', 'position', 'date'];
    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (key in fields) updates[key] = fields[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided' });
    }

    const { data, error } = await supabaseAdmin
      .from('itinerary_items')
      .update(updates)
      .eq('id', itemId)
      .eq('trip_id', tripId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    // Delete associated photos from Storage first
    const { data: photos } = await supabaseAdmin
      .from('item_photos')
      .select('storage_url')
      .eq('item_id', itemId);

    const photoPaths = (photos ?? [])
      .map((p: any) => {
        const url = p.storage_url as string;
        const marker = '/item-photos/';
        const idx = url.indexOf(marker);
        return idx !== -1 ? url.slice(idx + marker.length) : null;
      })
      .filter(Boolean) as string[];

    if (photoPaths.length > 0) {
      await supabaseAdmin.storage.from('item-photos').remove(photoPaths);
    }

    await supabaseAdmin.from('item_photos').delete().eq('item_id', itemId);

    const { error } = await supabaseAdmin
      .from('itinerary_items')
      .delete()
      .eq('id', itemId)
      .eq('trip_id', tripId);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
