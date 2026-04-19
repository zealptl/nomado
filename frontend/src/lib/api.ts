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
};
