# book_summaries — Design & Architecture

A Telugu-language book-summary mobile app (audiobook-style) built with Expo / React Native + expo-router, backed by Supabase (auth, Postgres, edge functions) and Cloudflare R2 for audio storage.

## Stack
- Frontend: Expo `~56`, React Native `0.86`, React `19`, expo-router (typed routes), TypeScript `~5.8`
- Animation: `react-native-reanimated@4.5` + `react-native-gesture-handler@3` (swipe gestures, spring physics, layout animations)
- Backend: Supabase (`@supabase/supabase-js`), Deno edge functions
- Storage: Cloudflare R2 (signed audio URLs via edge function)
- Tooling: ESLint (`eslint-config-expo`), typecheck via `tsc --noEmit`

## Commands
```bash
npm run start      # expo start
npm run ios        # expo start --ios
npm run android    # expo start --android
npm run web        # expo start --web
npm run lint       # eslint .
npm run typecheck  # tsc --noEmit
```

## Directory Map
```
app/                       file-based routes (expo-router)
  _layout.tsx              root stack + AuthSessionProvider + GestureHandlerRootView, deep-link auth callback handler
  index.tsx                entry router: login -> onboarding -> tabs (dev flags in constants/dev-flags.ts)
  (auth)/                  login.tsx, register.tsx (Google/Apple OAuth) — brand palette applied
  (onboarding)/index.tsx   7-step onboarding flow (Reanimated animations, gesture swipe deck)
  (tabs)/                  index (Home), library, profile  [STUBS]
  book/[id].tsx            book detail  [STUB]
  player/[id].tsx          audio player [STUB]
components/                AudioPlayer, BookCard, SubscriptionGate [STUBS]
constants/                 colors.ts (brand palette + dark theme), config.ts (env loading), dev-flags.ts (BYPASS_LOGIN, FORCE_ONBOARDING)
lib/                       supabase, auth, auth-session, onboarding, iap, r2
supabase/
  functions/               validate-iap, get-audio-url (Deno edge functions)
  migrations/              SQL schema + RLS policies (6 migrations)
assets/                    login-art.png, etc.
```

## Brand Palette (`constants/colors.ts`)
Only four hues across the entire app — no white, no black, no other colors:
- **Persian orange** `#D96F2E` — accent, all "yes"/positive actions (sign in, save, like, CTAs, links, errors)
- **Sea mint** `#7FB5A6` — secondary, "no"/skip actions, success states
- **Light cream** `#FBF7F0` — backgrounds, surfaces (tints: `#F4EEE1` surface, `#FDFAF3` elevated)
- **Grey** `#525252` — text, primary elements (tints: `#7C7C7C` secondary, `#A6A6A6` muted)

Dark theme defined (`getTheme("dark")`) but not yet wired to a toggle.

## Routing & Navigation
- Root stack defined in `app/_layout.tsx`; wraps everything in `GestureHandlerRootView` + `AuthSessionProvider`.
- Deep links: `booksummaries://auth/callback` handled in `_layout.tsx` and `auth-session.tsx` (exchanges OAuth `code` for a session).
- `app/index.tsx` decides initial route based on session + onboarding flag.
  - Dev flags in `constants/dev-flags.ts`: `BYPASS_LOGIN` (skip login), `FORCE_ONBOARDING` (ignore stored completion). Both must be `false` before release.
- Typed routes enabled (`app.json` -> `experiments.typedRoutes`).

## Auth (`lib/auth.ts`, `lib/auth-session.tsx`)
- Supabase OAuth with Google and Apple, redirect to `booksummaries://auth/callback`.
- `AuthSessionProvider` exposes `useAuthSession()` -> `{ session, isLoading, signOut }`.
- Supabase client (`lib/supabase.ts`) persists sessions in AsyncStorage, `detectSessionInUrl: false`, autoRefresh on.
- Login + register screens use brand palette (Persian orange buttons/links, cream surfaces, grey text).

