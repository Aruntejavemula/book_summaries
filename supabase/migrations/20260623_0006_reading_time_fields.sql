-- Add reading time + reading time-of-day columns to user_preferences.
-- These capture the two new onboarding questions (steps 2 and 3).

alter table public.user_preferences
  add column if not exists reading_time text,
  add column if not exists reading_time_of_day text;
