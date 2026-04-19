import { supabase } from './supabase';
import type { Trip } from '../types';

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export const tripsApi = {
  list(): Promise<Trip[]> {
    return apiFetch('/api/trips').then(r => r.json());
  },

  listShared(): Promise<Trip[]> {
    return apiFetch('/api/trips/shared').then(r => r.json());
  },

  get(id: string): Promise<Trip> {
    return apiFetch(`/api/trips/${id}`).then(r => r.json());
  },

  create(data: {
    name: string;
    destination: string;
    start_date: string;
    end_date: string;
    cover_image_url?: string;
  }): Promise<Trip> {
    return apiFetch('/api/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(async r => {
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error ?? 'Failed to create trip');
      }
      return r.json();
    });
  },

  update(
    id: string,
    data: Partial<Pick<Trip, 'name' | 'destination' | 'start_date' | 'end_date' | 'cover_image_url'>>,
  ): Promise<Trip> {
    return apiFetch(`/api/trips/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }).then(async r => {
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error ?? 'Failed to update trip');
      }
      return r.json();
    });
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/api/trips/${id}`, { method: 'DELETE' }).then(async r => {
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error ?? 'Failed to delete trip');
      }
    });
  },

  generateInvite(id: string, refresh = false): Promise<{ token: string; url: string }> {
    const path = refresh ? `/api/trips/${id}/invite/refresh` : `/api/trips/${id}/invite`;
    return apiFetch(path, { method: 'POST' }).then(async r => {
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error ?? 'Failed to generate invite link');
      }
      return r.json();
    });
  },
};

export const inviteApi = {
  accept(invite_token: string): Promise<{ tripId: string }> {
    return apiFetch('/api/invite/accept', {
      method: 'POST',
      body: JSON.stringify({ invite_token }),
    }).then(async r => {
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error ?? 'Failed to accept invite');
      }
      return r.json();
    });
  },
};

import type { TripSegment, ItineraryItem, TripTag } from '../types';

export const segmentsApi = {
  list(tripId: string): Promise<TripSegment[]> {
    return apiFetch(`/api/trips/${tripId}/segments`).then(r => r.json());
  },
  create(tripId: string, data: { title: string; start_date: string; end_date: string }): Promise<TripSegment> {
    return apiFetch(`/api/trips/${tripId}/segments`, { method: 'POST', body: JSON.stringify(data) }).then(async r => {
      if (!r.ok) { const e = await r.json(); throw new Error(e.error ?? 'Failed'); }
      return r.json();
    });
  },
  update(tripId: string, segId: string, data: Partial<{ title: string; start_date: string; end_date: string }>): Promise<TripSegment> {
    return apiFetch(`/api/trips/${tripId}/segments/${segId}`, { method: 'PATCH', body: JSON.stringify(data) }).then(async r => {
      if (!r.ok) { const e = await r.json(); throw new Error(e.error ?? 'Failed'); }
      return r.json();
    });
  },
  delete(tripId: string, segId: string): Promise<void> {
    return apiFetch(`/api/trips/${tripId}/segments/${segId}`, { method: 'DELETE' }).then(async r => {
      if (!r.ok) { const e = await r.json(); throw new Error(e.error ?? 'Failed'); }
    });
  },
};

export const itemsApi = {
  list(tripId: string): Promise<Record<string, ItineraryItem[]>> {
    return apiFetch(`/api/trips/${tripId}/items`).then(r => r.json());
  },
  create(tripId: string, data: Partial<ItineraryItem> & { date: string; title: string }): Promise<ItineraryItem> {
    return apiFetch(`/api/trips/${tripId}/items`, { method: 'POST', body: JSON.stringify(data) }).then(async r => {
      if (!r.ok) { const e = await r.json(); throw new Error(e.error ?? 'Failed'); }
      return r.json();
    });
  },
  update(tripId: string, itemId: string, data: Partial<ItineraryItem> & { updated_at: string }): Promise<ItineraryItem> {
    return apiFetch(`/api/trips/${tripId}/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(data) }).then(async r => {
      if (r.status === 409) throw Object.assign(new Error('conflict'), { status: 409 });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error ?? 'Failed'); }
      return r.json();
    });
  },
  delete(tripId: string, itemId: string): Promise<void> {
    return apiFetch(`/api/trips/${tripId}/items/${itemId}`, { method: 'DELETE' }).then(async r => {
      if (!r.ok) { const e = await r.json(); throw new Error(e.error ?? 'Failed'); }
    });
  },
  reorder(tripId: string, items: { id: string; position: number }[]): Promise<void> {
    return apiFetch(`/api/trips/${tripId}/items/reorder`, { method: 'PATCH', body: JSON.stringify({ items }) }).then(async r => {
      if (!r.ok) { const e = await r.json(); throw new Error(e.error ?? 'Failed'); }
    });
  },
};

export const tagsApi = {
  list(tripId: string): Promise<(TripTag & { isDefault: boolean })[]> {
    return apiFetch(`/api/trips/${tripId}/tags`).then(r => r.json());
  },
};
