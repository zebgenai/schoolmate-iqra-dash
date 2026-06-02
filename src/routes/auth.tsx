import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { School, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — IQRA Smart School ERP" }] }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().min(2, "Enter your full name").max(80),
  schoolId: z.string().uuid("Please pick a school"),
  role: z.enum(["school_admin", "teacher", "accountant"]),
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, ready } = useSession();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // sign-in fields
  const [siEmail, setSiEmail] = useState("");
  const [siPw, setSiPw] = useState("");

  // sign-up fields
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPw, setSuPw] = useState("");
  const [suSchool, setSuSchool] = useState("");
  const [suRole, setSuRole] = useState<"school_admin" | "teacher" | "accountant">("school_admin");
  const [schools, setSchools] = useState<{ id: string; name: string; code: string }[]>([]);

  useEffect(() => {
    supabase.from("schools").select("id, name, code").order("name").then(({ data }) => {
      if (data) {
        setSchools(data);
        if (!suSchool && data[0]) setSuSchool(data[0].id);
      }
    });
  }, []);

  if (ready && session) return <Navigate to="/" />;

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signInSchema.safeParse({ email: siEmail, password: siPw });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: siEmail, password: siPw });
    setBusy(false);
    if (error) return toast.error("Sign in failed", { description: error.message });
    toast.success("Welcome back!");
    navigate({ to: "/" });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({
      email: suEmail, password: suPw, fullName: suName, schoolId: suSchool, role: suRole,
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: suEmail,
      password: suPw,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: suName, school_id: suSchool, role: suRole },
      },
    });
    setBusy(false);
    if (error) return toast.error("Sign up failed", { description: error.message });
    toast.success("Account created!", { description: "Signing you in…" });
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-primary to-[oklch(0.38_0.18_265)] text-primary-foreground p-12">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 flex flex-col justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur"><School className="h-6 w-6" /></div>
            <div>
              <p className="text-base font-semibold">IQRA Smart School</p>
              <p className="text-xs opacity-80">School Management ERP</p>
            </div>
          </div>
          <div className="space-y-5">
            <h2 className="text-4xl font-bold leading-tight">A simpler way to run your school.</h2>
            <p className="text-base opacity-90 max-w-md">
              Multi-school ready — Allied School and ICMS School data stay fully separate.
              Sign in to your school's dashboard.
            </p>
          </div>
          <p className="text-xs opacity-70">© {new Date().getFullYear()} IQRA Smart School</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Sign in or create a school staff account.</p>

          <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mt-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="si-email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="si-email" type="email" value={siEmail} onChange={(e) => setSiEmail(e.target.value)} className="pl-9 h-11" autoComplete="email" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="si-pw">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="si-pw" type={showPw ? "text" : "password"} value={siPw} onChange={(e) => setSiPw(e.target.value)} className="pl-9 pr-9 h-11" autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label>Full name</Label>
                  <Input value={suName} onChange={(e) => setSuName(e.target.value)} placeholder="Atif Zeb" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={suEmail} onChange={(e) => setSuEmail(e.target.value)} autoComplete="email" />
                </div>
                <div className="space-y-1.5">
                  <Label>Password</Label>
                  <Input type="password" value={suPw} onChange={(e) => setSuPw(e.target.value)} autoComplete="new-password" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>School</Label>
                    <Select value={suSchool} onValueChange={setSuSchool}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <Select value={suRole} onValueChange={(v) => setSuRole(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school_admin">School Admin</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Demo: email verification is off so you can sign in immediately.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
