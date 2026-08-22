# Varta X News Media — Supabase Database & Storage Architecture

## 1. Complete Table List

The database schema is derived strictly from the active TypeScript interfaces (`NewsPost`, `TeamMember`, `VideoBulletin`, `ContactRequest`, `PushNotification`, `NewsCategory`) and service modules (`postService`, `teamService`, `videoService`, `commentService`, `queryService`, `settingsService`, `authService`).

| # | Table Name | Purpose | Primary Key | Total Columns |
|---|:---|:---|:---|:---|
| 1 | `public.profiles` | Staff authentication, RBAC, editor profiles | `id (UUID)` | 8 |
| 2 | `public.categories` | News article categorization (Breaking, National, Local, etc.) | `id (TEXT)` | 6 |
| 3 | `public.posts` | News stories, breaking alerts, reporter attribution | `id (TEXT)` | 14 |
| 4 | `public.team_members` | Editorial board & ground correspondents directory | `id (TEXT)` | 9 |
| 5 | `public.videos` | Video bulletins, YouTube live streams, durations | `id (TEXT)` | 12 |
| 6 | `public.comments` | Reader article discussion & comment moderation | `id (UUID)` | 6 |
| 7 | `public.contact_queries` | Field reporter recruitment applications & news tips | `id (TEXT)` | 7 |
| 8 | `public.notifications` | Real-time push alerts for mobile PWA subscribers | `id (TEXT)` | 7 |
| 9 | `public.site_settings` | Global branding CDN URLs, channel logo, metadata | `key (TEXT)` | 4 |

---

## 2. Detailed Column Definitions

### 2.1 `public.profiles`
| Column | Type | Nullable | Default | Description |
|:---|:---|:---|:---|:---|
| `id` | `UUID` | NO | `auth.users(id)` | Matches Supabase Auth user ID |
| `email` | `TEXT` | YES | `NULL` | User login email (Unique) |
| `full_name` | `TEXT` | NO | `''` | Reporter / Editor full name |
| `role` | `user_role` | NO | `'reporter'` | Enum: `super_admin`, `editor`, `reporter` |
| `phone` | `TEXT` | YES | `NULL` | Contact phone / WhatsApp |
| `avatar_url` | `TEXT` | YES | `NULL` | CDN URL for profile avatar in `varta-team` bucket |
| `bio` | `TEXT` | YES | `NULL` | Short journalist biography |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Timestamp of creation |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | Timestamp of last profile update |

### 2.2 `public.categories`
| Column | Type | Nullable | Default | Description |
|:---|:---|:---|:---|:---|
| `id` | `TEXT` | NO | - | Primary key (`Breaking`, `National`, `Local`, `Sports`, `Entertainment`, `Crime`) |
| `name_hi` | `TEXT` | NO | - | Hindi display label (e.g., `ताज़ा खबरें`) |
| `name_en` | `TEXT` | NO | - | English translation label |
| `slug` | `TEXT` | NO | - | URL slug (Unique) |
| `display_order` | `INTEGER`| NO | `0` | Header navigation sort order |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Timestamp |

### 2.3 `public.posts`
| Column | Type | Nullable | Default | Description |
|:---|:---|:---|:---|:---|
| `id` | `TEXT` | NO | `post-<timestamp>` | Primary key (e.g. `post-1723456789`) |
| `title` | `TEXT` | NO | - | Hindi news headline |
| `slug` | `TEXT` | YES | `NULL` | URL slug for deep-link sharing |
| `content` | `TEXT` | NO | - | Full Hindi article body |
| `category` | `TEXT` | NO | - | Foreign key to `public.categories(id)` |
| `image_url` | `TEXT` | NO | `Default CDN URL`| Supabase Storage CDN URL from `varta-news` bucket |
| `author_name` | `TEXT` | NO | `'वार्ता एक्स रिपोर्टर'` | Byline author name |
| `author_role` | `TEXT` | NO | `'संवाददाता'` | Byline journalist title |
| `author_id` | `UUID` | YES | `NULL` | Foreign key to `public.profiles(id)` |
| `is_breaking` | `BOOLEAN` | NO | `false` | Flash breaking news ticker banner flag |
| `views` | `BIGINT` | NO | `0` | Atomic reader view counter |
| `likes` | `BIGINT` | NO | `0` | Atomic reader like counter |
| `status` | `post_status`| NO | `'published'` | Enum: `draft`, `published`, `archived` |
| `published_at` | `TIMESTAMPTZ` | NO | `now()` | Published timestamp |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Article creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | Last modification timestamp |

