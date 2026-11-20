-- Run once with: npm run db:setup
create table if not exists creators (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text not null,
  phone_key text not null,
  country text,
  city text not null,
  state text,
  age_range text,
  birth_year integer,
  sample_links text[] not null default '{}',
  gender text,
  languages text[] not null default '{}',
  primary_niche text not null,
  other_categories text[] not null default '{}',
  content_types text[] not null default '{}',
  instagram_handle text not null,
  instagram_followers integer not null default 0,
  avg_reel_views integer not null default 0,
  engagement_rate text,
  youtube_url text,
  youtube_subscribers integer not null default 0,
  facebook_url text,
  x_handle text,
  linkedin_url text,
  snapchat_handle text,
  other_platform text,
  collab_preference text,
  min_rate text,
  past_brands text,
  portfolio_url text,
  about text,
  status text not null default 'new'
);
create unique index if not exists creators_email_key on creators (email);
create unique index if not exists creators_phone_key on creators (phone_key);
create unique index if not exists creators_ig_key on creators (lower(instagram_handle));

create table if not exists brand_enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  company_name text not null,
  contact_name text not null,
  role text,
  email text not null,
  phone text not null,
  website_url text,
  industry text,
  goal text,
  platforms text[] not null default '{}',
  budget text,
  timeline text,
  notes text,
  status text not null default 'new'
);

