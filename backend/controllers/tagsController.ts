import { Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { AuthenticatedRequest } from '../types';

const DEFAULT_TAGS = ['food', 'drinks', 'stay', 'activity', 'going out'];

export async function listTags(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tripId = req.params.id;

  const { data: customTags, error } = await supabaseAdmin
    .from('trip_tags')
    .select('id, name')
    .eq('trip_id', tripId)
    .order('name', { ascending: true });

  if (error) { res.status(500).json({ error: error.message }); return; }

  const defaultItems = DEFAULT_TAGS.map(name => ({ id: null, name, isDefault: true }));
  const customItems = (customTags ?? []).map((t: { id: string; name: string }) => ({ id: t.id, name: t.name, isDefault: false }));
  res.status(200).json([...defaultItems, ...customItems]);
}

export async function createTag(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tripId = req.params.id;
  const { name } = req.body ?? {};

  if (!name?.trim()) {
    res.status(400).json({ error: 'name is required' });
    return;
  }

  if (DEFAULT_TAGS.includes(name.trim().toLowerCase())) {
    res.status(400).json({ error: 'This is a default tag and cannot be added again' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('trip_tags')
    .insert({ trip_id: tripId, name: name.trim() })
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json({ ...data, isDefault: false });
}

export async function deleteTag(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tripId = req.params.id;
  const tagId = req.params.tagId;

  const { data: tag } = await supabaseAdmin
    .from('trip_tags')
    .select('name')
    .eq('id', tagId)
    .eq('trip_id', tripId)
    .maybeSingle();

  if (!tag) { res.status(404).json({ error: 'Tag not found' }); return; }

  const { data: itemsUsingTag } = await supabaseAdmin
    .from('itinerary_items')
    .select('id')
    .eq('trip_id', tripId)
    .contains('tags', [tag.name])
    .limit(1);

  if (itemsUsingTag && itemsUsingTag.length > 0) {
    res.status(400).json({ error: 'Cannot delete a tag that is used by one or more items' });
    return;
  }

  const { error } = await supabaseAdmin
    .from('trip_tags')
    .delete()
    .eq('id', tagId)
    .eq('trip_id', tripId);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(204).end();
}