### 2.4 `public.team_members`
| Column | Type | Nullable | Default | Description |
|:---|:---|:---|:---|:---|
| `id` | `TEXT` | NO | `team-<timestamp>` | Primary key (e.g. `team-1`, `team-2`) |
| `name` | `TEXT` | NO | - | Member name (e.g., हृद्यांश (अंश) गुप्ता, अंकेश गुप्ता, हेमंत राजपूत) |
| `role` | `TEXT` | NO | - | Editorial or field designation |
| `image_url` | `TEXT` | NO | `Default CDN URL`| Supabase Storage CDN URL from `varta-team` bucket |
| `bio` | `TEXT` | NO | - | Official bio and beat coverage info |
| `phone` | `TEXT` | YES | `NULL` | Official contact phone |
| `email` | `TEXT` | YES | `NULL` | Official contact email |
| `display_order` | `INTEGER`| NO | `0` | Sort order (Leader first = 1) |
| `is_active` | `BOOLEAN` | NO | `true` | Active staff listing flag |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | Last update timestamp |

### 2.5 `public.videos`
| Column | Type | Nullable | Default | Description |
|:---|:---|:---|:---|:---|
| `id` | `TEXT` | NO | `vid-<timestamp>` | Primary key |
| `title` | `TEXT` | NO | - | Video news headline |
| `description` | `TEXT` | NO | - | Video report summary |
| `video_url` | `TEXT` | NO | - | Direct stream or YouTube iframe embed link |
| `thumbnail_url`| `TEXT` | YES | `NULL` | Custom video thumbnail CDN URL from `varta-media` bucket |
| `views` | `BIGINT` | NO | `0` | Atomic view counter |
| `likes` | `BIGINT` | NO | `0` | Atomic like counter |
| `category` | `TEXT` | NO | `'Local'` | Video category tag |
| `duration` | `TEXT` | NO | `'03:30'` | Runtime duration (e.g., `04:15`) |
| `author_name` | `TEXT` | NO | `'वार्ता एक्स ब्यूरो'`| Video reporter attribution |
| `is_live` | `BOOLEAN` | NO | `false` | Live stream indicator badge flag |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | Last update timestamp |

### 2.6 `public.comments`
| Column | Type | Nullable | Default | Description |
|:---|:---|:---|:---|:---|
| `id` | `UUID` | NO | `gen_random_uuid()` | Primary key |
| `post_id` | `TEXT` | NO | - | Foreign key to `public.posts(id)` (CASCADE DELETE) |
| `author_name` | `TEXT` | NO | - | Commenter name |
| `content` | `TEXT` | NO | - | Comment text content |
| `status` | `comment_status`| NO | `'approved'` | Enum: `approved`, `pending`, `spam` |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Comment submission timestamp |

### 2.7 `public.contact_queries`
| Column | Type | Nullable | Default | Description |
|:---|:---|:---|:---|:---|
| `id` | `TEXT` | NO | `query-<timestamp>` | Primary key |
| `name` | `TEXT` | NO | - | Inquirer / Reporter candidate name |
| `phone` | `TEXT` | NO | - | Applicant phone number |
| `email` | `TEXT` | YES | `NULL` | Applicant email |
| `message` | `TEXT` | NO | - | Inquirer inquiry or reporter application pitch |
| `status` | `query_status` | NO | `'unread'` | Enum: `unread`, `read`, `archived` |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Submission timestamp |

### 2.8 `public.notifications`
| Column | Type | Nullable | Default | Description |
|:---|:---|:---|:---|:---|
| `id` | `TEXT` | NO | `notif-<timestamp>` | Primary key |
| `title` | `TEXT` | NO | - | Notification banner title |
| `message` | `TEXT` | NO | - | Alert summary text |
| `category` | `TEXT` | YES | `NULL` | Category badge tag |
| `post_id` | `TEXT` | YES | `NULL` | Linked news post ID for direct navigation |
| `is_read` | `BOOLEAN` | NO | `false` | Read status |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Alert dispatch timestamp |

### 2.9 `public.site_settings`
| Column | Type | Nullable | Default | Description |
|:---|:---|:---|:---|:---|
| `key` | `TEXT` | NO | - | Setting key (`channel_logo`, `ansh_photo`, `site_metadata`) |
| `value` | `JSONB` | NO | - | JSON value storing CDN URLs or metadata objects |
| `description` | `TEXT` | YES | `NULL` | Human-readable explanation of setting |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | Last modification timestamp |

---

## 3. Database Relationships