## Config / Env (`constants/config.ts`)
- `readConfigValue` returns env value; in dev (`__DEV__`) falls back to placeholder, in prod throws if missing.
- Public (client) vars are `EXPO_PUBLIC_*`; server-only secrets (service role, R2 keys, Apple shared secret) live in `.env` (see `.env.example`) and are used by edge functions, NOT the client.
- Key vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, R2 public vars, app scheme, store IDs.

## Onboarding (`app/(onboarding)/index.tsx`, `lib/onboarding.ts`)
Premium animated 7-step flow (~1700 lines) with Reanimated:
1. **Goals** (multi-select cards) — FadeInDown stagger entrance, animated check-circles
2. **Categories/genres** (multi-select cards) — FadeInDown stagger entrance
3. **Reading time** (single-select pills: 5min/15min/30min/1hr+) — ZoomIn pop-in effect
4. **Reading time of day** (single-select cards: morning/afternoon/evening/night) — BounceIn entrance
5. **Book picks** (gesture-driven swipe deck) — Pan gesture with velocity-aware spring exit, rotation, stacked depth cards, SAVE (Persian orange) / SKIP (sea mint) stamps. Like = Persian orange filled circle, dislike = sea mint filled circle.
6. **"Preparing"** (animated progress + checklist) — shimmer sweep, pulsing active dot, spring-in checkmarks
7. **Subscription paywall** (annual/monthly, free trial) — staggered entrance, animated plan selection ring + radio dot, floating CTA with bob animation

Animation details:
- Step transitions: `SlideInRight` (content slides in from the side).
- Floating CTA: Persian orange, gentle bob loop, strong accent glow shadow, spring scale on press.
- Art image (`login-art.png`) sits behind content on mobile (40% opacity + cream overlay) so there's no empty page.
- Responsive: split desktop layout at `WIDE_BREAKPOINT = 768`, mobile scroll otherwise.
- Progress bar: thin pill track, spring-filled, "Step X of 5" (shows on steps 0–4).

On completion:
- `saveUserPreferences(goals, genres, readingTime, readingTimeOfDay)` upserts to Supabase `user_preferences` with `onboarding_completed: true`.
- `saveBookLikes(likes)` upserts to `user_book_likes`.
- `setOnboardingCompleted()` writes local AsyncStorage flag (`book_summaries_onboarding_complete`).

Onboarding completion check (`getOnboardingCompleted`):
- Checks **database first** (`user_preferences.onboarding_completed` for the signed-in user) — so returning users on new devices skip onboarding.
- Falls back to AsyncStorage if offline / no session.

## Subscriptions / IAP (`lib/iap.ts`)
- `validateReceipt(platform, receipt_data, product_id)` invokes `validate-iap` edge function.
- Errors: `InvalidReceiptError` (invalid_receipt), `IapValidationError`.

## Audio (`lib/r2.ts`)
- `getAudioUrl(chapter_id)` invokes `get-audio-url` edge function, returns a signed R2 URL.
- Subscription-gated: throws `SubscriptionRequiredError` when access denied, `AudioUrlError` otherwise.

## Database (`supabase/migrations/`)
Migrations (apply in order):
- `0001_init` — core tables + RLS + `updated_at` triggers
- `0002_rls_policies` — additional RLS policies
- `0003_edge_function_fields` — fields used by edge functions
- `0004_chapters` — chapters table
- `0005_user_preferences` — `user_preferences`, `user_book_likes` (onboarding data)
- `0006_reading_time_fields` — adds `reading_time`, `reading_time_of_day` columns to `user_preferences`

Core tables:
- `users` (mirrors `auth.users`), `books`, `summaries` (audio_object_key, audio_public_url, duration), `subscriptions` (platform/status/receipt/period), `progress` (per user+book position/percent/completed).
- `user_preferences` (goals[], genres[], reading_time, reading_time_of_day, onboarding_completed), `user_book_likes` (per-title liked flag).

Conventions:
- All tables have RLS enabled; users can only read/write their own rows; `books`/`summaries` readable by any authenticated user.
- `set_updated_at()` trigger keeps `updated_at` fresh on every table.
- Default content language `'te'` (Telugu).

