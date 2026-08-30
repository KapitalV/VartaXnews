# VARTA X NEWS — MASTER ARCHITECTURAL REFERENCE & PROJECT SPECIFICATION (MASTER.MD)

> **Document Version:** 2.0.0 (Production Master)  
> **Project Name:** Varta X News Media Live (वार्ता एक्स न्यूज़)  
> **Primary Location & Regional Focus:** Jhansi, Bundelkhand, Uttar Pradesh, & National India  
> **Stack:** React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + Express Node.js + Supabase PostgreSQL + Google Gemini 2.5 Flash + Netlify Functions + PWA  
> **Audience:** AI Agents, Developers, DevOps Engineers, and System Architects  

---

## 1. EXECUTIVE SUMMARY & SYSTEM OVERVIEW

**Varta X News** is an enterprise-grade, real-time Hindi digital news portal and multimedia broadcasting platform. It delivers regional grassroots journalism from Bundelkhand (Jhansi, Lalitpur, Orai, Jalaun), state-level coverage across Uttar Pradesh, national headlines, crime files, sports, entertainment, and Vedic astrological forecasts (Jyotish & Panchang).

### Core Architectural Pillars
1. **Hybrid Cloud + Offline-First Architecture**: Features seamless dual-layer persistence. When Supabase PostgreSQL credentials are configured, the app acts as a real-time cloud-synchronized application. When offline or unconfigured, it automatically falls back to an in-browser storage engine (`localStorage`) without breaking the UI.
2. **Production-Ready Dual Deployment Pipeline**:
   - **Full-Stack Node.js Mode**: Runs on container environments (Google Cloud Run / Linux VPS) using Express 4.x + Vite middleware and compiled `dist/server.cjs` via `esbuild`.
   - **Serverless Static + Netlify Functions Mode**: Runs on static CDNs (Netlify / Vercel) with dedicated serverless functions (`netlify/functions/generate-news.ts`, `generate-horoscope.ts`) and SPA rewrite routing (`netlify.toml`).
3. **AI-Powered Autonomous Journalism**: Deeply integrates the Google GenAI SDK (`@google/genai`) using **Gemini 2.5 Flash** for:
   - Automated Hindi news report generation adhering to strict journalistic ethics.
   - Real-time Vedic astrological predictions for all 12 Zodiac signs (Rashis) with Panchang calculations.
4. **PWA & Native Media Features**: Native Service Worker (`sw.js`) and Web App Manifest (`manifest.json`), Web Speech API for Hindi text-to-speech audio reader, Web Audio API synthesized alert sound chimes, and YouTube live broadcast streaming.

---

## 2. COMPLETE FILE TREE & DIRECTORY STRUCTURE

