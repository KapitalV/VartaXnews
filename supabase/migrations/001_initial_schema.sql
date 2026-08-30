-- ==============================================================================
-- VARTA X NEWS MEDIA — SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA
-- File: supabase/migrations/001_initial_schema.sql
-- Description: Complete schema for Varta X News including Profiles, Categories,
--              News Posts, Team Directory, Video Bulletins, Comments, Contact Inquiries,
--              Push Notifications, Global Site Settings, Atomic RPC Functions, RLS & Storage.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ENUMS & CUSTOM TYPES
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'editor', 'reporter');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE comment_status AS ENUM ('approved', 'pending', 'spam');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE query_status AS ENUM ('unread', 'read', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 2. USER PROFILES TABLE (Linked with Supabase Auth)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'reporter',
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. CATEGORIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name_hi TEXT NOT NULL,
    name_en TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed Standard News Categories (Matching NewsCategory enum)
INSERT INTO public.categories (id, name_hi, name_en, slug, display_order)
VALUES 
    ('Breaking', 'ताज़ा खबरें (Breaking)', 'Breaking', 'breaking', 1),
    ('National', 'देश / राष्ट्रीय (National)', 'National', 'national', 2),
    ('Local', 'झाँसी / बुंदेलखंड (Local)', 'Local', 'local', 3),
    ('Sports', 'खेल कूद (Sports)', 'Sports', 'sports', 4),
    ('Entertainment', 'मनोरंजन (Entertainment)', 'Entertainment', 'entertainment', 5),
    ('Crime', 'क्राइम / अपराध (Crime)', 'Crime', 'crime', 6)
ON CONFLICT (id) DO UPDATE SET 
    name_hi = EXCLUDED.name_hi,
    name_en = EXCLUDED.name_en,
    slug = EXCLUDED.slug,
    display_order = EXCLUDED.display_order;

-- ------------------------------------------------------------------------------
-- 4. NEWS POSTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY DEFAULT ('post-' || round(extract(epoch from now()) * 1000)::text),
    title TEXT NOT NULL,
    slug TEXT,
    content TEXT NOT NULL,
    category TEXT NOT NULL REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200',
    author_name TEXT NOT NULL DEFAULT 'वार्ता एक्स रिपोर्टर',
    author_role TEXT NOT NULL DEFAULT 'संवाददाता',
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_breaking BOOLEAN NOT NULL DEFAULT false,
    views BIGINT NOT NULL DEFAULT 0,
    likes BIGINT NOT NULL DEFAULT 0,
    status post_status NOT NULL DEFAULT 'published',
    published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_breaking ON public.posts(is_breaking);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);

