import { createUserClient, supabaseAdmin } from '../../../../lib/supabase';
import { getAuthToken } from '../../../../lib/helpers';

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

  if (req.method === 'GET') {
    const access = await verifyAccess(user.id, tripId);
    if (!access) return res.status(403).json({ error: 'Access denied' });

    const { data, error } = await supabaseAdmin
      .from('trip_segments')
      .select('*')
      .eq('trip_id', tripId)
      .order('start_date', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const access = await verifyAccess(user.id, tripId);
    if (!access) return res.status(403).json({ error: 'Access denied' });

    const { title, start_date, end_date } = req.body ?? {};
    if (!title || !start_date || !end_date) {
      return res.status(400).json({ error: 'title, start_date, and end_date are required' });
    }

    const trip = access.trip;
    if (start_date < trip.start_date || end_date > trip.end_date) {
      return res.status(400).json({ error: 'Segment dates must fall within the trip date range' });
    }
    if (end_date < start_date) {
      return res.status(400).json({ error: 'end_date must be on or after start_date' });
    }

    const { data, error } = await supabaseAdmin
      .from('trip_segments')
      .insert({ trip_id: tripId, title, start_date, end_date })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