```
/ (Workspace Root)
├── .env.example                       # Environment variables template
├── .gitignore                         # Git ignore rules
├── .node-version                      # Node engine spec (v22)
├── .nvmrc                             # NVM version spec (v22)
├── FRONTEND_REDESIGN_PLAN.md          # Frontend architecture specifications
├── MASTER.md                          # THIS MASTER REFERENCE MANUAL (Single Source of Truth)
├── MIGRATION.md                       # Migration documentation
├── MIGRATION_AUDIT.md                 # Migration audit logs
├── SUPABASE_SCHEMA.md                 # Supabase SQL schema definitions
├── index.html                         # Entry HTML with SEO & OpenGraph meta tags
├── manifest.json                      # PWA Web App Manifest
├── metadata.json                      # AI Studio Applet capabilities and permissions
├── netlify.toml                       # Netlify build, redirects, and headers config
├── package.json                       # Dependencies, scripts, and build pipeline
├── server.ts                          # Express backend server with Vite dev middleware
├── sw.js                              # PWA Service Worker for offline caching
├── tsconfig.json                      # TypeScript compiler configuration
├── tsconfig.node.json                 # TypeScript config for Node/Vite tools
├── vite.config.ts                     # Vite build configuration with Tailwind CSS plugin
│
├── netlify/
│   └── functions/
│       ├── generate-horoscope.ts      # Netlify serverless function for AI horoscope
│       └── generate-news.ts           # Netlify serverless function for AI news generation
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql     # PostgreSQL database tables, indexes & RLS policies
│
├── src/
│   ├── main.tsx                       # React 19 application entry point
│   ├── App.tsx                        # Main state orchestrator & section switcher
│   ├── index.css                      # Global Tailwind CSS v4 styling & typography
│   ├── types.ts                       # Shared TypeScript interfaces & models
│   ├── data.ts                        # Initial seed data & local fallback storage engine
│   │
│   ├── lib/
│   │   └── supabase.ts                # Supabase client singleton, connection tester & storage
│   │
│   ├── services/
│   │   ├── authService.ts             # Admin authentication service (Supabase + local)
│   │   ├── commentService.ts          # Reader comments service (Supabase + local)
│   │   ├── migrationService.ts        # 1-Click Local-to-Cloud sync & schema generator
│   │   ├── postService.ts             # News posts CRUD service (Supabase + local)
│   │   ├── queryService.ts            # Contact inquiries & tips service (Supabase + local)
│   │   ├── settingsService.ts         # Channel branding & photos service (Supabase + local)
│   │   ├── storageService.ts          # Cloud media upload service (Supabase Storage bucket)
│   │   ├── teamService.ts             # Editorial board & team service (Supabase + local)
│   │   └── videoService.ts            # Video bulletins & live TV service (Supabase + local)
│   │
│   ├── components/
│   │   ├── AdminPanel.tsx             # Complete editorial CMS studio (Light Theme)
│   │   ├── AppDownloadSection.tsx     # PWA installation guide & triggers
│   │   ├── BreakingTicker.tsx         # High-contrast live breaking news marquee ticker
│   │   ├── CategoryNavBar.tsx         # Sticky category navigation bar with Hindi chips
│   │   ├── ContactSection.tsx         # Citizen journalism, tips form & poster gallery
│   │   ├── EditorialFooter.tsx        # Comprehensive footer with links, disclaimer & credits
│   │   ├── HeroLeadStory.tsx          # Premium top lead story hero with TTS reader & share
│   │   ├── HoroscopeSection.tsx       # 12 Vedic Rashis, Rashi Finder, Panchang & AI forecast
│   │   ├── LatestNewsFeed.tsx         # Main news grid with category filters & search
│   │   ├── MainHeader.tsx             # Brand header with logo, live clock, search & login
│   │   ├── NewsCard.tsx               # Individual news card with TTS audio reader & share
│   │   ├── NewsDetailModal.tsx        # Full article reader modal with comments section
│   │   ├── NotificationOverlay.tsx    # Breaking news toast & Web Audio chime generator
│   │   ├── TeamSection.tsx            # Leadership (Hradyansh Gupta) & editorial staff
│   │   ├── TopUtilityBar.tsx          # Utility bar with weather, date/time & trending tags
│   │   ├── TrendingSidebar.tsx        # Sidebar with trending stories & e-Paper promo
│   │   └── VideoSection.tsx           # Video player, live TV archive & simulated live chat
│   │
│   └── utils/
│       └── imageHelper.ts             # Dynamic image URL resolver & SVG fallback generator
```

---

## 3. TECH STACK & DEPENDENCY MATRIX

### Production Dependencies (`package.json`)
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `react` / `react-dom` | `^19.0.1` | Core UI library (React 19) |
| `@supabase/supabase-js` | `^2.112.3` | Supabase PostgreSQL client & real-time sync |
| `@google/genai` | `^2.4.0` | Official Google GenAI TypeScript SDK (Gemini 2.5 Flash) |
| `express` | `^4.21.2` | Backend Node.js server for API proxying & SSR fallback |
| `lucide-react` | `^0.546.0` | High-quality icon set used across the application |
| `motion` | `^12.23.24` | Modern UI animation library (`motion/react`) |
| `dotenv` | `^17.2.3` | Environment variable management in Node.js |
| `vite` | `^6.2.3` | Fast frontend bundler and dev server |
| `@tailwindcss/vite` | `^4.1.14` | Tailwind CSS v4 Vite integration |

### Development Dependencies
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `typescript` | `~5.8.2` | Static type checking and safety |
| `tsx` | `4.19.3` | Direct TypeScript execution for dev server |
| `esbuild` | `0.25.0` | High-speed server bundler for production `dist/server.cjs` |
| `@netlify/functions` | `^5.3.0` | Netlify Serverless functions TypeScript runtime |
| `tailwindcss` | `^4.1.14` | Utility-first CSS styling engine |

---

## 4. ENVIRONMENT VARIABLES & SECRETS SPECIFICATION

All environment variables are declared in `.env.example`:

```env
# Google Gemini API Key (Server-side & Netlify functions only - NEVER expose to browser)
GEMINI_API_KEY=

# Supabase PostgreSQL Database & Real-Time Cloud Storage
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Application Server Port (Defaults to 3000)
PORT=3000
NODE_ENV=production
```

