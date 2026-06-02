
-- Fix search_path on remaining functions
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Seed schools (idempotent)
INSERT INTO public.schools (name, code, address, phone, email, session, theme_color)
VALUES
  ('Allied School', 'allied', 'Main Campus Road, Sector G, Pakistan', '+92 51 1234 5678', 'info@alliedschool.edu.pk', '2025-2026', '#2563eb'),
  ('ICMS School',   'icms',   'Education Avenue, Pakistan',          '+92 51 9876 5432', 'info@icms.edu.pk',         '2025-2026', '#16a34a')
ON CONFLICT (code) DO NOTHING;

-- Seed classes 1..10 for both schools
INSERT INTO public.classes (school_id, name, grade_level)
SELECT s.id, g::text, g FROM public.schools s, generate_series(1,10) g
ON CONFLICT (school_id, name) DO NOTHING;

-- Seed sections A,B,C for every class
INSERT INTO public.sections (school_id, class_id, name)
SELECT c.school_id, c.id, sec
FROM public.classes c, unnest(ARRAY['A','B','C']) sec
ON CONFLICT (class_id, name) DO NOTHING;

-- Seed core subjects for each school
INSERT INTO public.subjects (school_id, name, code)
SELECT s.id, subj.name, subj.code
FROM public.schools s,
  (VALUES ('English','ENG'),('Urdu','URD'),('Mathematics','MTH'),('Science','SCI'),
          ('Islamiat','ISL'),('Social Studies','SST'),('Computer','CMP')) AS subj(name,code)
ON CONFLICT (school_id, name) DO NOTHING;
