create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books(id) on delete cascade,
  chapter_number int not null,
  title text,
  audio_path text,
  text_content text,
  duration_seconds int,
  language text default 'te',
  created_at timestamptz default now(),
  unique(book_id, chapter_number)
);

insert into public.chapters (
  id,
  book_id,
  chapter_number,
  title,
  audio_path,
  text_content,
  duration_seconds,
  language,
  created_at
)
select
  id,
  book_id,
  row_number() over (partition by book_id order by created_at)::int,
  title,
  audio_path,
  summary_text,
  duration_seconds,
  language,
  created_at
from public.summaries;

drop policy if exists "Summaries viewable by authenticated users" on public.summaries;
drop table if exists public.summaries cascade;

alter table public.chapters enable row level security;

create policy "Chapters viewable by everyone"
  on public.chapters
  for select
  to anon, authenticated
  using (true);
