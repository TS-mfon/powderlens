create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key,
  email text unique not null,
  role text not null default 'analyst',
  created_at timestamptz not null default now()
);

create table if not exists wallet_entities (
  id uuid primary key,
  address text unique not null,
  label text not null,
  category text not null,
  conviction integer not null default 50,
  created_at timestamptz not null default now()
);

create table if not exists rotation_signals (
  id uuid primary key,
  headline text not null,
  summary text not null,
  confidence integer not null,
  severity text not null,
  source_protocol text not null,
  destination_protocol text not null,
  source_asset text not null,
  destination_asset text not null,
  evidence_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists signal_evidence (
  id uuid primary key,
  signal_id uuid not null references rotation_signals(id) on delete cascade,
  evidence_type text not null,
  title text not null,
  body text not null
);

create table if not exists watchlists (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists alert_rules (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  channel text not null,
  condition text not null,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists saved_theses (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  signal_id uuid not null references rotation_signals(id) on delete cascade,
  thesis text not null,
  status text not null default 'tracking',
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key,
  actor_email text not null,
  action text not null,
  target_type text not null,
  target_id text not null,
  reason text not null,
  created_at timestamptz not null default now()
);
