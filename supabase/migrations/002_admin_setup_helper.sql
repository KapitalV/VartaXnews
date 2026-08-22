-- ==============================================================================
-- VARTA X NEWS MEDIA — SUPABASE AUTH TRIGGER & USER PROVISIONING
-- File: supabase/migrations/002_admin_setup_helper.sql
-- Description: Automatically provisions a record in public.profiles when an admin
--              or reporter authenticates through Supabase Auth.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, avatar_url, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'वार्ता एक्स रिपोर्टर'),
        CASE 
            WHEN NEW.email = 'aloneboyansh9780@gmail.com' 
              OR NEW.email = 'editor@vartaxnews.com' 
              OR NEW.email LIKE '%admin%' 
            THEN 'super_admin'::user_role 
            ELSE 'reporter'::user_role 
        END,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '/input_file_6.png'),
        COALESCE(NEW.raw_user_meta_data->>'phone', '6393874723')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Trigger to execute on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
