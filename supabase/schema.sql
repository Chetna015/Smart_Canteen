-- QuickBite Smart Canteen Database Schema for Supabase
-- Run this once in Supabase Dashboard -> SQL Editor -> New Query -> Run

create table if not exists public.canteen_meta (
  id text primary key,
  express_counter integer not null default 103,
  fresh_counter integer not null default 202,
  total_delivered_today integer not null default 42,
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id text primary key,
  name text not null,
  price integer not null,
  lane text not null check (lane in ('express', 'fresh')),
  prep_mins integer not null default 1,
  category text not null,
  icon text not null,
  in_stock boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.orders (
  id text primary key,
  token text not null,
  pin text not null,
  lane text not null check (lane in ('express', 'fresh')),
  source text not null default 'qr',
  customer_name text not null default 'Student',
  slot text not null default 'Pickup Now',
  payment_mode text not null default 'UPI / Instant',
  items jsonb not null default '[]'::jsonb,
  total integer not null,
  status text not null default 'queued' check (status in ('queued', 'preparing', 'ready', 'delivered')),
  created_at bigint not null,
  updated_at bigint not null
);

create index if not exists idx_orders_created_at on public.orders (created_at desc);

-- Lock down direct public/browser access; backend (Vercel API / server.js) uses sb_secret_ key
alter table public.canteen_meta enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;

-- Grant explicit API permissions to service_role (required for sb_secret_ Data API access)
grant usage on schema public to service_role;
grant all on table public.canteen_meta, public.menu_items, public.orders to service_role;
