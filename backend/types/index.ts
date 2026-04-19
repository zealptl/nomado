import { Request } from 'express';
import { User } from '@supabase/supabase-js';

export interface Trip {
  id: string;
  owner_id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemPhoto {
  id: string;
  item_id: string;
  storage_url: string;
  created_at: string;
}

export interface ItineraryItem {
  id: string;
  trip_id: string;
  date: string;
  title: string;
  location: string | null;
  maps_url: string | null;
  time_start: string | null;
  time_end: string | null;
  description: string | null;
  tags: string[];
  position: number;
  created_at: string;
  updated_at: string;
  item_photos?: ItemPhoto[];
}

export interface TripSegment {
  id: string;
  trip_id: string;
  title: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface TripTag {
  id: string;
  trip_id: string;
  name: string;
  created_at: string;
}

export interface TripCollaborator {
  id: string;
  trip_id: string;
  user_id: string;
  joined_at: string;
}

export interface TripInvite {
  id: string;
  trip_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface AuthenticatedRequest extends Request {
  user: User;
  trip?: Trip;
  isOwner?: boolean;
}
