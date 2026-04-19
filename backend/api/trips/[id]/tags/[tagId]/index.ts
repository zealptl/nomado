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
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const token = getAuthToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const userClient = createUserClient(token);
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const tripId = req.query.id as string;
  const tagId = req.query.tagId as string;

  const access = await verifyAccess(user.id, tripId);
  if (!access) return res.status(403).json({ error: 'Access denied' });

  // Fetch tag name to check if any items reference it
  const { data: tag } = await supabaseAdmin
    .from('trip_tags')
    .select('name')
    .eq('id', tagId)
    .eq('trip_id', tripId)
    .maybeSingle();

  if (!tag) return res.status(404).json({ error: 'Tag not found' });

  // Check if any items use this tag
  const { data: itemsUsingTag } = await supabaseAdmin
    .from('itinerary_items')
    .select('id')
    .eq('trip_id', tripId)
    .contains('tags', [tag.name])
    .limit(1);

  if (itemsUsingTag && itemsUsingTag.length > 0) {
    return res.status(400).json({ error: 'Cannot delete a tag that is used by one or more items' });
  }

  const { error } = await supabaseAdmin
    .from('trip_tags')
    .delete()
    .eq('id', tagId)
    .eq('trip_id', tripId);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).end();
}
