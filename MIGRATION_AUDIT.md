# Varta X News Supabase Migration Audit

## Overall Status
**PARTIAL (Hybrid Dual-State)**

The architecture currently operates in a **hybrid fallback mode**:
- Supabase services (`postService`, `teamService`, `videoService`, `commentService`, `queryService`, `settingsService`, `storageService`, `authService`) are written and include Supabase calls.
- **However**, the application still heavily relies on `localStorage` and `src/data.ts` as a parallel write mirror, read fallback, and for several critical features (including Profile Photo, Channel Logo, and Admin Password Management).
- If Supabase environment variables are missing, unauthenticated, or if media is uploaded through standard file readers, the application silently defaults to local browser storage, causing discrepancies between local and live production environments.

---

## Architecture

### OLD:
```
React / Vite
    ↓
localStorage / src/data.ts (Mock Static Arrays)
    ├── varta_x_posts
    ├── varta_x_team
    ├── varta_x_videos
    ├── varta_x_queries
    ├── varta_channel_logo (Base64)
    ├── varta_ansh_photo (Base64)
    └── varta_x_admin_password / varta_x_admin_phone
```

### CURRENT (Hybrid / Dual-State):
```
React UI Components
    ↓
Service Layer (src/services/*.ts)
    ├── If Supabase configured → Attempt PostgreSQL Query / Realtime Channel
    └── Always Mirror / Fallback → localStorage (src/data.ts)
    ↓
Media Uploads (AdminPanel.tsx)
    └── FileReader.readAsDataURL() → Base64 in localStorage & JSONB site_settings
        (Bypasses Supabase Storage Bucket upload!)
    ↓
Admin Authentication (AdminPanel.tsx)
    ├── Login: Attempts Supabase Auth with hardcoded credential fallback
    └── Password Change: Saves only to localStorage ('varta_x_admin_password')
```

### TARGET (Full Cloud Native):
```
React 18 / Vite Client (Netlify CDN)
    ↓
Supabase Backend
    ├── PostgreSQL (Single Source of Truth for Posts, Team, Videos, Queries, Settings)
    ├── Supabase Storage (CDN URLs for News Images, Channel Logo, Leader/Team Photos)
    ├── Supabase Auth & RLS (Session JWT, RBAC via public.profiles)
    └── Realtime Channels (PostgreSQL Replication Stream)
    ↓
Local Storage Role
    └── ONLY transient UI preferences & offline service worker cache (NO primary persistence)
```

---

## Feature Migration

| Feature | Old Source | New Source | Status |
| :--- | :--- | :--- | :--- |
| **News Posts** | `localStorage ('varta_x_posts')` / `INITIAL_POSTS` | `supabase.from('posts')` | **PARTIAL** (Dual-read with local write mirror) |
| **Team Directory** | `localStorage ('varta_x_team')` / `INITIAL_TEAM` | `supabase.from('team_members')` | **PARTIAL** (Dual-read with local write mirror) |
| **Profile Photo** | `localStorage ('varta_ansh_photo')` | `supabase.storage ('varta-team')` + `site_settings` | **NOT COMPLETE** (Saved as Base64 in local state/storage; bypassed storage bucket) |
| **Videos** | `localStorage ('varta_x_videos')` / `INITIAL_VIDEOS` | `supabase.from('videos')` | **PARTIAL** (Dual-read with local write mirror) |
| **Comments** | `localStorage ('comments_${postId}')` | `supabase.from('comments')` | **PARTIAL** (Supabase first with local fallback) |
| **Likes** | `savePosts()` to `localStorage` | `supabase.rpc('increment_post_likes')` | **PARTIAL** (RPC implemented, local fallback maintained) |
| **Views** | `savePosts()` to `localStorage` | `supabase.rpc('increment_post_views')` | **PARTIAL** (RPC implemented, local fallback maintained) |
| **Channel Logo** | `localStorage ('varta_channel_logo')` | `supabase.storage ('varta-logos')` + `site_settings` | **NOT COMPLETE** (Saved as Base64 in local storage; bypassed storage bucket) |
| **Site Settings** | `localStorage` keys | `supabase.from('site_settings')` | **PARTIAL** (JSONB table exists, but values double-stringified) |
| **Contact Queries** | `localStorage ('varta_x_queries')` | `supabase.from('contact_queries')` | **PARTIAL** (Direct localStorage reads still exist in AdminPanel) |
| **Authentication** | Hardcoded `Ansh@2012` in `localStorage` | `supabase.auth` + `public.profiles` | **PARTIAL** (Password change only updates localStorage) |

---

## Remaining localStorage

