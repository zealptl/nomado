import { Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { AuthenticatedRequest } from '../types';

export async function listItems(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tripId = req.params.id;

  const { data, error } = await supabaseAdmin
    .from('itinerary_items')
    .select('*, item_photos(id, storage_url, created_at)')
    .eq('trip_id', tripId)
    .order('date', { ascending: true })
    .order('position', { ascending: true });

  if (error) { res.status(500).json({ error: error.message }); return; }

  const grouped: Record<string, unknown[]> = {};
  for (const item of data ?? []) {
    if (!grouped[item.date]) grouped[item.date] = [];
    grouped[item.date].push(item);
  }
  res.status(200).json(grouped);
}

export async function createItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tripId = req.params.id;
  const { date, title, location, maps_url, time_start, time_end, description, tags, position } = req.body ?? {};

  if (!date || !title) {
    res.status(400).json({ error: 'date and title are required' });
    return;
  }

  let pos = position;
  if (pos === undefined) {
    const { data: existing } = await supabaseAdmin
      .from('itinerary_items')
      .select('position')
      .eq('trip_id', tripId)
      .eq('date', date)
      .order('position', { ascending: false })
      .limit(1);
    pos = existing && existing.length > 0 ? existing[0].position + 1.0 : 1.0;
  }

  const { data, error } = await supabaseAdmin
    .from('itinerary_items')
    .insert({
      trip_id: tripId,
      date,
      title,
      location: location ?? null,
      maps_url: maps_url ?? null,
      time_start: time_start ?? null,
      time_end: time_end ?? null,
      description: description ?? null,
      tags: tags ?? [],
      position: pos,
    })
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
}

export async function updateItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tripId = req.params.id;
  const itemId = req.params.itemId;
  const { updated_at, ...fields } = req.body ?? {};

  if (!updated_at) {
    res.status(400).json({ error: 'updated_at is required for optimistic concurrency' });
    return;
  }

  const { data: current } = await supabaseAdmin
    .from('itinerary_items')
    .select('updated_at')
    .eq('id', itemId)
    .eq('trip_id', tripId)
    .maybeSingle();

  if (!current) { res.status(404).json({ error: 'Item not found' }); return; }

  if (new Date(current.updated_at).getTime() > new Date(updated_at).getTime()) {
    res.status(409).json({ error: 'This item was updated by someone else. Please refresh.' });
    return;
  }

  const allowed = ['title', 'location', 'maps_url', 'time_start', 'time_end', 'description', 'tags', 'position', 'date'];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in fields) updates[key] = fields[key];
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No updatable fields provided' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('itinerary_items')
    .update(updates)
    .eq('id', itemId)
    .eq('trip_id', tripId)
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(200).json(data);
}

export async function deleteItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tripId = req.params.id;
  const itemId = req.params.itemId;

  const { data: photos } = await supabaseAdmin
    .from('item_photos')
    .select('storage_url')
    .eq('item_id', itemId);

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

  await supabaseAdmin.from('item_photos').delete().eq('item_id', itemId);

  const { error } = await supabaseAdmin
    .from('itinerary_items')
    .delete()
    .eq('id', itemId)
    .eq('trip_id', tripId);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(204).end();
}

export async function reorderItems(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tripId = req.params.id;
  const { items } = req.body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'items array is required' });
    return;
  }

  for (const { id, position } of items) {
    if (!id || typeof position !== 'number') continue;
    await supabaseAdmin
      .from('itinerary_items')
      .update({ position })
      .eq('id', id)
      .eq('trip_id', tripId);
  }

  res.status(200).json({ ok: true });
}
