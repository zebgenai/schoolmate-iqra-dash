import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type AppRole = "super_admin" | "school_admin" | "teacher" | "accountant";

export type SchoolProfile = {
  userId: string;
  email: string;
  fullName: string;
  schoolId: string | null;
  schoolName: string | null;
  schoolCode: string | null;
  role: AppRole | null;
};

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, ready };
}

export function useSchoolProfile() {
  const { session, ready } = useSession();
  const uid = session?.user.id;

  const query = useQuery<SchoolProfile | null>({
    queryKey: ["profile", uid],
    enabled: !!uid,
    queryFn: async () => {
      if (!uid) return null;
      const [profileRes, roleRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, school_id, schools(name, code)").eq("id", uid).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", uid).limit(1).maybeSingle(),
      ]);
      const p = profileRes.data as any;
      const r = roleRes.data as any;
      return {
        userId: uid,
        email: p?.email ?? session?.user.email ?? "",
        fullName: p?.full_name ?? "",
        schoolId: p?.school_id ?? null,
        schoolName: p?.schools?.name ?? null,
        schoolCode: p?.schools?.code ?? null,
        role: (r?.role as AppRole) ?? null,
      };
    },
  });

  return { session, ready, profile: query.data ?? null, loading: !ready || query.isLoading };
}