| File | Line | Purpose | Old System / New System | Must Change? |
| :--- | :--- | :--- | :--- | :--- |
| `src/data.ts` | 91, 100, 111, 116 | Cache/Store news posts (`varta_x_posts`) | Old System (`localStorage`) | **YES** (Shift to cache-only or remove) |
| `src/data.ts` | 120, 152, 158, 163 | Cache/Store team members (`varta_x_team`) | Old System (`localStorage`) | **YES** (Shift to cache-only or remove) |
| `src/data.ts` | 196, 207, 212 | Cache/Store videos (`varta_x_videos`) | Old System (`localStorage`) | **YES** (Shift to cache-only or remove) |
| `src/components/AdminPanel.tsx` | 81, 433 | Admin phone input state initialization | Old System (`varta_x_admin_phone`) | **YES** (Should load from Supabase `profiles`) |
| `src/components/AdminPanel.tsx` | 219, 229 | Fallback queries reading & deletion | Old System (`varta_x_queries`) | **YES** (Use `queryService` exclusively) |
| `src/components/AdminPanel.tsx` | 413, 431 | Admin password verification & storage | Old System (`varta_x_admin_password`) | **YES** (Use `supabase.auth.updateUser`) |
| `src/components/AdminPanel.tsx` | 981 | Reset channel logo button | Old System (`varta_channel_logo`) | **YES** (Update `site_settings` via service) |
| `src/services/postService.ts` | 50, 59, 114, 132, 149 | Fallback read & write mirroring | Hybrid | **YES** (Make Supabase primary, isolate local caching) |
| `src/services/teamService.ts` | 35, 43, 47, 76 | Fallback read & write mirroring | Hybrid | **YES** (Make Supabase primary) |
| `src/services/videoService.ts` | 38, 46, 92, 99 | Fallback read & write mirroring | Hybrid | **YES** (Make Supabase primary) |
| `src/services/commentService.ts`| 41, 98, 102 | Per-post comment caching | Hybrid | **YES** (Make Supabase primary) |
| `src/services/queryService.ts` | 46, 81, 95, 99 | Contact query caching & persistence | Hybrid | **YES** (Make Supabase primary) |
| `src/services/settingsService.ts` | 43, 44, 75, 79 | Logo & leader photo fallback | Hybrid | **YES** (Use Supabase `site_settings` & Storage) |

---

## Supabase Tables

| Table | Primary Key | Key Columns | Purpose | Status in Code |
| :--- | :--- | :--- | :--- | :--- |
| `public.profiles` | `id (UUID)` | `email`, `full_name`, `role`, `phone`, `avatar_url` | Admin & reporter credentials / RBAC | **Defined in SQL & authService**, but AdminPanel uses localStorage for password change |
| `public.categories` | `id (TEXT)` | `name_hi`, `name_en`, `slug`, `display_order` | News categories | **Defined in SQL & seeded**, read via categories |
| `public.posts` | `id (TEXT)` | `title`, `content`, `category`, `image_url`, `author_name`, `is_breaking`, `views`, `likes`, `status` | News articles | **Full CRUD in postService** |
| `public.team_members` | `id (TEXT)` | `name`, `role`, `image_url`, `bio`, `phone`, `email`, `display_order`, `is_active` | Editorial board & field reporters | **Full CRUD in teamService** |
| `public.videos` | `id (TEXT)` | `title`, `description`, `video_url`, `views`, `likes`, `category`, `duration`, `author_name`, `is_live` | Video bulletins | **Full CRUD in videoService** |
| `public.comments` | `id (UUID)` | `post_id`, `author_name`, `content`, `status`, `created_at` | Reader article comments | **Full CRUD in commentService** |
| `public.contact_queries` | `id (TEXT)` | `name`, `phone`, `email`, `message`, `status`, `created_at` | Reporter applications & reader tips | **Full CRUD in queryService** |
| `public.site_settings` | `key (TEXT)` | `value (JSONB)`, `description`, `updated_at` | Global channel logo, leader photo, metadata | **Active in settingsService**, but stores raw Base64 instead of CDN URLs |

---

## Supabase Storage

| Bucket Name | Public Access | Purpose | Status in Application |
| :--- | :--- | :--- | :--- |
| `varta-news` | **Public** | Article cover thumbnails | Supported via `storageService.ts` (`uploadMediaFile`), used in news creator |
| `varta-logos` | **Public** | Main channel header logos | Configured in SQL, **NOT used in AdminPanel logo upload** (FileReader Base64 used instead) |
| `varta-team` | **Public** | Leader (Hradyansh Gupta) & reporter photos | Configured in SQL, **NOT used in AdminPanel photo upload** (FileReader Base64 used instead) |
| `varta-media` | **Public** | General press assets & ID cards | Configured in SQL, helper available in `storageService.ts` |

---

## RLS (Row Level Security)

| Table / Resource | RLS Enabled | Policies Present | Security Analysis |
| :--- | :--- | :--- | :--- |
| `public.profiles` | **YES** | Public read, self update | Secure |
| `public.categories` | **YES** | Public read, Admin write | Secure |
| `public.posts` | **YES** | Public read (published), Admin/Editor write | Secure |
| `public.team_members` | **YES** | Public read, Admin/Editor write | Secure |
| `public.videos` | **YES** | Public read, Admin/Editor write | Secure |
| `public.comments` | **YES** | Public read (approved), Public insert, Admin moderate | Secure |
| `public.contact_queries`| **YES** | Public insert, Authenticated read/manage | Secure |
| `public.site_settings` | **YES** | Public read, Authenticated update | Secure |
| `storage.objects` | **YES** | Public read for 4 buckets, Authenticated insert/update/delete | Secure |

