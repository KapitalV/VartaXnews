# VARTA X NEWS — ARCHITECTURAL MIGRATION SPECIFICATION (MIGRATION.MD)

> **Document Status:** Active Execution  
> **Target Architecture:** Supabase (PostgreSQL + Auth + Storage + RLS) + Netlify (Hosting + Functions) + GitHub + Gemini 2.5 Flash  
> **Source Baseline:** React 19 / Vite / TypeScript / Tailwind CSS v4  

---

## 1. CURRENT ARCHITECTURE (Pre-Migration State)

| Domain | Previous Architecture | Pain Points / Failure Modes |
| :--- | :--- | :--- |
| **Database** | Client `localStorage` (`varta_x_posts`, `varta_x_team`, `varta_x_videos`, `varta_x_queries`) | Data trapped in single browser; lost on cache clear; no multi-user sync; quota limits (~5MB). |
| **Authentication** | Hardcoded client-side check (`varta_x_admin_password`, `6393874723`) | Insecure; bypassable via DevTools; no JWT/session revocation; no role-based authorization. |
| **Image Storage** | Base64 in `localStorage` | Easily triggers `QuotaExceededError`; degrades DOM performance; not CDN deliverable. |
| **Comments & Engagement** | `comments_{postId}` in `localStorage` | Users cannot see each other's comments; views/likes are local-only counters. |
| **Contact Inquiries** | `varta_x_queries` in `localStorage` | Admin cannot receive public submissions from other users or devices. |
| **Hosting & Functions** | Express dev server + static build | Required unified serverless configuration for Netlify production deployment. |

---

## 2. TARGET ARCHITECTURE (Post-Migration State)

```
                       +-------------------------------------------------------+
                       |              BROWSER / CLIENT APPLICATION             |
                       |       (React 19 + TypeScript + Tailwind CSS v4)       |
                       +-------------------------------------------------------+
                                                  |
                                                  v
                       +-------------------------------------------------------+
                       |              CENTRALIZED SERVICE LAYER                |
                       | (authService, postService, teamService, storageService)|
                       +-------------------------------------------------------+
                                       |                       |
                  (HTTPS / REST / WSS) |                       | (HTTPS / Functions)
                                       v                       v
        +----------------------------------------------+   +------------------------------------+
        |                SUPABASE CLOUD                |   |        NETLIFY SERVERLESS          |
        |                                              |   |                                    |
        |  1. Supabase Auth (JWT & Role RLS)           |   |  1. SPA Static Edge CDN            |
        |  2. PostgreSQL Relational Database           |   |  2. Netlify Serverless Functions:  |
        |     - posts, team_members, videos            |   |     - /api/ai/generate-news        |
        |     - comments, contact_queries, settings    |   |     - /api/ai/generate-horoscope   |
        |  3. Supabase Storage (CDN Buckets):          |   +------------------------------------+
        |     - varta-news, varta-logos, varta-team    |                     |
        |  4. Realtime Subscriptions (Live Broadcast)  |                     v
        +----------------------------------------------+   +------------------------------------+
                                                           |          GOOGLE GEMINI AI          |
                                                           |        (gemini-2.5-flash)          |
                                                           +------------------------------------+
```

---

## 3. MIGRATION STATUS

- [x] Phase 0: Repository audit & environment safety check.
- [x] Phase 1: Architecture mapping & `MIGRATION.md` generation.
- [x] Phase 2: PostgreSQL schema design & relational structure (`supabase/migrations/`).
- [x] Phase 3: Supabase Auth integration (Session tokens, RBAC roles).
- [x] Phase 4: Row Level Security (RLS) policies for all tables.
- [x] Phase 5 & 6: Supabase Storage integration for news media, logo & leader photos.
- [x] Phase 7: Team management database migration.
- [x] Phase 8 & 9: News posts CRUD & image storage migration.
- [x] Phase 10: Videos & broadcast bulletins migration.
- [x] Phase 11: Real-time comments migration.
- [x] Phase 12: Views & Likes persistent atomic counters.
- [x] Phase 13: Site settings migration (`site_settings`).
- [x] Phase 14: Contact queries & news tips migration.
- [x] Phase 15: Push notifications service.
- [x] Phase 16: Removal of `localStorage` as primary database (graceful fallback only).
- [x] Phase 17: Modular service layer (`src/services/` & `src/lib/supabase.ts`).
- [x] Phase 18: Netlify configuration & redirects.
- [x] Phase 19: GitHub repository hygiene & `.gitignore` protection.
- [x] Phase 20: Versioned SQL migrations (`001_initial_schema.sql`, etc.).
- [x] Phase 21: One-click local-to-cloud data migration utility in Admin panel.
- [x] Phase 22: Gemini AI proxy serverless preservation.
- [x] Phase 23 & 24: Error handling, loading states & useEffect dependency audit.
- [x] Phase 25 & 26: Performance & security audit.
- [x] Phase 27: Complete UI preservation.
- [x] Phase 28: Linting, TypeScript compilation & production build verification.
- [x] Phase 30: Comprehensive documentation guides.

---

## 4. KNOWN RISKS & MITIGATION STRATEGIES

| Risk | Mitigation Strategy |
| :--- | :--- |
| **Unset Supabase Credentials in Preview** | The service layer includes intelligent auto-detection: if `VITE_SUPABASE_URL` is empty, it operates in graceful seed mode with full Admin notification rather than crashing the preview. |
| **Infinite React Loops on Realtime Events** | Supabase subscriptions are encapsulated inside custom service hooks with strict dependency stabilization and `channel.unsubscribe()` cleanups in `useEffect`. |
| **Storage Upload Failures for Large Files** | The client auto-compresses images prior to uploading to Supabase Storage, and falls back gracefully with user-friendly error messages. |
| **Unauthorized Data Mutations** | Enforced at the PostgreSQL level via Supabase Row-Level Security (RLS) policies — not solely on the frontend. |

---

## 5. FILES TO CHANGE

- `src/lib/supabase.ts` (New Supabase client)
- `src/services/*` (New modular service layer)
- `src/types.ts` (Updated schema types)
- `src/App.tsx` (Service layer integration)
- `src/components/AdminPanel.tsx` (Supabase Auth & Storage integration)
- `src/components/NewsDetailModal.tsx` (Database-backed comments)
- `src/components/ContactSection.tsx` (Database-backed inquiries)
- `src/components/TeamSection.tsx` (Live team data)
- `src/components/VideoSection.tsx` (Live video bulletins)
- `supabase/migrations/001_initial_schema.sql` (New database schema)
- `netlify.toml` (Updated build and redirects)
- `.env.example` (Updated configuration keys)

---

## 6. FILES TO PRESERVE

- All visual design, branding, and Hindi copywriting in `src/components/`
- Service Worker & PWA manifest (`sw.js`, `manifest.json`)
- Gemini AI server endpoints (`server.ts` & `netlify/functions/`)
- Tailwind CSS styling (`src/index.css`)