### Security Directives for AI Agents:
- **`GEMINI_API_KEY`**: Must **NEVER** be prefixed with `VITE_`. It is strictly accessed server-side in `server.ts` or in `netlify/functions/*.ts`.
- **`VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`**: Safe for client-side usage via `import.meta.env` as they interact with Supabase Row Level Security (RLS) policies.
- In Admin Panel (`src/components/AdminPanel.tsx`), the user can also paste Supabase credentials interactively; they are securely persisted in `localStorage` under `varta_supabase_config` and hot-injected into the active Supabase client.

---

## 5. DATABASE ARCHITECTURE (SUPABASE POSTGRESQL)

The application uses a 7-table relational schema defined in `supabase/migrations/001_initial_schema.sql`:

### Database Tables:

1. **`varta_news_posts`**:
   - `id` (TEXT PRIMARY KEY)
   - `title` (TEXT NOT NULL)
   - `content` (TEXT NOT NULL)
   - `category` (TEXT NOT NULL)
   - `author` (TEXT NOT NULL)
   - `image_url` (TEXT)
   - `published_at` (TIMESTAMPTZ DEFAULT NOW())
   - `views` (INTEGER DEFAULT 0)
   - `likes` (INTEGER DEFAULT 0)
   - `is_breaking` (BOOLEAN DEFAULT FALSE)
   - `tags` (TEXT[] DEFAULT '{}')

2. **`varta_team_members`**:
   - `id` (TEXT PRIMARY KEY)
   - `name` (TEXT NOT NULL)
   - `role` (TEXT NOT NULL)
   - `image_url` (TEXT)
   - `bio` (TEXT)
   - `phone` (TEXT)
   - `email` (TEXT)
   - `display_order` (INTEGER DEFAULT 0)

3. **`varta_videos`**:
   - `id` (TEXT PRIMARY KEY)
   - `title` (TEXT NOT NULL)
   - `description` (TEXT)
   - `video_url` (TEXT NOT NULL)
   - `category` (TEXT NOT NULL)
   - `author` (TEXT NOT NULL)
   - `duration` (TEXT DEFAULT '00:00')
   - `views` (INTEGER DEFAULT 0)
   - `is_live` (BOOLEAN DEFAULT FALSE)
   - `created_at` (TIMESTAMPTZ DEFAULT NOW())

4. **`varta_queries`**:
   - `id` (TEXT PRIMARY KEY)
   - `name` (TEXT NOT NULL)
   - `phone` (TEXT NOT NULL)
   - `email` (TEXT NOT NULL)
   - `message` (TEXT NOT NULL)
   - `created_at` (TIMESTAMPTZ DEFAULT NOW())

5. **`varta_comments`**:
   - `id` (TEXT PRIMARY KEY)
   - `post_id` (TEXT NOT NULL REFERENCES varta_news_posts(id) ON DELETE CASCADE)
   - `name` (TEXT NOT NULL)
   - `text` (TEXT NOT NULL)
   - `created_at` (TIMESTAMPTZ DEFAULT NOW())

6. **`varta_settings`**:
   - `key` (TEXT PRIMARY KEY)
   - `value` (TEXT NOT NULL)
   - `updated_at` (TIMESTAMPTZ DEFAULT NOW())
   - *Stores channel logo (`channel_logo`) and channel head photo (`ansh_photo`)*.

7. **`varta_admin_auth`**:
   - `id` (TEXT PRIMARY KEY DEFAULT 'admin-primary')
   - `phone` (TEXT NOT NULL)
   - `password` (TEXT NOT NULL)
   - `updated_at` (TIMESTAMPTZ DEFAULT NOW())

### Storage Bucket:
- **`varta-media`**: Public bucket for storing full-resolution news cover images, branding logos, and team member photos.

---

## 6. CLIENT SERVICES LAYER ARCHITECTURE

The business logic is modularized inside `/src/services/`:

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components (UI)                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Calls
                               v
┌─────────────────────────────────────────────────────────────┐
│                    Services Layer (/src/services)           │
│  * postService.ts          * teamService.ts                 │
│  * videoService.ts         * queryService.ts                │
│  * commentService.ts       * settingsService.ts             │
│  * authService.ts          * storageService.ts              │
│  * migrationService.ts                                      │
└───────────────┬─────────────────────────────┬───────────────┘
                │ If Supabase Connected       │ Fallback / Offline
                v                             v
