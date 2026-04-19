import { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { AuthenticatedRequest } from '../types';

export async function verifyTripAccess(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const tripId = req.params.id;

  const { data: trip, error } = await supabaseAdmin
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .maybeSingle();

  if (error) {
    console.error('verifyTripAccess error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }

  if (!trip) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  if (trip.owner_id === req.user.id) {
    req.trip = trip;
    req.isOwner = true;
    next();
    return;
  }

  const { data: collab } = await supabaseAdmin
    .from('trip_collaborators')
    .select('id')
    .eq('trip_id', tripId)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (!collab) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  req.trip = trip;
  req.isOwner = false;
  next();
}

export function requireOwner(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.isOwner) {
    res.status(403).json({ error: 'Only the trip owner can do this' });
    return;
  }
  next();
}
