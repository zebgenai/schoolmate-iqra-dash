import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { School, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SCHOOL } from "@/lib/sample-data";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: `Sign in — ${SCHOOL.name} ERP` },
      { name: "description", content: "Sign in to IQRA Smart School ERP — manage students, attendance, fees and results." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col md:flex-row">
      {/* Left brand panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-primary to-[oklch(0.38_0.18_265)] text-primary-foreground p-12">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 flex flex-col justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <School className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-semibold">{SCHOOL.name}</p>
              <p className="text-xs opacity-80">School Management ERP</p>
            </div>
          </div>
          <div className="space-y-5">
            <h2 className="text-4xl font-bold leading-tight">A simpler way to run your school.</h2>
            <p className="text-base opacity-90 max-w-md">
              Replace paper registers with one calm, modern dashboard for students,
              attendance, fees and exam results.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { v: "842", l: "Students" },
                { v: "46", l: "Teachers" },
                { v: "12", l: "Classes" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-white/10 backdrop-blur p-4">
                  <p className="text-2xl font-bold">{s.v}</p>
                  <p className="text-xs opacity-80">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs opacity-70">© {new Date().getFullYear()} {SCHOOL.name}</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <School className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-semibold">{SCHOOL.name}</p>
              <p className="text-xs text-muted-foreground">School Management ERP</p>
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your school admin account.</p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/" });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" defaultValue="admin@iqrasmartschool.edu.pk" className="pl-9 h-11" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  defaultValue="demopassword"
                  className="pl-9 pr-9 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Checkbox id="remember" defaultChecked />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                Keep me signed in
              </Label>
            </div>
            <Button type="submit" className="w-full h-11 text-sm font-medium">
              Sign in
            </Button>
            <p className="text-center text-xs text-muted-foreground pt-2">
              Demo credentials pre-filled. <Link to="/" className="text-primary hover:underline">Skip to dashboard</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
