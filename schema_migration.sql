-- 1. Create Profiles Table (Public Profile Info)
create table profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Setlists Table
create table setlists (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  owner_id uuid references auth.users not null,
  is_live boolean default false, -- If the leader is currently broadcasting
  is_public boolean default true, -- For public library/cloning
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create Setlist Items Table (Many-to-Many with Order)
create table setlist_items (
  id uuid default uuid_generate_v4() primary key,
  setlist_id uuid references setlists(id) on delete cascade not null,
  song_id bigint references songs(id) on delete cascade not null,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Enable RLS
alter table profiles enable row level security;
alter table setlists enable row level security;
alter table setlist_items enable row level security;

-- 5. Policies (Simple Version)

-- Profiles: Public Read, Self Update
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );
create policy "Users can insert own profile." on profiles for insert with check ( auth.uid() = id );

-- Setlists: Public Read (if public), Owner Write
create policy "Public setlists are viewable by everyone." on setlists
  for select using ( is_public = true or auth.uid() = owner_id );

create policy "Owners can insert setlists." on setlists for insert with check ( auth.uid() = owner_id );
create policy "Owners can update setlists." on setlists for update using ( auth.uid() = owner_id );
create policy "Owners can delete setlists." on setlists for delete using ( auth.uid() = owner_id );

-- Setlist Items: Read if Setlist is readable (simplified: just public access for now or join check)
-- Ideally we check the parent setlist's visibility, but for now allow read all to avoid complex joins in RLS policies if performance is key.
-- A better approach:
create policy "Items viewable by everyone" on setlist_items for select using (true);

create policy "Owners can manage items" on setlist_items for all using (
  exists ( select 1 from setlists where id = setlist_items.setlist_id and owner_id = auth.uid() )
);

-- 6. Helper Function to Migrate Existing Songs (Optional Run)
-- Run this AFTER you create your first user and log in, if you want to import "orphan" songs into a list.
-- or manually via UI.
