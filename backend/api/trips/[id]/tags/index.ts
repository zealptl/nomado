import { createUserClient, supabaseAdmin } from '../../../../lib/supabase';
import { getAuthToken } from '../../../../lib/helpers';

const DEFAULT_TAGS = ['food', 'drinks', 'stay', 'activity', 'going out'];

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

    const { data: customTags, error } = await supabaseAdmin
      .from('trip_tags')
      .select('id, name')
      .eq('trip_id', tripId)
      .order('name', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    const defaultItems = DEFAULT_TAGS.map(name => ({ id: null, name, isDefault: true }));
    const customItems = (customTags ?? []).map((t: any) => ({ id: t.id, name: t.name, isDefault: false }));
    return res.status(200).json([...defaultItems, ...customItems]);
  }

  if (req.method === 'POST') {
    const access = await verifyAccess(user.id, tripId);
    if (!access) return res.status(403).json({ error: 'Access denied' });

    const { name } = req.body ?? {};
    if (!name?.trim()) return res.status(400).json({ error: 'name is required' });

    if (DEFAULT_TAGS.includes(name.trim().toLowerCase())) {
      return res.status(400).json({ error: 'This is a default tag and cannot be added again' });
    }

    const { data, error } = await supabaseAdmin
      .from('trip_tags')
      .insert({ trip_id: tripId, name: name.trim() })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ ...data, isDefault: false });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
