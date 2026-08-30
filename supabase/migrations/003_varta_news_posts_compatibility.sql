-- ==============================================================================
-- VARTA X NEWS MEDIA LIVE — COMPREHENSIVE PRODUCTION MIGRATION
-- Migration: 003_varta_news_posts_compatibility.sql
-- Description: Complete schema ensuring dual compatibility with varta_news_posts
--              and posts, team_members, videos, comments, storage buckets, and RLS.
-- ==============================================================================

-- 1. PRIMARY NEWS POSTS TABLE (varta_news_posts)
CREATE TABLE IF NOT EXISTS public.varta_news_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT DEFAULT '/input_file_0.png',
    author_name TEXT DEFAULT 'वार्ता एक्स रिपोर्टर',
    author TEXT DEFAULT 'वार्ता एक्स रिपोर्टर',
    author_role TEXT DEFAULT 'संवाददाता',
    is_breaking BOOLEAN DEFAULT false,
    views BIGINT DEFAULT 0,
    likes BIGINT DEFAULT 0,
    tags TEXT[] DEFAULT '{}'::text[],
    status TEXT DEFAULT 'published',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SECONDARY POSTS TABLE (posts - For backwards compatibility)
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT DEFAULT '/input_file_0.png',
    author_name TEXT DEFAULT 'वार्ता एक्स रिपोर्टर',
    author_role TEXT DEFAULT 'संवाददाता',
    is_breaking BOOLEAN DEFAULT false,
    views BIGINT DEFAULT 0,
    likes BIGINT DEFAULT 0,
    status TEXT DEFAULT 'published',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEAM DIRECTORY TABLE
CREATE TABLE IF NOT EXISTS public.team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    image_url TEXT DEFAULT '/input_file_0.png',
    bio TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. VIDEO BULLETINS TABLE
CREATE TABLE IF NOT EXISTS public.videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    category TEXT DEFAULT 'Local',
    duration TEXT DEFAULT '03:15',
    author_name TEXT DEFAULT 'वार्ता एक्स रिपोर्टर',
    is_live BOOLEAN DEFAULT false,
    views BIGINT DEFAULT 0,
    likes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONTACT QUERIES TABLE
CREATE TABLE IF NOT EXISTS public.contact_queries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.varta_news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- varta_news_posts RLS
DROP POLICY IF EXISTS "varta_news_posts_select" ON public.varta_news_posts;
CREATE POLICY "varta_news_posts_select" ON public.varta_news_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "varta_news_posts_insert" ON public.varta_news_posts;
CREATE POLICY "varta_news_posts_insert" ON public.varta_news_posts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "varta_news_posts_update" ON public.varta_news_posts;
CREATE POLICY "varta_news_posts_update" ON public.varta_news_posts FOR UPDATE USING (true);
DROP POLICY IF EXISTS "varta_news_posts_delete" ON public.varta_news_posts;
CREATE POLICY "varta_news_posts_delete" ON public.varta_news_posts FOR DELETE USING (true);

-- posts RLS
DROP POLICY IF EXISTS "posts_select" ON public.posts;
CREATE POLICY "posts_select" ON public.posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "posts_insert" ON public.posts;
CREATE POLICY "posts_insert" ON public.posts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "posts_update" ON public.posts;
CREATE POLICY "posts_update" ON public.posts FOR UPDATE USING (true);
DROP POLICY IF EXISTS "posts_delete" ON public.posts;
CREATE POLICY "posts_delete" ON public.posts FOR DELETE USING (true);

-- team_members RLS
DROP POLICY IF EXISTS "team_members_select" ON public.team_members;
CREATE POLICY "team_members_select" ON public.team_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "team_members_manage" ON public.team_members;
CREATE POLICY "team_members_manage" ON public.team_members FOR ALL USING (true);

-- videos RLS
DROP POLICY IF EXISTS "videos_select" ON public.videos;
CREATE POLICY "videos_select" ON public.videos FOR SELECT USING (true);
DROP POLICY IF EXISTS "videos_manage" ON public.videos;
CREATE POLICY "videos_manage" ON public.videos FOR ALL USING (true);

-- comments RLS
DROP POLICY IF EXISTS "comments_select" ON public.comments;
CREATE POLICY "comments_select" ON public.comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "comments_insert" ON public.comments;
CREATE POLICY "comments_insert" ON public.comments FOR INSERT WITH CHECK (true);

-- contact_queries RLS
DROP POLICY IF EXISTS "contact_queries_all" ON public.contact_queries;
CREATE POLICY "contact_queries_all" ON public.contact_queries FOR ALL USING (true);

-- site_settings RLS
DROP POLICY IF EXISTS "site_settings_all" ON public.site_settings;
CREATE POLICY "site_settings_all" ON public.site_settings FOR ALL USING (true);

-- ==============================================================================
-- ATOMIC RPC FUNCTIONS (Views and Likes)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.increment_post_views(target_post_id TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.varta_news_posts SET views = COALESCE(views, 0) + 1 WHERE id = target_post_id;
    UPDATE public.posts SET views = COALESCE(views, 0) + 1 WHERE id = target_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_post_likes(target_post_id TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.varta_news_posts SET likes = COALESCE(likes, 0) + 1 WHERE id = target_post_id;
    UPDATE public.posts SET likes = COALESCE(likes, 0) + 1 WHERE id = target_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- STORAGE BUCKETS & POLICIES
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('varta-media', 'varta-media', true),
    ('varta-news', 'varta-news', true),
    ('varta-team', 'varta-team', true),
    ('varta-logos', 'varta-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Media Storage Read" ON storage.objects;
CREATE POLICY "Public Media Storage Read" ON storage.objects FOR SELECT
USING (bucket_id IN ('varta-media', 'varta-news', 'varta-team', 'varta-logos'));

DROP POLICY IF EXISTS "Public Media Storage Upload" ON storage.objects;
CREATE POLICY "Public Media Storage Upload" ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('varta-media', 'varta-news', 'varta-team', 'varta-logos'));
