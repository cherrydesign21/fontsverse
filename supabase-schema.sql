-- ============================================================
-- FontsVerse — Full Database Schema
-- Run this in Supabase → SQL Editor → New Query → Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────
-- Extends Supabase auth.users with role + display info
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  role        text not null default 'user' check (role in ('admin','user')),
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Auto-create profile on signup
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

-- ── FONTS ─────────────────────────────────────────────────
-- Platform fonts (admin-managed) + user-uploaded fonts
create table if not exists public.fonts (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  category      text not null default 'Sans-Serif',
  is_public     boolean not null default true,
  uploaded_by   uuid references public.profiles(id) on delete set null,
  is_platform   boolean not null default false, -- true = admin added to main catalogue
  bg            text default '#1a1a2e',
  color         text default '#a78bfa',
  font_family   text default 'system-ui',
  font_weight   text default '700',
  font_style    text default 'normal',
  letter_spacing text default '0px',
  downloads     integer default 0,
  file_ttf      text,  -- storage path
  file_woff     text,
  file_woff2    text,
  file_svg      text,
  file_original text,  -- original uploaded file path
  created_at    timestamptz default now()
);

-- ── PROJECTS ──────────────────────────────────────────────
create table if not exists public.projects (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz default now()
);

-- ── PROJECT_FONTS (many-to-many) ──────────────────────────
create table if not exists public.project_fonts (
  project_id  uuid references public.projects(id) on delete cascade,
  font_id     uuid references public.fonts(id) on delete cascade,
  primary key (project_id, font_id)
);

-- ── ADS ───────────────────────────────────────────────────
create table if not exists public.ads (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  url         text not null,
  tagline     text,
  contact     text not null,
  budget      numeric(10,2),
  status      text default 'pending' check (status in ('pending','approved','rejected','active','paused')),
  image_url   text,
  submitted_by uuid references public.profiles(id) on delete set null,
  created_at  timestamptz default now(),
  approved_at timestamptz,
  starts_at   timestamptz,
  ends_at     timestamptz
);

-- ── SEED PLATFORM FONTS ───────────────────────────────────
insert into public.fonts (name, slug, category, is_public, is_platform, bg, color, font_family, font_weight, font_style, letter_spacing, downloads)
values
  ('Playfair Display','playfair-display','Serif',     true,true,'#1a1a2e','#e8c97e','Georgia, serif',              '700','italic', '-1px',  12840),
  ('Montserrat',      'montserrat',      'Sans-Serif',true,true,'#0f3460','#e94560','''Trebuchet MS'', sans-serif','900','normal', '-2px',  28350),
  ('Raleway',         'raleway',         'Sans-Serif',true,true,'#1b4332','#95d5b2','''Century Gothic'', sans-serif','800','normal','3px',   9210),
  ('Merriweather',    'merriweather',    'Serif',     true,true,'#3d0c02','#f4a261','''Book Antiqua'', serif',     '700','normal', '-0.5px',7640),
  ('Nunito',          'nunito',          'Sans-Serif',true,true,'#240046','#c77dff','Tahoma, sans-serif',          '800','normal', '1px',   11200),
  ('Lato',            'lato',            'Sans-Serif',true,true,'#03045e','#90e0ef','Verdana, sans-serif',         '900','normal', '-1px',  19800),
  ('Oswald',          'oswald',          'Condensed', true,true,'#1c1c1c','#f5cb5c','Impact, sans-serif',          '700','normal', '2px',   8430),
  ('Crimson Text',    'crimson-text',    'Serif',     true,true,'#370617','#ffb703','Garamond, serif',             '700','italic', '0px',   5620),
  ('Work Sans',       'work-sans',       'Sans-Serif',true,true,'#001219','#94d2bd','''Arial Narrow'', sans-serif','900','normal', '-2px',  14300),
  ('Quicksand',       'quicksand',       'Display',   true,true,'#3a0ca3','#f72585','''Segoe UI'', sans-serif',    '700','normal', '1px',   6900),
  ('Inconsolata',     'inconsolata',     'Monospace', true,true,'#0d0d0d','#39d353','''Courier New'', monospace',  '700','normal', '0px',   8100),
  ('Libre Baskerville','libre-baskerville','Serif',   true,true,'#2d1b69','#a8dadc','''Times New Roman'', serif',  '700','italic', '0px',   7250)
on conflict (slug) do nothing;

-- ── ROW LEVEL SECURITY ────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.fonts       enable row level security;
alter table public.projects    enable row level security;
alter table public.project_fonts enable row level security;
alter table public.ads         enable row level security;

-- profiles: users see all profiles, edit only their own
create policy "profiles_select_all"  on public.profiles for select using (true);
create policy "profiles_update_own"  on public.profiles for update using (auth.uid() = id);

-- fonts: public fonts visible to all; private only to owner
create policy "fonts_select_public"  on public.fonts for select using (is_public = true or auth.uid() = uploaded_by);
create policy "fonts_insert_auth"    on public.fonts for insert with check (auth.uid() is not null);
create policy "fonts_update_own"     on public.fonts for update using (auth.uid() = uploaded_by);
create policy "fonts_delete_own"     on public.fonts for delete using (auth.uid() = uploaded_by);

-- projects: only owner
create policy "projects_own"         on public.projects for all using (auth.uid() = user_id);
create policy "project_fonts_own"    on public.project_fonts for all
  using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));

-- ads: anyone can submit; only owner/admin can see own ads
create policy "ads_insert_auth"      on public.ads for insert with check (auth.uid() is not null);
create policy "ads_select_own"       on public.ads for select using (auth.uid() = submitted_by);
create policy "ads_select_active"    on public.ads for select using (status = 'active');

-- ── STORAGE BUCKET ────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fonts',
  'fonts',
  true,
  10485760, -- 10MB max per file
  array['font/ttf','font/otf','font/woff','font/woff2','application/octet-stream','application/x-font-ttf','application/x-font-otf','application/font-woff','application/font-woff2']
) on conflict (id) do nothing;

-- Storage policies
create policy "fonts_bucket_upload" on storage.objects
  for insert with check (bucket_id = 'fonts' and auth.uid() is not null);
create policy "fonts_bucket_read"   on storage.objects
  for select using (bucket_id = 'fonts');
create policy "fonts_bucket_delete" on storage.objects
  for delete using (bucket_id = 'fonts' and auth.role() = 'authenticated');

