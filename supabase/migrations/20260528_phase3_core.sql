-- Margi Phase 3 core schema: profiles, volunteer_providers, dispatch_events

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  email text,
  medical_json jsonb default '{}'::jsonb,
  settings_json jsonb default '{}'::jsonb,
  gov_employee boolean default false,
  updated_at timestamptz default now()
);

create table if not exists public.volunteer_providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  org_name text not null,
  contact_name text not null,
  phone text not null,
  service_area text not null,
  lat double precision not null,
  lng double precision not null,
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.dispatch_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  reference_id text not null,
  payload_json jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.volunteer_providers enable row level security;
alter table public.dispatch_events enable row level security;

-- Profiles: users read/update own row
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);

create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);

-- Volunteers: public read verified; authenticated insert own
create policy volunteers_select_verified on public.volunteer_providers
  for select using (verified = true);

create policy volunteers_insert_own on public.volunteer_providers
  for insert with check (auth.uid() = user_id);

create policy volunteers_select_own on public.volunteer_providers
  for select using (auth.uid() = user_id);

-- Dispatch events: users read/insert own
create policy dispatch_select_own on public.dispatch_events
  for select using (auth.uid() = user_id);

create policy dispatch_insert_own on public.dispatch_events
  for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
