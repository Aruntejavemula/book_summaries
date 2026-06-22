create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  description text,
  cover_url text,
  language text not null default 'te',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  title text not null,
  summary_text text,
  audio_object_key text,
  audio_public_url text,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  platform text not null check (platform in ('ios', 'android')),
  product_id text not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'canceled', 'expired', 'refunded')),
  receipt_payload jsonb,
  receipt_verified_at timestamptz,
  current_period_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  summary_id uuid references public.summaries(id) on delete set null,
  last_position_seconds integer not null default 0,
  progress_percent numeric(5,2) not null default 0,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create index if not exists summaries_book_id_idx on public.summaries (book_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists progress_user_id_idx on public.progress (user_id);
create index if not exists progress_book_id_idx on public.progress (book_id);

alter table public.users enable row level security;
alter table public.books enable row level security;
alter table public.summaries enable row level security;
alter table public.subscriptions enable row level security;
alter table public.progress enable row level security;

create policy "Users can read their own profile"
  on public.users
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Authenticated users can read books"
  on public.books
  for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can read summaries"
  on public.summaries
  for select
  using (auth.role() = 'authenticated');

create policy "Users can read their subscription row"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

create policy "Users can read their progress rows"
  on public.progress
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their progress rows"
  on public.progress
  for insert
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_books_updated_at on public.books;
create trigger set_books_updated_at
before update on public.books
for each row execute function public.set_updated_at();

drop trigger if exists set_summaries_updated_at on public.summaries;
create trigger set_summaries_updated_at
before update on public.summaries
for each row execute function public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists set_progress_updated_at on public.progress;
create trigger set_progress_updated_at
before update on public.progress
for each row execute function public.set_updated_at();