```
auth.users (Supabase Auth)
  └── 1:1 ── public.profiles
                ├── 1:N ── public.posts (author_id)
                └── 1:N ── public.videos (author_id)

public.categories
  └── 1:N ── public.posts (category)

public.posts
  ├── 1:N ── public.comments (post_id) [ON DELETE CASCADE]
  └── 1:N ── public.notifications (post_id) [ON DELETE SET NULL]
```

---

## 4. Database Indexes

| Index Name | Table | Columns | Index Type |
|:---|:---|:---|:---|
| `idx_posts_created_at` | `posts` | `created_at DESC` | B-Tree |
| `idx_posts_category` | `posts` | `category` | B-Tree |
| `idx_posts_is_breaking`| `posts` | `is_breaking` | B-Tree |
| `idx_posts_status` | `posts` | `status` | B-Tree |
| `idx_team_members_display_order` | `team_members` | `display_order ASC` | B-Tree |
| `idx_team_members_is_active` | `team_members` | `is_active` | B-Tree |
| `idx_videos_created_at` | `videos` | `created_at DESC` | B-Tree |
| `idx_videos_is_live` | `videos` | `is_live` | B-Tree |
| `idx_comments_post_id` | `comments` | `post_id` | B-Tree |
| `idx_comments_created_at` | `comments` | `created_at ASC` | B-Tree |
| `idx_queries_created_at` | `contact_queries` | `created_at DESC` | B-Tree |
| `idx_queries_status` | `contact_queries` | `status` | B-Tree |
| `idx_notifications_created_at` | `notifications` | `created_at DESC` | B-Tree |

---

## 5. Row Level Security (RLS) Strategy

| Table | SELECT Policy | INSERT Policy | UPDATE Policy | DELETE Policy |
|:---|:---|:---|:---|:---|
| `profiles` | Public (True) | Auth Trigger only | Self (`auth.uid() = id`) | None |
| `categories` | Public (True) | Admin/Editor (`is_admin_or_editor()`) | Admin/Editor | Admin/Editor |
| `posts` | Public for `status = 'published'` (Admins see all) | Admin/Editor (`auth.role() = 'authenticated'`) | Admin/Editor | Admin/Editor |
| `team_members`| Public (True) | Admin/Editor | Admin/Editor | Admin/Editor |
| `videos` | Public (True) | Admin/Editor | Admin/Editor | Admin/Editor |
| `comments` | Public for `status = 'approved'` | Public (`True`) | Admin/Editor | Admin/Editor |
| `contact_queries` | Admin/Editor only | Public (`True`) | Admin/Editor | Admin/Editor |
| `notifications` | Public (True) | Admin/Editor | Admin/Editor | Admin/Editor |
| `site_settings` | Public (True) | Admin/Editor | Admin/Editor | Admin/Editor |

---

## 6. Supabase Storage Architecture

Four public Storage Buckets are configured to eliminate Base64 encoding and local file paths:

| Bucket ID | Public Read | Content Type | Allowed MIME Types | Max Size | Target File Assets |
|:---|:---|:---|:---|:---|:---|
| `varta-team` | **YES** | Profile Photos | `image/png`, `image/jpeg`, `image/webp` | 5 MB | Leader photo (`ansh_photo`), Ground Reporter portraits (`team_members.image_url`) |
| `varta-news` | **YES** | Cover Thumbnails | `image/png`, `image/jpeg`, `image/webp` | 10 MB | Article headline pictures (`posts.image_url`) |
| `varta-logos` | **YES** | Channel Logos | `image/png`, `image/jpeg`, `image/svg+xml`, `image/webp` | 5 MB | Main header brand mark (`site_settings.channel_logo`) |
| `varta-media` | **YES** | Media Assets | `image/*`, `video/*`, `application/pdf` | 25 MB | Custom video thumbnails (`videos.thumbnail_url`), Press ID cards, Media kit assets |

### Production Flow for Profile & Asset Photos:
```
1. Admin selects new photo in Admin Panel
2. Storage service compresses image (JPEG/WebP ≤ 1200px)
3. Uploads directly to Supabase Storage: bucket 'varta-team' -> filepath 'ansh-profile-<timestamp>.jpg'
4. Storage returns public CDN URL: 'https://<project-ref>.supabase.co/storage/v1/object/public/varta-team/ansh-profile-...jpg'
5. Service saves this public CDN URL into 'site_settings' (key='ansh_photo') and 'team_members' (id='team-1')
6. Public website on Netlify loads the fresh image from the Supabase CDN on every visitor's device.
```
