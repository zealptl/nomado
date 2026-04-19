import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { supabaseAdmin, createUserClient } from '../lib/supabase';
import { getAuthToken } from '../lib/helpers';
import { AuthenticatedRequest } from '../types';

const JWT_SECRET = process.env.INVITE_JWT_SECRET!;
const INVITE_TTL_SECONDS = 7 * 24 * 60 * 60;

function buildInviteUrl(req: Request, token: string): string {
  const proto = req.headers['x-forwarded-proto'] ?? 'https';
  const host = req.headers['x-forwarded-host'] ?? req.headers['host'];
  return `${proto}://${host}/invite/${token}`;
}

export async function generateInvite(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tripId = req.params.id;
  const expiresAt = new Date(Date.now() + INVITE_TTL_SECONDS * 1000);
  const inviteToken = jwt.sign({ tripId }, JWT_SECRET, { expiresIn: INVITE_TTL_SECONDS });

  await supabaseAdmin.from('trip_invites').delete().eq('trip_id', tripId);

  const { error } = await supabaseAdmin
    .from('trip_invites')
    .insert({ trip_id: tripId, token: inviteToken, expires_at: expiresAt.toISOString() });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(200).json({ token: inviteToken, url: buildInviteUrl(req, inviteToken) });
}

export async function refreshInvite(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tripId = req.params.id;
  const expiresAt = new Date(Date.now() + INVITE_TTL_SECONDS * 1000);
  const newToken = jwt.sign({ tripId }, JWT_SECRET, { expiresIn: INVITE_TTL_SECONDS });

  await supabaseAdmin.from('trip_invites').delete().eq('trip_id', tripId);

  const { error } = await supabaseAdmin
    .from('trip_invites')
    .insert({ trip_id: tripId, token: newToken, expires_at: expiresAt.toISOString() });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(200).json({ token: newToken, url: buildInviteUrl(req, newToken) });
}

export async function acceptInvite(req: Request, res: Response): Promise<void> {
  const token = getAuthToken(req);
  if (!token) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const userClient = createUserClient(token);
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const { invite_token } = req.body ?? {};
  if (!invite_token) { res.status(400).json({ error: 'invite_token is required' }); return; }

  let payload: { tripId: string };
  try {
    payload = jwt.verify(invite_token, JWT_SECRET) as { tripId: string };
  } catch {
    res.status(400).json({ error: 'Invite link has expired. Ask the trip owner to share a new one.' });
    return;
  }

  const { tripId } = payload;

  const { data: invite } = await supabaseAdmin
    .from('trip_invites')
    .select('expires_at')
    .eq('trip_id', tripId)
    .eq('token', invite_token)
    .maybeSingle();

  if (!invite) {
    res.status(400).json({ error: 'Invite link has expired. Ask the trip owner to share a new one.' });
    return;
  }
  if (new Date(invite.expires_at) < new Date()) {
    res.status(400).json({ error: 'Invite link has expired. Ask the trip owner to share a new one.' });
    return;
  }

  const { data: trip } = await supabaseAdmin
    .from('trips')
    .select('owner_id')
    .eq('id', tripId)
    .maybeSingle();

  if (trip?.owner_id === user.id) {
    res.status(200).json({ tripId, alreadyMember: true });
    return;
  }

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

  res.status(200).json({ tripId });
}
