-- User preferences: stores onboarding goals and genre selections
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  goals text[] not null default '{}',
  genres text[] not null default '{}',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User book likes: stores book swipe results from onboarding
create table if not exists public.user_book_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_title text not null,
  book_author text not null,
  book_cover_url text not null,
  book_category text not null,
  liked boolean not null,
  created_at timestamptz not null default now(),
  unique (user_id, book_title)
);

create index if not exists user_preferences_user_id_idx on public.user_preferences (user_id);
create index if not exists user_book_likes_user_id_idx on public.user_book_likes (user_id);
create index if not exists user_book_likes_liked_idx on public.user_book_likes (user_id, liked) where liked = true;

alter table public.user_preferences enable row level security;
alter table public.user_book_likes enable row level security;

create policy "Users can read own preferences"
  on public.user_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read own book likes"
  on public.user_book_likes
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own book likes"
  on public.user_book_likes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own book likes"
  on public.user_book_likes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_user_preferences_updated_at on public.user_preferences;
create trigger set_user_preferences_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();
