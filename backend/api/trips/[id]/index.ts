import { createUserClient, supabaseAdmin } from '../../../lib/supabase';
import { getAuthToken } from '../../../lib/helpers';

async function verifyAccess(
  userId: string,
  tripId: string,
): Promise<{ trip: any; isOwner: boolean } | null> {
  const { data: trip } = await supabaseAdmin
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .maybeSingle();

  if (!trip) return null;
  if (trip.owner_id === userId) return { trip, isOwner: true };

  const { data: collab } = await supabaseAdmin
    .from('trip_collaborators')
    .select('id')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  if (collab) return { trip, isOwner: false };
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
    return res.status(200).json(access.trip);
  }

  if (req.method === 'PATCH') {
    const access = await verifyAccess(user.id, tripId);
    if (!access) return res.status(403).json({ error: 'Access denied' });
    if (!access.isOwner) return res.status(403).json({ error: 'Only the trip owner can update this trip' });

    const { name, destination, start_date, end_date, cover_image_url } = req.body ?? {};
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (destination !== undefined) updates.destination = destination;
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;
    if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data, error } = await supabaseAdmin
      .from('trips')
      .update(updates)
      .eq('id', tripId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const access = await verifyAccess(user.id, tripId);
    if (!access) return res.status(403).json({ error: 'Access denied' });
    if (!access.isOwner) return res.status(403).json({ error: 'Only the trip owner can delete this trip' });

    // Collect item IDs to cascade-delete photos
    const { data: items } = await supabaseAdmin
      .from('itinerary_items')
      .select('id')
      .eq('trip_id', tripId);

    const itemIds = (items ?? []).map((i: any) => i.id as string);

    // Delete item photos from Storage
    if (itemIds.length > 0) {
      const { data: photos } = await supabaseAdmin
        .from('item_photos')
        .select('storage_url')
        .in('item_id', itemIds);

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

      await supabaseAdmin.from('item_photos').delete().in('item_id', itemIds);
    }

    // Delete cover image from Storage
    if (access.trip.cover_image_url) {
      const url = access.trip.cover_image_url as string;
      const marker = '/trip-covers/';
      const idx = url.indexOf(marker);
      if (idx !== -1) {
        const path = url.slice(idx + marker.length);
        await supabaseAdmin.storage.from('trip-covers').remove([path]);
      }
    }

    // Cascade delete related records
    await supabaseAdmin.from('itinerary_items').delete().eq('trip_id', tripId);
    await supabaseAdmin.from('trip_segments').delete().eq('trip_id', tripId);
    await supabaseAdmin.from('trip_collaborators').delete().eq('trip_id', tripId);
    await supabaseAdmin.from('trip_invites').delete().eq('trip_id', tripId);
    await supabaseAdmin.from('trip_tags').delete().eq('trip_id', tripId);

    const { error } = await supabaseAdmin.from('trips').delete().eq('id', tripId);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
