import { createUserClient, supabaseAdmin } from '../../../../../lib/supabase';
import { getAuthToken } from '../../../../../lib/helpers';

async function verifyAccess(userId: string, tripId: string) {
  const { data: trip } = await supabaseAdmin
    .from('trips')
    .select('id, owner_id, start_date, end_date')
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
  const segId = req.query.segId as string;

  const access = await verifyAccess(user.id, tripId);
  if (!access) return res.status(403).json({ error: 'Access denied' });

  if (req.method === 'PATCH') {
    const { title, start_date, end_date } = req.body ?? {};
    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title;
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const trip = access.trip;
    const effectiveStart = updates.start_date ?? undefined;
    const effectiveEnd = updates.end_date ?? undefined;

    if (effectiveStart && effectiveStart < trip.start_date) {
      return res.status(400).json({ error: 'Segment dates must fall within the trip date range' });
    }
    if (effectiveEnd && effectiveEnd > trip.end_date) {
      return res.status(400).json({ error: 'Segment dates must fall within the trip date range' });
    }

    const { data, error } = await supabaseAdmin
      .from('trip_segments')
      .update(updates)
      .eq('id', segId)
      .eq('trip_id', tripId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Segment not found' });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin
      .from('trip_segments')
      .delete()
      .eq('id', segId)
      .eq('trip_id', tripId);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
