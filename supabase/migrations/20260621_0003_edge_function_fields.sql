alter table public.summaries
  add column if not exists audio_path text;

update public.summaries
set audio_path = coalesce(audio_path, audio_object_key)
where audio_path is null and audio_object_key is not null;

alter table public.subscriptions
  add column if not exists receipt_data text;

alter table public.subscriptions
  add column if not exists expires_at timestamptz;

update public.subscriptions
set expires_at = coalesce(expires_at, current_period_ends_at)
where expires_at is null and current_period_ends_at is not null;

alter table public.subscriptions
  drop constraint if exists subscriptions_platform_check;

alter table public.subscriptions
  add constraint subscriptions_platform_check
  check (platform in ('apple', 'google', 'ios', 'android'));
