-- Run this script once against your Neon database.
-- Blog content remains in src/data/blogs.ts; these tables store dynamic events only.

create table if not exists blog_comments (
  id bigserial primary key,
  blog_slug text not null,
  display_name varchar(80),
  body varchar(2000) not null,
  image_url text,
  status varchar(20) not null default 'pending',
  request_fingerprint_hash char(64),
  created_at timestamptz not null default now(),
  constraint blog_comments_status_check
    check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists blog_comments_slug_created_idx
  on blog_comments (blog_slug, created_at desc);

create table if not exists blog_view_events (
  id bigserial primary key,
  blog_slug text not null,
  request_fingerprint_hash char(64),
  created_at timestamptz not null default now()
);

create index if not exists blog_view_events_slug_idx
  on blog_view_events (blog_slug);

create table if not exists blog_view_cooldowns (
  id bigserial primary key,
  blog_slug text not null,
  request_fingerprint_hash char(64) not null,
  last_view_at timestamptz not null default now(),
  unique (blog_slug, request_fingerprint_hash)
);

create index if not exists blog_view_cooldowns_last_view_idx
  on blog_view_cooldowns (last_view_at);

create table if not exists blog_reaction_events (
  id bigserial primary key,
  blog_slug text not null,
  reaction_type varchar(20) not null,
  request_fingerprint_hash char(64),
  created_at timestamptz not null default now(),
  constraint blog_reaction_type_check
    check (reaction_type in ('like', 'love', 'fire', 'laugh', 'insightful'))
);

create index if not exists blog_reactions_slug_type_idx
  on blog_reaction_events (blog_slug, reaction_type);

-- Convert existing append-only reaction rows to one current reaction per visitor.
delete from blog_reaction_events older
using blog_reaction_events newer
where older.blog_slug = newer.blog_slug
  and older.request_fingerprint_hash = newer.request_fingerprint_hash
  and older.id < newer.id
  and older.request_fingerprint_hash is not null;

create unique index if not exists blog_reactions_one_per_fingerprint_idx
  on blog_reaction_events (blog_slug, request_fingerprint_hash)
  where request_fingerprint_hash is not null;

create table if not exists interaction_rate_limit_buckets (
  bucket_key varchar(180) not null,
  action varchar(30) not null,
  window_start timestamptz not null,
  request_count integer not null default 0,
  expires_at timestamptz not null,
  primary key (bucket_key, action, window_start)
);

create index if not exists interaction_rate_limit_expiry_idx
  on interaction_rate_limit_buckets (expires_at);
