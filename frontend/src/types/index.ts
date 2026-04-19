export interface Trip {
  id: string;
  owner_id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_image_url: string | null;
  created_at: string;
}

export interface TripSegment {
  id: string;
  trip_id: string;
  title: string;
  start_date: string;
  end_date: string;
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
  position: number;
  tags: string[];
  updated_at: string;
  created_at: string;
}

export interface ItemPhoto {
  id: string;
  item_id: string;
  storage_url: string;
  created_at: string;
}

export interface TripTag {
  id: string;
  trip_id: string;
  name: string;
}