## Edge Functions (`supabase/functions/`)
- `validate-iap` — verifies App Store / Play receipts, updates `subscriptions`. (review before relying on)
- `get-audio-url` — checks subscription, returns signed R2 URL for a chapter. (review before relying on)

## Conventions / Style
- TypeScript throughout; React function components with hooks.
- Styling via `StyleSheet.create`; central palette in `constants/colors.ts` (4-color brand: Persian orange, sea mint, light cream, grey).
- Server logic and secrets stay in edge functions; client only uses anon key + `EXPO_PUBLIC_*` vars.
- Errors surfaced as typed Error subclasses in `lib/*` wrappers.
- No hardcoded hex colors in app code — all colors come from `constants/colors.ts`.

---

## Status: Done vs TODO

### Done & polished
- [x] **Auth scaffolding** — OAuth (Google + Apple), session context, deep-link callback, login + register screens with brand palette
- [x] **Onboarding flow** — 7-step premium animated flow with Reanimated (goals, categories, reading time, reading time of day, book swipe deck, preparing, subscription paywall)
- [x] **Brand palette** — strict 4-color policy (Persian orange, sea mint, light cream, grey) enforced across all screens; dark theme defined
- [x] **Animations** — SlideInRight step transitions, ZoomIn/BounceIn/FadeInDown per-step effects, gesture-driven swipe deck, floating CTA with bob, shimmer progress, spring physics throughout
- [x] **Art backdrop on mobile** — login-art.png behind onboarding content so no empty page
- [x] **Env/config handling** — dev placeholders, prod throws on missing
- [x] **DB schema + RLS** — 6 migrations, all tables RLS-enabled, user_preferences with onboarding_completed flag
- [x] **Onboarding persistence** — DB-first completion check (returns skip onboarding for returning users on new devices), AsyncStorage fallback, saves goals/genres/reading_time/reading_time_of_day/book_likes
- [x] **Edge-function client wrappers** — `lib/iap.ts`, `lib/r2.ts` with typed errors
- [x] **Dev flags** — `constants/dev-flags.ts` with `BYPASS_LOGIN` + `FORCE_ONBOARDING` (shared across index + login + register)
- [x] **DB migrations applied** — all 6 migrations applied to live Supabase project ("Book Summary"): `user_preferences` (goals[], genres[], reading_time, reading_time_of_day, onboarding_completed) + `user_book_likes` tables with RLS policies, indexes, and `set_updated_at` trigger

### TODO

- [ ] **Turn off dev flags before release** — set `BYPASS_LOGIN = false` and `FORCE_ONBOARDING = false` in `constants/dev-flags.ts`
- [ ] **`(tabs)/index` (Home/browse)** — main browse screen, book grid, search, category filters [STUB ~21 lines]
- [ ] **`(tabs)/library`** — user's saved books, reading progress, collections [STUB ~22 lines]
- [ ] **`(tabs)/profile`** — account settings, subscription status, sign out, theme toggle [STUB ~32 lines]
- [ ] **`book/[id]`** — book detail page (cover, summary, chapters list, play button) [STUB ~25 lines]
- [ ] **`player/[id]`** — audio player (playback controls, progress scrub, chapter navigation) [STUB ~25 lines]
- [ ] **`components/AudioPlayer`** — reusable audio playback component [STUB ~10 lines]
- [ ] **`components/BookCard`** — reusable book card for grids/lists [STUB ~11 lines]
- [ ] **`components/SubscriptionGate`** — paywall wrapper for non-subscribers [STUB ~9 lines]
- [ ] **Wire dark theme** — `colors` currently exports `light`; add `useColorScheme()`-driven provider or manual toggle to switch to `getTheme("dark")`
- [ ] **Edge function review** — `validate-iap` and `get-audio-url` need security/correctness review before relying on them
- [ ] **Seed data** — populate `books` and `summaries` tables with Telugu book summaries + R2 audio keys
- [ ] **App icon + splash screen** — configure in `app.json` with brand palette
- [ ] **Telugu localization** — UI strings currently in English; add Telugu translations
