import { createUserClient, supabaseAdmin } from '../../../../lib/supabase';
import { getAuthToken } from '../../../../lib/helpers';

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
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const token = getAuthToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const userClient = createUserClient(token);
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const tripId = req.query.id as string;
  const access = await verifyAccess(user.id, tripId);
  if (!access) return res.status(403).json({ error: 'Access denied' });

  const { items } = req.body ?? {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items array is required' });
  }

  // Update each item's position — done sequentially to avoid partial failures
  for (const { id, position } of items) {
    if (!id || typeof position !== 'number') continue;
    await supabaseAdmin
      .from('itinerary_items')
      .update({ position })
      .eq('id', id)
      .eq('trip_id', tripId);
  }

  return res.status(200).json({ ok: true });
}
