import jwt from 'jsonwebtoken';
import { createUserClient, supabaseAdmin } from '../../../../lib/supabase';
import { getAuthToken } from '../../../../lib/helpers';

const JWT_SECRET = process.env.INVITE_JWT_SECRET!;
const INVITE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

async function verifyOwner(userId: string, tripId: string) {
  const { data: trip } = await supabaseAdmin
    .from('trips')
    .select('id')
    .eq('id', tripId)
    .eq('owner_id', userId)
    .maybeSingle();
  return !!trip;
}

function buildInviteUrl(req: any, token: string): string {
  const proto = req.headers['x-forwarded-proto'] ?? 'https';
  const host = req.headers['x-forwarded-host'] ?? req.headers['host'];
  return `${proto}://${host}/invite/${token}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = getAuthToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const userClient = createUserClient(token);
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const tripId = req.query.id as string;
  const isOwner = await verifyOwner(user.id, tripId);
  if (!isOwner) return res.status(403).json({ error: 'Only the trip owner can generate invite links' });

  const expiresAt = new Date(Date.now() + INVITE_TTL_SECONDS * 1000);
  const inviteToken = jwt.sign({ tripId }, JWT_SECRET, { expiresIn: INVITE_TTL_SECONDS });

  await supabaseAdmin
    .from('trip_invites')
    .delete()
    .eq('trip_id', tripId);

  const { error } = await supabaseAdmin
    .from('trip_invites')
    .insert({ trip_id: tripId, token: inviteToken, expires_at: expiresAt.toISOString() });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ token: inviteToken, url: buildInviteUrl(req, inviteToken) });
}