┌───────────────────────────────┐ ┌───────────────────────────┐
│     Supabase Client (Cloud)   │ │  localStorage Engine      │
│     * PostgreSQL Tables       │ │  * varta_x_news_posts     │
│     * Storage Bucket          │ │  * varta_x_team_members   │
│     * Real-Time Subscriptions │ │  * varta_x_videos etc.    │
└───────────────────────────────┘ └───────────────────────────┘
```

---

## 7. AI & BACKEND API ENDPOINTS

### 1. News Generation Endpoint
- **URL (Node)**: `POST /api/ai/generate-news`
- **URL (Netlify)**: `POST /.netlify/functions/generate-news`
- **Model**: `gemini-2.5-flash` via `@google/genai`
- **Payload**:
  ```json
  {
    "topic": "झांसी किले में भव्य लाइट एंड साउंड शो का उद्घाटन",
    "category": "Local",
    "reporterName": "हृदयांश गुप्ता (चैनल हेड)"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "post": {
      "title": "झांसी किले में लाइट एंड साउंड शो का भव्य शुभारंभ...",
      "content": "झांसी। ऐतिहासिक झांसी दुर्ग में...",
      "isBreaking": true
    }
  }
  ```

### 2. Vedic Horoscope (Jyotish) Generation Endpoint
- **URL (Node)**: `POST /api/ai/generate-horoscope`
- **URL (Netlify)**: `POST /.netlify/functions/generate-horoscope`
- **Model**: `gemini-2.5-flash` via `@google/genai`
- **Payload**: `{ "signId": "aries" }`
- **Response**:
  ```json
  {
    "success": true,
    "horoscope": {
      "luckPercentage": 88,
      "luckyNumber": "9",
      "luckyColor": "लाल (Red)",
      "generalPrediction": "आज का दिन शुभ रहेगा...",
      "careerPrediction": "व्यापार में नए अनुबंध मिलेंगे...",
      "healthPrediction": "स्वास्थ्य उत्तम रहेगा...",
      "lovePrediction": "परिवार में सौहार्द बना रहेगा...",
      "remedy": "हनुमान चालीसा का पाठ करें।"
    }
  }
  ```

---

## 8. FRONTEND DESIGN SYSTEM & PALETTE

- **Theme Palette**:
  - Background: Clean Off-White `#f8fafc` / Pure White `#ffffff`
  - Accent / Brand: Indian Crimson Red (`#dc2626`, `#b91c1c`, `#991b1b`)
  - Neutral High-Contrast Text: Slate 900 (`#0f172a`), Slate 700 (`#334155`), Slate 500 (`#64748b`)
  - Surface Borders: Slate 200 (`#e2e8f0`) / Slate 300 (`#cbd5e1`)
  - Accent Badges: Emerald 600 (Verified/Success), Amber 500 (Alert/Warning), Blue 600 (Cloud/Sync)
- **Typography Pairing**:
  - Display / Headlines: `Rozha One`, `Yatra One`, or Bold Sans Serif with Hindi Devanagari optimization.
  - Body Text: Clean, legible sans-serif (`font-sans`) at `15px-16px` with `1.6` line-height for high readability.
- **Admin Panel Aesthetic**:
  - Light-mode design with clean white cards, subtle slate borders, and crisp high-contrast controls.

---

## 9. DEPLOYMENT & HOSTING GUIDE

### Method 1: Deploying to Netlify
1. Connect your repository to Netlify.
2. Build settings are auto-configured by `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Functions Directory**: `netlify/functions`
3. Add Environment Variables in **Netlify Dashboard > Site Configuration > Environment Variables**:
   - `GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Method 2: Deploying to Linux VPS (Ubuntu 22.04/24.04)
1. Install Node.js 22, Git, Nginx, PM2:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt install -y nodejs git nginx ufw
   sudo npm install -g pm2
   ```
2. Clone repository to `/var/www/vartaxnews`, run `npm install`, create `.env`, and build:
   ```bash
   npm run build
   pm2 start "node dist/server.cjs" --name "vartaxnews"
   pm2 save && pm2 startup
   ```
3. Setup Nginx reverse proxy from port `80/443` to `http://127.0.0.1:3000` with Let's Encrypt SSL via `certbot`.

---

## 10. CRITICAL RULES & INSTRUCTIONS FOR FUTURE AI AGENTS

1. **User Intent & Scope Discipline**:
   - Do NOT delete or rename `MASTER.md` or `package.json`.
   - Always verify compilation with `npm run build` or `compile_applet` before finishing your turn.
2. **API Key Security**:
   - Keep `GEMINI_API_KEY` strictly server-side. Never inject it directly into client-side bundles or `import.meta.env.VITE_*`.
3. **Database Operations**:
   - Always use the services in `src/services/` rather than writing raw queries inside React components.
   - Preserve the offline-first fallback in all services to prevent app breakage if Supabase is temporarily unreachable.
4. **Dev Server & Port**:
   - Dev server must always bind to `0.0.0.0:3000`.

---
*End of Master Architectural Reference Manual for Varta X News.*
