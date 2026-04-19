import { Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { AuthenticatedRequest } from '../types';

export async function getSharedTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('trip_collaborators')
    .select('trip_id, trips(*)')
    .eq('user_id', req.user.id)
    .order('joined_at', { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }
  const trips = (data ?? []).map((row: { trips: unknown }) => row.trips).filter(Boolean);
  res.status(200).json(trips);
}
