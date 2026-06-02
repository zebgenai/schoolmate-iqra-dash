
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('super_admin','school_admin','teacher','accountant');
CREATE TYPE public.attendance_status AS ENUM ('present','absent','late','leave');
CREATE TYPE public.student_status AS ENUM ('active','inactive');
CREATE TYPE public.gender AS ENUM ('male','female');

-- ============ UTIL: updated_at trigger ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ============ SCHOOLS ============
CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  address text,
  phone text,
  email text,
  logo_url text,
  session text DEFAULT '2025-2026',
  theme_color text DEFAULT '#2563eb',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.schools TO authenticated;
GRANT ALL ON public.schools TO service_role;
CREATE TRIGGER schools_updated BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ USER_ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, school_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- ============ SECURITY DEFINER HELPERS ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.get_user_school(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT school_id FROM public.profiles WHERE id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin');
$$;

-- ============ AUTO PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _school_id uuid;
  _role public.app_role;
BEGIN
  -- pick school from metadata if provided, else default to first school
  BEGIN
    _school_id := (NEW.raw_user_meta_data->>'school_id')::uuid;
  EXCEPTION WHEN OTHERS THEN _school_id := NULL; END;

  IF _school_id IS NULL THEN
    SELECT id INTO _school_id FROM public.schools ORDER BY created_at LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, school_id, full_name, email)
  VALUES (
    NEW.id,
    _school_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.email
  );

  -- assign role from metadata, default school_admin for demo
  BEGIN
    _role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'school_admin');
  EXCEPTION WHEN OTHERS THEN _role := 'school_admin'; END;

  INSERT INTO public.user_roles (user_id, school_id, role) VALUES (NEW.id, _school_id, _role);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ ACADEMIC STRUCTURE ============
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  grade_level int,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;

CREATE TABLE public.sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(class_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sections TO authenticated;
GRANT ALL ON public.sections TO service_role;

CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;

-- ============ STUDENTS ============
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  admission_no text NOT NULL,
  name text NOT NULL,
  father_name text,
  guardian_phone text,
  whatsapp text,
  gender public.gender,
  dob date,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  section_id uuid REFERENCES public.sections(id) ON DELETE SET NULL,
  monthly_fee numeric(10,2) DEFAULT 0,
  address text,
  avatar_url text,
  status public.student_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, admission_no)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
CREATE TRIGGER students_updated BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_students_school ON public.students(school_id);
CREATE INDEX idx_students_class ON public.students(class_id);

-- ============ TEACHERS ============
CREATE TABLE public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  employee_no text,
  name text NOT NULL,
  phone text,
  email text,
  qualification text,
  subjects text[],
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers TO authenticated;
GRANT ALL ON public.teachers TO service_role;
CREATE TRIGGER teachers_updated BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ATTENDANCE ============
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date date NOT NULL,
  status public.attendance_status NOT NULL,
  marked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
CREATE TRIGGER attendance_updated BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_attendance_date ON public.attendance(school_id, date);

-- ============ FEE STRUCTURES & PAYMENTS ============
CREATE TABLE public.fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  monthly_fee numeric(10,2) NOT NULL DEFAULT 0,
  admission_fee numeric(10,2) DEFAULT 0,
  exam_fee numeric(10,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_structures TO authenticated;
GRANT ALL ON public.fee_structures TO service_role;

CREATE TABLE public.fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  month int NOT NULL,
  year int NOT NULL,
  amount_paid numeric(10,2) NOT NULL,
  paid_on date NOT NULL DEFAULT CURRENT_DATE,
  method text DEFAULT 'cash',
  receipt_no text,
  received_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_payments TO authenticated;
GRANT ALL ON public.fee_payments TO service_role;
CREATE INDEX idx_fee_payments_student ON public.fee_payments(student_id);
CREATE INDEX idx_fee_payments_period ON public.fee_payments(school_id, year, month);

-- ============ EXAMS & MARKS ============
CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  term text,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  start_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exams TO authenticated;
GRANT ALL ON public.exams TO service_role;

CREATE TABLE public.marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  obtained numeric(6,2) NOT NULL DEFAULT 0,
  total numeric(6,2) NOT NULL DEFAULT 100,
  grade text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(exam_id, student_id, subject_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marks TO authenticated;
GRANT ALL ON public.marks TO service_role;
CREATE TRIGGER marks_updated BEFORE UPDATE ON public.marks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ NOTICES ============
CREATE TABLE public.notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  audience text DEFAULT 'all',
  published_at timestamptz NOT NULL DEFAULT now(),
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notices TO authenticated;
GRANT ALL ON public.notices TO service_role;

-- ============ SCHOOL SETTINGS ============
CREATE TABLE public.school_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid UNIQUE NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  principal_name text,
  motto text,
  late_fee_percent numeric(5,2) DEFAULT 0,
  grading_scale jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_settings TO authenticated;
GRANT ALL ON public.school_settings TO service_role;
CREATE TRIGGER school_settings_updated BEFORE UPDATE ON public.school_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ RLS ============
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

-- schools: everyone authenticated can read (needed for signup picker); super_admin can write
CREATE POLICY schools_read ON public.schools FOR SELECT TO authenticated USING (true);
CREATE POLICY schools_write ON public.schools FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- profiles: self-read + same-school read; self-update
CREATE POLICY profiles_read ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR school_id = public.get_user_school(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY profiles_self_update ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- user_roles: read own + super_admin
CREATE POLICY user_roles_read ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));

-- Generic school-scoped policy helper macro (inline below per table)
-- classes/sections/subjects: read same-school; write school_admin or super_admin
CREATE POLICY classes_read ON public.classes FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY classes_write ON public.classes FOR ALL TO authenticated
  USING ((school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(),'school_admin')) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(),'school_admin')) OR public.is_super_admin(auth.uid()));

