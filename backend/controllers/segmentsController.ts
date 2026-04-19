import { Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { AuthenticatedRequest } from '../types';

export async function listSegments(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tripId = req.params.id;

  const { data, error } = await supabaseAdmin
    .from('trip_segments')
    .select('*')
    .eq('trip_id', tripId)
    .order('start_date', { ascending: true });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(200).json(data);
}

export async function createSegment(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tripId = req.params.id;
  const trip = req.trip!;
  const { title, start_date, end_date } = req.body ?? {};

  if (!title || !start_date || !end_date) {
    res.status(400).json({ error: 'title, start_date, and end_date are required' });
    return;
  }

  if (start_date < trip.start_date || end_date > trip.end_date) {
    res.status(400).json({ error: 'Segment dates must fall within the trip date range' });
    return;
  }
  if (end_date < start_date) {
    res.status(400).json({ error: 'end_date must be on or after start_date' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('trip_segments')
    .insert({ trip_id: tripId, title, start_date, end_date })
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
}

export async function updateSegment(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tripId = req.params.id;
  const segId = req.params.segId;
  const trip = req.trip!;
  const { title, start_date, end_date } = req.body ?? {};

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (start_date !== undefined) updates.start_date = start_date;
  if (end_date !== undefined) updates.end_date = end_date;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  if (updates.start_date && (updates.start_date as string) < trip.start_date) {
    res.status(400).json({ error: 'Segment dates must fall within the trip date range' });
    return;
  }
  if (updates.end_date && (updates.end_date as string) > trip.end_date) {
    res.status(400).json({ error: 'Segment dates must fall within the trip date range' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('trip_segments')
    .update(updates)
    .eq('id', segId)
    .eq('trip_id', tripId)
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  if (!data) { res.status(404).json({ error: 'Segment not found' }); return; }
  res.status(200).json(data);
}

export async function deleteSegment(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tripId = req.params.id;
  const segId = req.params.segId;

  const { error } = await supabaseAdmin
    .from('trip_segments')
    .delete()
    .eq('id', segId)
    .eq('trip_id', tripId);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(204).end();
}
