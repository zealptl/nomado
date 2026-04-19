-- ============================================================
-- NOMADO DATABASE SCHEMA
-- Run this in Supabase Dashboard → SQL Editor → New query
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.trips (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  destination text,
  start_date date,
  end_date date,
  cover_image_url text,
  created_at timestamptz not null default now()
);

create table public.trip_segments (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  title text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);

create table public.itinerary_items (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  date date not null,
  title text not null,
  location text,
  maps_url text,
  time_start time,
  time_end time,
  description text,
  position float not null default 0,
  tags text[] not null default '{}',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.item_photos (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references public.itinerary_items(id) on delete cascade,
  storage_url text not null,
  created_at timestamptz not null default now()
);

create table public.trip_collaborators (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique(trip_id, user_id)
);

create table public.trip_tags (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  unique(trip_id, name)
);

create table public.trip_invites (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGN UP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_segments enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.item_photos enable row level security;
alter table public.trip_collaborators enable row level security;
alter table public.trip_tags enable row level security;
alter table public.trip_invites enable row level security;

-- Helper: is the current user a member of a trip (owner OR collaborator)?
create or replace function public.is_trip_member(p_trip_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.trips where id = p_trip_id and owner_id = auth.uid()
    union all
    select 1 from public.trip_collaborators where trip_id = p_trip_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- Helper: is the current user the trip owner?
create or replace function public.is_trip_owner(p_trip_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.trips where id = p_trip_id and owner_id = auth.uid()
  );
$$ language sql security definer stable;

-- profiles
create policy "Users can view their own profile"
  on public.profiles for select using (id = auth.uid());
create policy "Users can update their own profile"
  on public.profiles for update using (id = auth.uid());

-- trips
create policy "Members can view trips"
  on public.trips for select using (public.is_trip_member(id));
create policy "Authenticated users can create trips"
  on public.trips for insert with check (owner_id = auth.uid());
create policy "Owner can update trips"
  on public.trips for update using (owner_id = auth.uid());
create policy "Owner can delete trips"
  on public.trips for delete using (owner_id = auth.uid());

-- trip_segments
create policy "Members can view segments"
  on public.trip_segments for select using (public.is_trip_member(trip_id));
create policy "Members can create segments"
  on public.trip_segments for insert with check (public.is_trip_member(trip_id));
create policy "Members can update segments"
  on public.trip_segments for update using (public.is_trip_member(trip_id));
create policy "Owner can delete segments"
  on public.trip_segments for delete using (public.is_trip_owner(trip_id));

-- itinerary_items
create policy "Members can view items"
  on public.itinerary_items for select using (public.is_trip_member(trip_id));
create policy "Members can create items"
  on public.itinerary_items for insert with check (public.is_trip_member(trip_id));
create policy "Members can update items"
  on public.itinerary_items for update using (public.is_trip_member(trip_id));
create policy "Members can delete items"
  on public.itinerary_items for delete using (public.is_trip_member(trip_id));

-- item_photos
create policy "Members can view photos"
  on public.item_photos for select
  using (exists (
    select 1 from public.itinerary_items i
    where i.id = item_id and public.is_trip_member(i.trip_id)
  ));
create policy "Members can add photos"
  on public.item_photos for insert
  with check (exists (
    select 1 from public.itinerary_items i
    where i.id = item_id and public.is_trip_member(i.trip_id)
  ));
create policy "Members can delete photos"
  on public.item_photos for delete
  using (exists (
    select 1 from public.itinerary_items i
    where i.id = item_id and public.is_trip_member(i.trip_id)
  ));

-- trip_collaborators
create policy "Members can view collaborators"
  on public.trip_collaborators for select using (public.is_trip_member(trip_id));
create policy "Authenticated users can join via invite"
  on public.trip_collaborators for insert with check (user_id = auth.uid());

-- trip_tags
create policy "Members can view tags"
  on public.trip_tags for select using (public.is_trip_member(trip_id));
create policy "Members can create tags"
  on public.trip_tags for insert with check (public.is_trip_member(trip_id));
create policy "Members can delete tags"
  on public.trip_tags for delete using (public.is_trip_member(trip_id));

-- trip_invites
create policy "Owner can view invites"
  on public.trip_invites for select using (public.is_trip_owner(trip_id));
create policy "Owner can create invites"
  on public.trip_invites for insert with check (public.is_trip_owner(trip_id));
create policy "Owner can delete invites"
  on public.trip_invites for delete using (public.is_trip_owner(trip_id));

-- ============================================================
-- STORAGE BUCKETS & POLICIES
-- ============================================================

insert into storage.buckets (id, name, public)
  values ('trip-covers', 'trip-covers', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('item-photos', 'item-photos', true)
  on conflict (id) do nothing;

-- Public read (bucket is public so GET requests work without auth tokens,
-- but this policy covers the RLS path when accessed via the API)
create policy "Public read trip-covers"
  on storage.objects for select
  using (bucket_id = 'trip-covers');

create policy "Public read item-photos"
  on storage.objects for select
  using (bucket_id = 'item-photos');

-- Authenticated upload only — any signed-in user can upload.
-- The backend API validates trip membership before calling storage,
-- so we don't need to re-check trip membership here.
create policy "Authenticated upload trip-covers"
  on storage.objects for insert
  with check (bucket_id = 'trip-covers' and auth.role() = 'authenticated');

create policy "Authenticated upload item-photos"
  on storage.objects for insert
  with check (bucket_id = 'item-photos' and auth.role() = 'authenticated');

-- Only the uploader can delete their own files
create policy "Owner delete trip-covers"
  on storage.objects for delete
  using (bucket_id = 'trip-covers' and auth.uid() = owner);

create policy "Owner delete item-photos"
  on storage.objects for delete
  using (bucket_id = 'item-photos' and auth.uid() = owner);