CREATE POLICY sections_read ON public.sections FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY sections_write ON public.sections FOR ALL TO authenticated
  USING ((school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(),'school_admin')) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(),'school_admin')) OR public.is_super_admin(auth.uid()));

CREATE POLICY subjects_read ON public.subjects FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY subjects_write ON public.subjects FOR ALL TO authenticated
  USING ((school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(),'school_admin')) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(),'school_admin')) OR public.is_super_admin(auth.uid()));

-- students: read same-school any role; write school_admin or super_admin
CREATE POLICY students_read ON public.students FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY students_write ON public.students FOR ALL TO authenticated
  USING ((school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(),'school_admin')) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(),'school_admin')) OR public.is_super_admin(auth.uid()));

-- teachers
CREATE POLICY teachers_read ON public.teachers FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY teachers_write ON public.teachers FOR ALL TO authenticated
  USING ((school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(),'school_admin')) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(),'school_admin')) OR public.is_super_admin(auth.uid()));

-- attendance: read same-school; write teacher or school_admin
CREATE POLICY attendance_read ON public.attendance FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY attendance_write ON public.attendance FOR ALL TO authenticated
  USING ((school_id = public.get_user_school(auth.uid()) AND (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'school_admin'))) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((school_id = public.get_user_school(auth.uid()) AND (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'school_admin'))) OR public.is_super_admin(auth.uid()));

-- fee_structures: read same-school; write school_admin
CREATE POLICY fee_structures_read ON public.fee_structures FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY fee_structures_write ON public.fee_structures FOR ALL TO authenticated
  USING ((school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(),'school_admin')) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(),'school_admin')) OR public.is_super_admin(auth.uid()));

-- fee_payments: read same-school; write accountant or school_admin
CREATE POLICY fee_payments_read ON public.fee_payments FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY fee_payments_write ON public.fee_payments FOR ALL TO authenticated
  USING ((school_id = public.get_user_school(auth.uid()) AND (public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'school_admin'))) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((school_id = public.get_user_school(auth.uid()) AND (public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'school_admin'))) OR public.is_super_admin(auth.uid()));

-- exams / marks: read same-school; write teacher or school_admin
CREATE POLICY exams_read ON public.exams FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY exams_write ON public.exams FOR ALL TO authenticated
  USING ((school_id = public.get_user_school(auth.uid()) AND (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'school_admin'))) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((school_id = public.get_user_school(auth.uid()) AND (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'school_admin'))) OR public.is_super_admin(auth.uid()));

CREATE POLICY marks_read ON public.marks FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY marks_write ON public.marks FOR ALL TO authenticated
  USING ((school_id = public.get_user_school(auth.uid()) AND (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'school_admin'))) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((school_id = public.get_user_school(auth.uid()) AND (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'school_admin'))) OR public.is_super_admin(auth.uid()));

-- notices
CREATE POLICY notices_read ON public.notices FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY notices_write ON public.notices FOR ALL TO authenticated
  USING ((school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(),'school_admin')) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(),'school_admin')) OR public.is_super_admin(auth.uid()));

-- school_settings
CREATE POLICY school_settings_read ON public.school_settings FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY school_settings_write ON public.school_settings FOR ALL TO authenticated
  USING ((school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(),'school_admin')) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(),'school_admin')) OR public.is_super_admin(auth.uid()));
