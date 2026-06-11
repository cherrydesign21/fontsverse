-- ============================================================
-- FontsVerse — Complete Database Schema
-- Run this in Supabase SQL Editor (once)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── 1. PROFILES (extends Supabase auth.users) ─────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  role        text not null default 'user' check (role in ('admin','user')),
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 2. FONTS ──────────────────────────────────────────────────
create table if not exists public.fonts (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  category      text not null default 'Sans-Serif',
  description   text,
  bg_color      text not null default '#1a1a2e',
  text_color    text not null default '#ffffff',
  font_family   text default 'system-ui',
  font_weight   text default '700',
  font_style    text default 'normal',
  letter_spacing text default '0px',
  is_public     boolean default true,
  is_featured   boolean default false,
  uploaded_by   uuid references public.profiles(id) on delete set null,
  added_by_admin boolean default false,
  downloads     integer default 0,
  -- storage paths
  file_ttf      text,
  file_woff     text,
  file_woff2    text,
  file_svg      text,
  file_original text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── 3. PROJECTS ───────────────────────────────────────────────
create table if not exists public.projects (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz default now()
);

-- ── 4. PROJECT_FONTS (many-to-many) ───────────────────────────
create table if not exists public.project_fonts (
  project_id  uuid references public.projects(id) on delete cascade,
  font_id     uuid references public.fonts(id) on delete cascade,
  added_at    timestamptz default now(),
  primary key (project_id, font_id)
);

-- ── 5. ADS ────────────────────────────────────────────────────
create table if not exists public.ads (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  tagline       text,
  destination_url text not null,
  contact_email text not null,
  budget        numeric(10,2),
  status        text default 'pending' check (status in ('pending','approved','rejected','active','paused')),
  image_url     text,
  submitted_by  uuid references public.profiles(id) on delete set null,
  reviewed_by   uuid references public.profiles(id) on delete set null,
  review_note   text,
  impressions   integer default 0,
  clicks        integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── 6. FONT DOWNLOAD EVENTS ───────────────────────────────────
create table if not exists public.download_events (
  id         uuid primary key default uuid_generate_v4(),
  font_id    uuid references public.fonts(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete set null,
  format     text,
  created_at timestamptz default now()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.fonts         enable row level security;
alter table public.projects      enable row level security;
alter table public.project_fonts enable row level security;
alter table public.ads           enable row level security;
alter table public.download_events enable row level security;

-- PROFILES
create policy "Public profiles viewable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- FONTS: public fonts visible to all; private only to owner/admin
create policy "Public fonts visible to all" on public.fonts for select
  using (is_public = true or auth.uid() = uploaded_by);

create policy "Authenticated users insert fonts" on public.fonts for insert
  with check (auth.uid() is not null);

create policy "Owner or admin can update font" on public.fonts for update
  using (
    auth.uid() = uploaded_by or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Owner or admin can delete font" on public.fonts for delete
  using (
    auth.uid() = uploaded_by or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- PROJECTS
create policy "Owner sees own projects" on public.projects for select using (auth.uid() = owner_id);
create policy "Owner inserts projects"  on public.projects for insert with check (auth.uid() = owner_id);
create policy "Owner updates projects"  on public.projects for update using (auth.uid() = owner_id);
create policy "Owner deletes projects"  on public.projects for delete using (auth.uid() = owner_id);

-- PROJECT FONTS
create policy "Owner sees project fonts" on public.project_fonts for select
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));
create policy "Owner manages project fonts" on public.project_fonts for insert
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));

-- ADS: pending visible to admins only; active visible to all
create policy "Active ads public" on public.ads for select
  using (
    status = 'active' or
    auth.uid() = submitted_by or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Anyone submits ad" on public.ads for insert with check (true);
create policy "Admin manages ads" on public.ads for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- DOWNLOAD EVENTS
create policy "Anyone logs download" on public.download_events for insert with check (true);
create policy "Admin reads downloads"  on public.download_events for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ── STORAGE BUCKETS ───────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fonts', 'fonts', true, 10485760,
  array['font/ttf','font/otf','font/woff','font/woff2','image/svg+xml',
        'application/octet-stream','application/x-font-ttf',
        'application/x-font-woff','application/font-woff2']
) on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ad-images', 'ad-images', true, 5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
) on conflict (id) do nothing;

-- Storage policies
create policy "Anyone reads fonts bucket" on storage.objects for select
  using (bucket_id = 'fonts');

create policy "Auth users upload fonts" on storage.objects for insert
  with check (bucket_id = 'fonts' and auth.uid() is not null);

create policy "Owner deletes own font file" on storage.objects for delete
  using (bucket_id = 'fonts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone reads ad images" on storage.objects for select
  using (bucket_id = 'ad-images');

create policy "Auth users upload ad images" on storage.objects for insert
  with check (bucket_id = 'ad-images' and auth.uid() is not null);

-- ── SEED: 12 popular fonts (admin-added) ─────────────────────
insert into public.fonts (name, slug, category, bg_color, text_color, font_family, font_weight, font_style, letter_spacing, is_public, is_featured, added_by_admin, downloads)
values
  ('Playfair Display','playfair-display','Serif','#1a1a2e','#e8c97e','Georgia, serif','700','italic','-1px',true,true,true,12840),
  ('Montserrat','montserrat','Sans-Serif','#0f3460','#e94560','''Trebuchet MS'', sans-serif','900','normal','-2px',true,true,true,28350),
  ('Raleway','raleway','Sans-Serif','#1b4332','#95d5b2','''Century Gothic'', sans-serif','800','normal','3px',true,true,true,9210),
  ('Merriweather','merriweather','Serif','#3d0c02','#f4a261','''Book Antiqua'', serif','700','normal','-0.5px',true,false,true,7640),
  ('Nunito','nunito','Sans-Serif','#240046','#c77dff','Tahoma, sans-serif','800','normal','1px',true,false,true,11200),
  ('Lato','lato','Sans-Serif','#03045e','#90e0ef','Verdana, sans-serif','900','normal','-1px',true,true,true,19800),
  ('Oswald','oswald','Condensed','#1c1c1c','#f5cb5c','Impact, sans-serif','700','normal','2px',true,false,true,8430),
  ('Crimson Text','crimson-text','Serif','#370617','#ffb703','Garamond, serif','700','italic','0px',true,false,true,5620),
  ('Work Sans','work-sans','Sans-Serif','#001219','#94d2bd','''Arial Narrow'', sans-serif','900','normal','-2px',true,false,true,14300),
  ('Quicksand','quicksand','Display','#3a0ca3','#f72585','''Segoe UI'', sans-serif','700','normal','1px',true,false,true,6900),
  ('Inconsolata','inconsolata','Monospace','#0d0d0d','#39d353','''Courier New'', monospace','700','normal','0px',true,false,true,8100),
  ('Libre Baskerville','libre-baskerville','Serif','#2d1b69','#a8dadc','''Times New Roman'', serif','700','italic','0px',true,false,true,7250)
on conflict (slug) do nothing;

-- ── UPDATE TIMESTAMP TRIGGER ──────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger fonts_updated_at before update on public.fonts
  for each row execute function public.set_updated_at();
create trigger ads_updated_at before update on public.ads
  for each row execute function public.set_updated_at();

