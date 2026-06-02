-- Replace existing schools with single IQRA school
UPDATE public.profiles SET school_id = NULL WHERE school_id IS NOT NULL;
UPDATE public.user_roles SET school_id = NULL WHERE school_id IS NOT NULL;
DELETE FROM public.schools;

INSERT INTO public.schools (name, code, address, phone, email, session, theme_color)
VALUES ('IQRA Smart School', 'iqra', 'Main Campus Road, Sector G, Pakistan', '+92 51 1234 5678', 'info@iqraschool.pk', '2025-2026', '#2563eb');

-- Allow anonymous read of schools so the auth page can list them
GRANT SELECT ON public.schools TO anon;
DROP POLICY IF EXISTS schools_read ON public.schools;
CREATE POLICY schools_read ON public.schools FOR SELECT TO anon, authenticated USING (true);

-- Re-link existing profiles/user_roles to the new (only) school
UPDATE public.profiles SET school_id = (SELECT id FROM public.schools LIMIT 1);
UPDATE public.user_roles SET school_id = (SELECT id FROM public.schools LIMIT 1);