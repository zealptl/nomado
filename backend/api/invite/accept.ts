import jwt from 'jsonwebtoken';
import { createUserClient, supabaseAdmin } from '../../lib/supabase';
import { getAuthToken } from '../../lib/helpers';

const JWT_SECRET = process.env.INVITE_JWT_SECRET!;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = getAuthToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const userClient = createUserClient(token);
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { invite_token } = req.body ?? {};
  if (!invite_token) return res.status(400).json({ error: 'invite_token is required' });

  let payload: { tripId: string };
  try {
    payload = jwt.verify(invite_token, JWT_SECRET) as { tripId: string };
  } catch {
    return res.status(400).json({ error: 'Invite link has expired. Ask the trip owner to share a new one.' });
  }

  const { tripId } = payload;

  // Verify token exists in DB and is not expired
  const { data: invite } = await supabaseAdmin
    .from('trip_invites')
    .select('expires_at')
    .eq('trip_id', tripId)
    .eq('token', invite_token)
    .maybeSingle();

  if (!invite) {
    return res.status(400).json({ error: 'Invite link has expired. Ask the trip owner to share a new one.' });
  }
  if (new Date(invite.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Invite link has expired. Ask the trip owner to share a new one.' });
  }

  // Check if user is already the owner
  const { data: trip } = await supabaseAdmin
    .from('trips')
    .select('owner_id')
    .eq('id', tripId)
    .maybeSingle();

  if (trip?.owner_id === user.id) {
    return res.status(200).json({ tripId, alreadyMember: true });
  }

  // Idempotent upsert into trip_collaborators
  const { data: existing } = await supabaseAdmin
    .from('trip_collaborators')
    .select('id')
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existing) {
    await supabaseAdmin
      .from('trip_collaborators')
      .insert({ trip_id: tripId, user_id: user.id });
  }

  return res.status(200).json({ tripId });
}
