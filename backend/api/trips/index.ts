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
      .from('trips')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { name, destination, start_date, end_date, cover_image_url } = req.body ?? {};

    if (!name || !destination || !start_date || !end_date) {
      return res.status(400).json({ error: 'name, destination, start_date, and end_date are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('trips')
      .insert({
        owner_id: user.id,
        name,
        destination,
        start_date,
        end_date,
        cover_image_url: cover_image_url ?? null,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
