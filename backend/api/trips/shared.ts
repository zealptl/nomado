import { createUserClient, supabaseAdmin } from '../../lib/supabase';
import { getAuthToken } from '../../lib/helpers';

export default async function handler(req: any, res: any) {
  const token = getAuthToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const userClient = createUserClient(token);
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('trip_collaborators')
      .select('trip_id, trips(*)')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    const trips = (data ?? []).map((row: any) => row.trips).filter(Boolean);
    return res.status(200).json(trips);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
