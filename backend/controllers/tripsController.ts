import { Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { AuthenticatedRequest } from '../types';

export async function listTrips(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('trips')
    .select('*')
    .eq('owner_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(200).json(data);
}

export async function createTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { name, destination, start_date, end_date, cover_image_url } = req.body ?? {};

  if (!name || !destination || !start_date || !end_date) {
    res.status(400).json({ error: 'name, destination, start_date, and end_date are required' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('trips')
    .insert({
      owner_id: req.user.id,
      name,
      destination,
      start_date,
      end_date,
      cover_image_url: cover_image_url ?? null,
    })
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
}

export async function getTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
  res.status(200).json(req.trip);
}

export async function updateTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.isOwner) {
    res.status(403).json({ error: 'Only the trip owner can update this trip' });
    return;
  }

  const { name, destination, start_date, end_date, cover_image_url } = req.body ?? {};
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (destination !== undefined) updates.destination = destination;
  if (start_date !== undefined) updates.start_date = start_date;
  if (end_date !== undefined) updates.end_date = end_date;
  if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('trips')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(200).json(data);
}

export async function deleteTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.isOwner) {
    res.status(403).json({ error: 'Only the trip owner can delete this trip' });
    return;
  }

  const tripId = req.params.id;
  const trip = req.trip!;

  const { data: items } = await supabaseAdmin
    .from('itinerary_items')
    .select('id')
    .eq('trip_id', tripId);

  const itemIds = (items ?? []).map((i: { id: string }) => i.id);

  if (itemIds.length > 0) {
    const { data: photos } = await supabaseAdmin
      .from('item_photos')
      .select('storage_url')
      .in('item_id', itemIds);

    const photoPaths = (photos ?? [])
      .map((p: { storage_url: string }) => {
        const marker = '/item-photos/';
        const idx = p.storage_url.indexOf(marker);
        return idx !== -1 ? p.storage_url.slice(idx + marker.length) : null;
      })
      .filter(Boolean) as string[];

    if (photoPaths.length > 0) {
      await supabaseAdmin.storage.from('item-photos').remove(photoPaths);
    }

    await supabaseAdmin.from('item_photos').delete().in('item_id', itemIds);
  }

  if (trip.cover_image_url) {
    const marker = '/trip-covers/';
    const idx = trip.cover_image_url.indexOf(marker);
    if (idx !== -1) {
      const path = trip.cover_image_url.slice(idx + marker.length);
      await supabaseAdmin.storage.from('trip-covers').remove([path]);
    }
  }

  await supabaseAdmin.from('itinerary_items').delete().eq('trip_id', tripId);
  await supabaseAdmin.from('trip_segments').delete().eq('trip_id', tripId);
  await supabaseAdmin.from('trip_collaborators').delete().eq('trip_id', tripId);
  await supabaseAdmin.from('trip_invites').delete().eq('trip_id', tripId);
  await supabaseAdmin.from('trip_tags').delete().eq('trip_id', tripId);

  const { error } = await supabaseAdmin.from('trips').delete().eq('id', tripId);
  if (error) { res.status(500).json({ error: error.message }); return; }

  res.status(204).end();
}
