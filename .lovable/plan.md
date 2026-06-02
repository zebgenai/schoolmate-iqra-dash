
# Plan: Connect School ERP to Lovable Cloud (Supabase)

This is a large integration. I'll do it in clear phases so you can see progress and we don't break the working demo UI.

## Phase 1 — Enable Lovable Cloud
Turn on Lovable Cloud (managed Supabase). This gives us auth, Postgres, storage, and RLS with no external account.

## Phase 2 — Database schema (single migration)

Create the 14 tables, all with `school_id` for multi-tenancy:

1. `schools` — id, name, code (`allied` / `icms`), address, phone, logo_url, session, theme_color
2. `profiles` — id (=auth.users.id), school_id, full_name, email, phone, avatar_url
3. `app_role` enum: `super_admin`, `school_admin`, `teacher`, `accountant`
4. `user_roles` — user_id, school_id, role  (separate table — never on profile)
5. `classes` — id, school_id, name (e.g. "5"), grade_level
6. `sections` — id, school_id, class_id, name (e.g. "A")
7. `subjects` — id, school_id, name, code
8. `students` — id, school_id, admission_no, name, father_name, guardian_phone, whatsapp, gender, dob, class_id, section_id, monthly_fee, address, status, avatar_url
9. `teachers` — id, school_id, profile_id, employee_no, name, phone, qualification, subjects[], status
10. `attendance` — id, school_id, student_id, date, status (present/absent/late/leave), marked_by
11. `fee_structures` — id, school_id, class_id, monthly_fee, admission_fee, exam_fee
12. `fee_payments` — id, school_id, student_id, month, year, amount_paid, paid_on, method, received_by, receipt_no
13. `exams` — id, school_id, name, term, class_id, start_date, end_date
14. `marks` — id, school_id, exam_id, student_id, subject_id, obtained, total, grade
15. `notices` — id, school_id, title, body, audience, published_at, author_id
16. `school_settings` — id, school_id (unique), key/value or single-row settings

### Helper SQL
- Enum `app_role`
- `has_role(_user_id uuid, _role app_role)` — SECURITY DEFINER, prevents RLS recursion
- `get_user_school(_user_id uuid)` — SECURITY DEFINER, returns the user's `school_id`
- Trigger on `auth.users` insert → create `profiles` row
- `updated_at` triggers

### RLS (enabled on every table)
- `super_admin` → full access across all schools
- `school_admin` / `teacher` / `accountant` → only rows where `school_id = get_user_school(auth.uid())`
- Write policies further restricted by role (e.g. only `school_admin`/`accountant` can insert fee payments; only `teacher`/`school_admin` can mark attendance)
- Allied vs ICMS separation is automatic via `school_id` scoping — no cross-school reads possible

### Grants
Each `public` table gets explicit `GRANT` to `authenticated` and `service_role` (per platform requirement).

### Storage bucket
- `school-assets` (public read) for logos and student avatars

## Phase 3 — Seed data
Insert two schools: **Allied School** and **ICMS School**, plus default classes (1–10), sections (A/B/C), and a handful of subjects so the demo isn't empty.

## Phase 4 — Auth UI
- `/auth` page with email/password sign-in + sign-up (school selector + role on signup for demo)
- Use existing integration-managed `_authenticated/route.tsx` gate
- Move all `_app/*` routes under `_authenticated/`
- Wire `onAuthStateChange` at root for cache invalidation
- Sign-out in TopBar

## Phase 5 — Data layer (server functions)
Create `src/lib/*.functions.ts` with `requireSupabaseAuth` middleware for:
- `students` — list / create / update / delete
- `attendance` — list by date+class / upsert
- `fees` — list payments / record payment
- `exams` + `marks` — list / upsert marks
- `classes`, `sections`, `subjects` — list (for dropdowns)
- `school` — current school + settings

## Phase 6 — Wire UI to data
Replace `STUDENTS`, `CLASSES`, etc. from `sample-data.ts` with TanStack Query reads on these pages:
- Students: live list + working Add Student modal with zod validation + confirmation on delete
- Attendance: live class roster + save marks
- Fees: live student list + record payment
- Exams: live exams + marks entry grid
- Dashboard: real counts (students, today's attendance %, fees collected this month)

Keep `EmptyState` for empty results. Keep `sample-data.ts` only for `formatPKR` and fallback labels.

## Phase 7 — Polish
- Loading skeletons on every table
- `sonner` toasts on success/error
- `AlertDialog` confirmations on delete
- Form validation with zod + react-hook-form
- Disabled states while mutating

## Out of scope (per your request)
- No pricing/subscription pages
- No payment gateway
- Teachers/Notices/Reports/Admissions/Settings pages stay on sample data this round (we can wire them next) — I'll flag this clearly so you know what's live vs demo.

---

## Confirm before I proceed
This is ~2–3 hours of build work in one go. I'll execute it end-to-end unless you want to:
- **A)** Build it all now (recommended)
- **B)** Just do Phases 1–4 first (schema + auth), then wire pages in a follow-up
- **C)** Adjust scope (e.g. include Teachers/Notices in Phase 6)

Reply A / B / C (or with changes) and I'll start.