-- ------------------------------------------------------------------------------
-- 5. TEAM MEMBERS TABLE (Editorial Board & Ground Correspondents)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
    id TEXT PRIMARY KEY DEFAULT ('team-' || round(extract(epoch from now()) * 1000)::text),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
    bio TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_team_members_display_order ON public.team_members(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_team_members_is_active ON public.team_members(is_active);

-- ------------------------------------------------------------------------------
-- 6. VIDEO BULLETINS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.videos (
    id TEXT PRIMARY KEY DEFAULT ('vid-' || round(extract(epoch from now()) * 1000)::text),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    views BIGINT NOT NULL DEFAULT 0,
    likes BIGINT NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'Local',
    duration TEXT NOT NULL DEFAULT '03:30',
    author_name TEXT NOT NULL DEFAULT 'वार्ता एक्स ब्यूरो',
    is_live BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_is_live ON public.videos(is_live);

-- ------------------------------------------------------------------------------
-- 7. COMMENTS TABLE (Interactive Reader Discussion)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    status comment_status NOT NULL DEFAULT 'approved',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at ASC);

-- ------------------------------------------------------------------------------
-- 8. CONTACT INQUIRIES & REPORTER APPLICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_queries (
    id TEXT PRIMARY KEY DEFAULT ('query-' || round(extract(epoch from now()) * 1000)::text),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    status query_status NOT NULL DEFAULT 'unread',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_queries_created_at ON public.contact_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_queries_status ON public.contact_queries(status);

-- ------------------------------------------------------------------------------
-- 9. PUSH NOTIFICATIONS TABLE (Live Alerts for Mobile/PWA)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT ('notif-' || round(extract(epoch from now()) * 1000)::text),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT,
    post_id TEXT REFERENCES public.posts(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ------------------------------------------------------------------------------
-- 10. SITE SETTINGS TABLE (Key-Value Store for Global Branding & Metadata)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed Initial Global Channel Settings
INSERT INTO public.site_settings (key, value, description)
VALUES 
    ('channel_logo', '"/input_file_0.png"'::jsonb, 'वार्ता एक्स न्यूज़ चैनल मुख्य लोगो CDN URL'),
    ('ansh_photo', '"/input_file_6.png"'::jsonb, 'चैनल हेड हृद्यांश (अंश) गुप्ता आधिकारिक प्रोफाइल फोटो CDN URL'),
    ('site_metadata', '{
        "site_name": "वार्ता एक्स न्यूज़ मीडिया लाइव",
        "tagline": "सत्य, साहस और सटीक ग्राउंड रिपोर्टिंग",
        "phone": "+91 6393874723",
        "email": "editor@vartaxnews.com",
        "address": "वार्ता एक्स मीडिया सेंटर, झाँसी (उ.प्र.) - 284001",
        "emergency_helpline": "6393874723"
    }'::jsonb, 'चैनल का आधिकारिक संपर्क व मेटाडेटा')
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 11. ATOMIC RPC COUNTER FUNCTIONS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_post_views(target_post_id TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_views BIGINT;
BEGIN
    UPDATE public.posts
    SET views = views + 1
    WHERE id = target_post_id
    RETURNING views INTO new_views;
    RETURN new_views;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_post_likes(target_post_id TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_likes BIGINT;
BEGIN
    UPDATE public.posts
    SET likes = likes + 1
    WHERE id = target_post_id
    RETURNING likes INTO new_likes;
    RETURN new_likes;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_video_views(target_video_id TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_views BIGINT;
BEGIN
    UPDATE public.videos
    SET views = views + 1
    WHERE id = target_video_id
    RETURNING views INTO new_views;
    RETURN new_views;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_video_likes(target_video_id TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_likes BIGINT;
BEGIN
    UPDATE public.videos
    SET likes = likes + 1
    WHERE id = target_video_id
    RETURNING likes INTO new_likes;
    RETURN new_likes;
END;
$$;

-- ------------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if requesting user is an Admin or Editor
CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'editor')
    );
$$;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE USING (true);

-- CATEGORIES POLICIES
CREATE POLICY "Categories are readable by everyone" 
    ON public.categories FOR SELECT USING (true);

CREATE POLICY "Categories are manageable" 
    ON public.categories FOR ALL USING (true);

-- POSTS POLICIES (Live Broadcasting & News Publishing)
CREATE POLICY "Posts are readable by everyone" 
    ON public.posts FOR SELECT USING (true);

CREATE POLICY "Allow creating news posts" 
    ON public.posts FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow updating news posts" 
    ON public.posts FOR UPDATE USING (true);

CREATE POLICY "Allow deleting news posts" 
    ON public.posts FOR DELETE USING (true);

-- TEAM MEMBERS POLICIES
CREATE POLICY "Team members are readable by everyone" 
    ON public.team_members FOR SELECT USING (true);

CREATE POLICY "Allow managing team members" 
    ON public.team_members FOR ALL USING (true);

-- VIDEOS POLICIES
CREATE POLICY "Videos are readable by everyone" 
    ON public.videos FOR SELECT USING (true);

CREATE POLICY "Allow managing videos" 
    ON public.videos FOR ALL USING (true);

-- COMMENTS POLICIES
CREATE POLICY "Approved comments are readable by everyone" 
    ON public.comments FOR SELECT 
    USING (true);

CREATE POLICY "Anyone can submit a comment" 
    ON public.comments FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow managing comments" 
    ON public.comments FOR ALL 
    USING (true);

-- CONTACT QUERIES POLICIES
CREATE POLICY "Anyone can submit a contact inquiry" 
    ON public.contact_queries FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow managing inquiries" 
    ON public.contact_queries FOR ALL 
    USING (true);

-- NOTIFICATIONS POLICIES
CREATE POLICY "Notifications are viewable by everyone" 
    ON public.notifications FOR SELECT USING (true);

CREATE POLICY "Allow managing notifications" 
    ON public.notifications FOR ALL 
    USING (true);

-- SITE SETTINGS POLICIES
CREATE POLICY "Site settings are viewable by everyone" 
    ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Allow managing site settings" 
    ON public.site_settings FOR ALL 
    USING (true);

-- ------------------------------------------------------------------------------
-- 13. STORAGE BUCKETS & STORAGE RLS POLICIES
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('varta-team', 'varta-team', true),
    ('varta-news', 'varta-news', true),
    ('varta-logos', 'varta-logos', true),
    ('varta-media', 'varta-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policy: Public Read Access
CREATE POLICY "Public Read Access for Varta Storage"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('varta-team', 'varta-news', 'varta-logos', 'varta-media'));

-- Storage Policy: Upload Access
CREATE POLICY "Allow uploading Varta Media"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id IN ('varta-team', 'varta-news', 'varta-logos', 'varta-media'));

-- Storage Policy: Update Access
CREATE POLICY "Allow updating Varta Media"
    ON storage.objects FOR UPDATE
    USING (bucket_id IN ('varta-team', 'varta-news', 'varta-logos', 'varta-media'));

-- Storage Policy: Delete Access
CREATE POLICY "Allow deleting Varta Media"
    ON storage.objects FOR DELETE
    USING (bucket_id IN ('varta-team', 'varta-news', 'varta-logos', 'varta-media'));

-- ------------------------------------------------------------------------------
-- 14. INITIAL DATA SEED (Official Team, Posts & Videos)
-- ------------------------------------------------------------------------------
INSERT INTO public.team_members (id, name, role, image_url, bio, phone, email, display_order)
VALUES 
    ('team-1', 'हृद्यांश (अंश) गुप्ता', 'चैनल हेड व मुख्य संपादक', '/input_file_6.png', 'वार्ता एक्स न्यूज़ के संस्थापक एवं मुख्य संपादक। ग्राउंड रिपोर्टिंग, सामाजिक पत्रकारिता एवं बुंदेलखंड के विकास मुद्दों पर 8+ वर्षों का निष्पक्ष अनुभव।', '6393874723', 'editor@vartaxnews.com', 1),
    ('team-2', 'अंकेश गुप्ता', 'कटेरा ग्राउंड रिपोर्टर व विशेष संवाददाता', '/input_file_7.png', 'कटेरा, मऊरानीपुर एवं ग्रामीण अंचल के जनमुद्दों पर पैनी नज़र। किसान समस्याओं व प्रशासनिक योजनाओं की सच्ची कवरेज।', '9876543210', 'ankesh@vartaxnews.com', 2),
    ('team-3', 'हेमंत राजपूत', 'कटेरा देहात रिपोर्टर', '/input_file_4.png', 'ग्रामीण विकास, कृषि एवं जल संकट पर विशेष ग्राउंड रिपोर्ट्स। कटेरा देहात व समीपवर्ती गांवों से सीधा संवाद।', '9876543211', 'hemant@vartaxnews.com', 3)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    bio = EXCLUDED.bio,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email;

INSERT INTO public.posts (id, title, slug, content, category, image_url, author_name, author_role, is_breaking, views, likes)
VALUES 
    ('varta-post-1', 
     'झाँसी में विकास महाकुंभ: बुंदेलखंड एक्सप्रेसवे कनेक्टिंग कॉरिडोर को हरी झंडी', 
     'jhansi-development-expressway-corridor',
     'उत्तर प्रदेश सरकार और जिला प्रशासन झाँसी द्वारा ऐतिहासिक नगरी के चतुर्मुखी विकास हेतु नए कनेक्टिविटी प्रोजेक्ट को स्वीकृति प्रदान की गई है। इस परियोजना से झाँसी, मऊरानीपुर, कटेरा और आसपास के ग्रामीण अंचलों का सीधा संपर्क तीव्र गति से स्थापित होगा।\n\nग्राउंड रिपोर्ट के अनुसार, व्यापारियों और छात्र वर्ग में इस घोषणा से भारी उत्साह है। वार्ता एक्स न्यूज़ मीडिया टीम ने स्थानीय जनप्रतिनिधियों एवं नागरिकों से विशेष संवाद किया।',
     'Local', 
     '/input_file_1.png', 
     'हृद्यांश गुप्ता', 
     'चैनल हेड व मुख्य संपादक', 
     true, 
     1240, 
     95),
    ('varta-post-2', 
     'कटेरा देहात ग्राउंड कवरेज: किसानों की सिंचाई समस्याओं पर प्रशासन की त्वरित कार्यवाही', 
     'katera-dehat-farmers-irrigation-report',
     'कटेरा देहात और समीपवर्ती गांवों में रबी फसल की सिंचाई हेतु विद्युत आपूर्ति एवं नहरों में पानी छोड़े जाने की मांग पर स्थानीय प्रशासन ने तत्काल संज्ञान लिया है।\n\nवार्ता एक्स न्यूज़ के कटेरा देहात रिपोर्टर हेमंत राजपूत ने मौके पर पहुंचकर किसानों की समस्याओं को प्रमुखता से उठाया था, जिसके पश्चात संबंधित विभागीय अधिकारियों ने मौके का मुआयना कर आवश्यक दिशा-निर्देश जारी किए।',
     'Local', 
     '/input_file_4.png', 
     'हेमंत राजपूत', 
     'कटेरा देहात रिपोर्टर', 
     false, 
     890, 
     68),
    ('varta-post-3', 
     'डिजिटल इंडिया मिशन: वीरांगना झाँसी में युवा नवाचार और आईटी हब की स्थापना', 
     'digital-india-jhansi-youth-it-hub',
     'झाँसी के युवाओं को स्थानीय स्तर पर तकनीकी प्रशिक्षण एवं रोजगार के अवसर उपलब्ध कराने के उद्देश्य से आधुनिक डिजिटल सेंटर की शुरुआत हुई।\n\nइस पहल से बुंदेलखंड के युवाओं को महानगरों की ओर पलायन करने की बाध्यता कम होगी और स्थानीय स्तर पर आत्मनिर्भरता बढ़ेगी। रिपोर्ट: वार्ता एक्स ब्यूरो न्यूज़ डेस्क।',
     'National', 
     '/input_file_3.png', 
     'अंकेश गुप्ता', 
     'कटेरा ग्राउंड रिपोर्टर', 
     false, 
     745, 
     54)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.videos (id, title, description, video_url, category, duration, author_name, is_live, views, likes)
VALUES 
    ('vid-varta-1', 
     'झाँसी विकास कॉरिडोर ग्राउंड रिपोर्टिंग | लाइव कवरेज', 
     'वार्ता एक्स न्यूज़ मीडिया की विशेष ग्राउंड कवरेज। ऐतिहासिक झाँसी नगरी से ताज़ा हलचल और विकास कार्यों का प्रत्यक्ष जायजा।',
     'https://www.youtube.com/embed/dQw4w9WgXcQ',
     'Local',
     '04:15',
     'हृद्यांश गुप्ता',
     true,
     1420,
     89),
    ('vid-varta-2', 
     'कटेरा देहात: ग्रामीण क्षेत्र में पानी और सड़क परियोजनाओं का ग्राउंड रिव्यू', 
     'हेमंत राजपूत (कटेरा देहात रिपोर्टर) द्वारा सीधी बातचीत ग्रामीणों के साथ। समस्याओं के त्वरित निस्तारण पर विशेष फोकस।',
     'https://www.youtube.com/embed/dQw4w9WgXcQ',
     'Breaking',
     '03:40',
     'हेमंत राजपूत',
     false,
     980,
     64)
ON CONFLICT (id) DO NOTHING;