---

## Netlify Configuration

### Configuration Status:
- `netlify.toml` correctly sets `publish = "dist"`, `command = "npm run build"`, and proxies AI endpoints to `netlify/functions`.

### Required Environment Variables on Netlify Dashboard:
1. `VITE_SUPABASE_URL`: `https://<your-project-ref>.supabase.co`
2. `VITE_SUPABASE_ANON_KEY`: `<your-anon-public-key>`
3. `GEMINI_API_KEY`: `<gemini-api-key>` (For AI news & horoscope generation serverless functions)

*Note: In Vite client applications, any environment variable accessed in the browser MUST have the `VITE_` prefix. Without these variables configured in Netlify's Environment settings, the compiled browser bundle evaluates `import.meta.env.VITE_SUPABASE_URL` as undefined and drops into localStorage fallback mode.*

---

## Profile Photo Root Cause Analysis

### Why New Photo Appears LOCALLY:
1. When the administrator uploads a new photo in the Admin Panel (`handleAnshPhotoUpload`), `FileReader.readAsDataURL()` turns the image file into a local Base64 string (`data:image/jpeg;base64,...`).
2. The Admin Panel updates React state in memory (`setAnshPhoto`) and writes the Base64 string to the local browser's storage via `localStorage.setItem('varta_ansh_photo', ...)`.
3. The current browser immediately renders this Base64 string because it is present in the admin's local storage and React state.

### Why Old Photo Appears on LIVE Production (Visitors / Other Devices):
1. **Never Uploaded to Supabase Storage**: The upload handler in `AdminPanel.tsx` never calls `uploadMediaFile(file, 'varta-team')`. Therefore, the actual image file is never transmitted to the Supabase CDN.
2. **Local Storage Isolation**: Visitors loading the live website on another device have an empty `localStorage`.
3. **Double-Encoding / Unconfigured Supabase Fallback**:
   - In `settingsService.ts`, when `updateSetting('ansh_photo', value)` runs, it calls `JSON.stringify(value)` into a JSONB column. When fetched back, `resolveImageUrl` receives stringified quotes.
   - If Supabase environment variables are not yet bound in the Netlify build, `fetchSiteSettings()` immediately falls back to `localStorage.getItem('varta_ansh_photo') || '/input_file_6.png'`.
   - On a visitor's device, `localStorage` is empty, so it resolves to `/input_file_6.png`, which maps to the hardcoded SVG vector artwork in `imageHelper.ts`.

---

## Critical Issues

### P0 (Blocking Full Cloud Production):
1. **Profile Photo & Logo Storage Bypass**: `AdminPanel.tsx` uses `FileReader.readAsDataURL()` instead of `uploadMediaFile()` from `storageService.ts`. Images are never hosted on Supabase Storage CDN.
2. **Admin Password Change Disconnect**: Password changes in `AdminPanel.tsx` are written exclusively to `localStorage.setItem('varta_x_admin_password', ...)` and never update the Supabase Auth user or `public.profiles` table.

### P1 (High Priority Architectural Gaps):
1. **Double JSON-Encoding in `site_settings`**: `updateSetting()` runs `JSON.stringify(value)` on values before sending them to a PostgreSQL `JSONB` column, leading to double-escaped strings when read back.
2. **Contact Queries Direct LocalStorage Access**: `AdminPanel.tsx` (lines 219, 229) has legacy inline `localStorage.getItem('varta_x_queries')` calls instead of routing exclusively through `fetchContactQueries()` / `deleteContactQuery()`.

### P2 (Cleanup & Hygiene):
1. **`src/data.ts` Mock Dependency**: `postService`, `teamService`, and `videoService` still import `getStoredPosts`, `getStoredTeam`, and `getStoredVideos` for parallel writes.
2. **Migration Service Redundancy**: `syncLocalDataToSupabase` in `migrationService.ts` relies on initial mock data from `data.ts`.

---

## Recommended Fix Order

1. **Fix Image Upload Pipelines in Admin Panel**:
   - Update `handleAnshPhotoUpload`, `handleLogoUpload`, and `handleMemberPhotoUpload` in `AdminPanel.tsx` to call `uploadMediaFile(file, bucket)` via Supabase Storage.
   - Save the resulting HTTPS CDN URL (`https://...supabase.co/storage/v1/object/public/...`) to `site_settings` and `team_members`.
2. **Fix Site Settings Value Serialization**:
   - Remove redundant `JSON.stringify` on plain string settings in `settingsService.ts`.
3. **Migrate Password Management to Supabase Auth**:
   - Connect the password change form in `AdminPanel.tsx` to `supabase.auth.updateUser({ password: newPassword })` and update `public.profiles`.
4. **Standardize All Inquiries to `queryService`**:
   - Remove direct `localStorage` access in `AdminPanel.tsx` lines 219-229.
5. **Decouple Services from `src/data.ts`**:
   - Transition `postService`, `teamService`, and `videoService` to treat Supabase PostgreSQL as the primary source of truth, using client memory or Service Worker cache strictly for offline resilience.
