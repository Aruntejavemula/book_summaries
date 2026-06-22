alter table public.users enable row level security;
alter table public.books enable row level security;
alter table public.summaries enable row level security;
alter table public.subscriptions enable row level security;
alter table public.progress enable row level security;

drop policy if exists "Users can read their own profile" on public.users;
create policy "Users can read their own profile"
  on public.users
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Authenticated users can read books" on public.books;
create policy "Books are viewable by everyone"
  on public.books
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated users can read summaries" on public.summaries;
create policy "Summaries viewable by authenticated users"
  on public.summaries
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Users can read their subscription row" on public.subscriptions;
create policy "Users can read their subscription row"
  on public.subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their subscription row" on public.subscriptions;
create policy "Users can insert their subscription row"
  on public.subscriptions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their subscription row" on public.subscriptions;
create policy "Users can update their subscription row"
  on public.subscriptions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read their progress rows" on public.progress;
create policy "Users can read their progress rows"
  on public.progress
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their progress rows" on public.progress;
create policy "Users can insert their progress rows"
  on public.progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their progress rows" on public.progress;
create policy "Users can update their progress rows"
  on public.progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their progress rows" on public.progress;
create policy "Users can delete their progress rows"
  on public.progress
  for delete
  to authenticated
  using (auth.uid() = user_id);
