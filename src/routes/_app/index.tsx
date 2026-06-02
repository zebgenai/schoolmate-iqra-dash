import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users, UserCheck, Wallet, AlertCircle, UserPlus,
  TrendingUp, FileText, CalendarCheck, ArrowRight, ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolProfile } from "@/hooks/useSession";
import { formatPKR } from "@/lib/sample-data";

export const Route = createFileRoute("/_app/")({
  head: () => ({ meta: [{ title: "Dashboard — IQRA Smart School ERP" }] }),
  component: Dashboard,
});

function StatCard({ label, value, icon: Icon, tint = "primary" }: { label: string; value: string; icon: any; tint?: "primary" | "success" | "warning" | "info" | "destructive" }) {
  const tints: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/25 text-[oklch(0.45_0.13_75)]",
    info: "bg-info/15 text-info",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-glow hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
            <p className="mt-3 text-[28px] font-bold tracking-tight leading-none text-foreground">{value}</p>
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tints[tint]} shadow-sm`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const quickActions = [
  { label: "Add Student", icon: UserPlus, to: "/students" },
  { label: "Mark Attendance", icon: CalendarCheck, to: "/attendance" },
  { label: "Collect Fee", icon: Wallet, to: "/fees" },
  { label: "Generate Report", icon: FileText, to: "/reports" },
];

function Dashboard() {
  const { profile } = useSchoolProfile();
  const schoolId = profile?.schoolId ?? null;
  const today = new Date().toISOString().slice(0, 10);
  const [todayLabel, setTodayLabel] = useState("");
  useEffect(() => {
    setTodayLabel(new Date().toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  const counts = useQuery({
    queryKey: ["dashboard-counts", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const now = new Date();
      const [students, teachers, todayAtt, monthPays, exams, recents] = await Promise.all([
        supabase.from("students").select("id, monthly_fee", { count: "exact" }).eq("status", "active"),
        supabase.from("teachers").select("id", { count: "exact", head: true }),
        supabase.from("attendance").select("status").eq("date", today),
        supabase.from("fee_payments").select("amount_paid").eq("year", now.getFullYear()).eq("month", now.getMonth() + 1),
        supabase.from("exams").select("id", { count: "exact", head: true }).gte("start_date", today),
        supabase.from("students").select("id, name, admission_no, father_name, monthly_fee, classes(name), sections(name)").order("created_at", { ascending: false }).limit(5),
      ]);
      const studentCount = students.count ?? 0;
      const totalDue = (students.data ?? []).reduce((a: number, s: any) => a + Number(s.monthly_fee ?? 0), 0);
      const present = (todayAtt.data ?? []).filter((a: any) => a.status === "present").length;
      const totalMarked = (todayAtt.data ?? []).length;
      const absent = totalMarked - present;
      const collected = (monthPays.data ?? []).reduce((a: number, p: any) => a + Number(p.amount_paid), 0);
      return {
        studentCount,
        teacherCount: teachers.count ?? 0,
        present, absent, totalMarked,
        collected, pending: Math.max(0, totalDue - collected),
        upcomingExams: exams.count ?? 0,
        recentAdmissions: recents.data ?? [],
      };
    },
  });

  const c = counts.data;
  const attendanceRate = c && c.totalMarked > 0 ? ((c.present / c.totalMarked) * 100).toFixed(1) : "—";
  const lastName = (profile?.fullName || "").split(" ").slice(-1)[0] || "there";

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/8 via-background to-[oklch(0.62_0.18_285)]/8 px-6 py-7 sm:px-8">
        <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 min-h-[1rem]">{todayLabel}</p>
            <h1 className="text-3xl sm:text-[32px] font-bold tracking-tight leading-tight text-foreground">
              Assalam-o-Alaikum,{" "}
              <span className="bg-gradient-to-r from-primary to-[oklch(0.62_0.18_285)] bg-clip-text text-transparent">{lastName}</span>
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Here's a snapshot of {profile?.schoolName ?? "your school"} for today.</p>
          </div>
          <Button asChild size="lg" className="shadow-glow">
            <Link to="/students"><UserPlus className="mr-1.5 h-4 w-4" /> New Admission</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={counts.isLoading ? "…" : String(c?.studentCount ?? 0)} icon={Users} tint="primary" />
        <StatCard label="Present Today" value={counts.isLoading ? "…" : `${attendanceRate}${attendanceRate !== "—" ? "%" : ""}`} icon={UserCheck} tint="success" />
        <StatCard label="Fees Collected" value={counts.isLoading ? "…" : formatPKR(c?.collected ?? 0)} icon={Wallet} tint="info" />
        <StatCard label="Pending Dues" value={counts.isLoading ? "…" : formatPKR(c?.pending ?? 0)} icon={AlertCircle} tint="warning" />
      </div>

      <Card>
        <CardContent className="p-0 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border">
          <div className="flex flex-col px-5 py-4"><span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Teachers</span><span className="mt-1 text-lg font-semibold">{c?.teacherCount ?? 0}</span></div>
          <div className="flex flex-col px-5 py-4"><span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Marked Today</span><span className="mt-1 text-lg font-semibold">{c?.totalMarked ?? 0}</span></div>
          <div className="flex flex-col px-5 py-4"><span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Absent Today</span><span className="mt-1 text-lg font-semibold text-destructive">{c?.absent ?? 0}</span></div>
          <div className="flex flex-col px-5 py-4"><span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Upcoming Exams</span><span className="mt-1 text-lg font-semibold">{c?.upcomingExams ?? 0}</span></div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Recent admissions</CardTitle>
              <CardDescription>Latest students enrolled</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link to="/students">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {(c?.recentAdmissions ?? []).length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">No admissions yet. <Link to="/students" className="text-primary underline">Add your first student</Link>.</div>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead>Adm. No</TableHead><TableHead className="text-right">Monthly Fee</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(c?.recentAdmissions ?? []).map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-accent text-accent-foreground">{s.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                          <div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">s/o {s.father_name ?? "—"}</p></div>
                        </div>
                      </TableCell>
                      <TableCell>{s.classes?.name ? <Badge variant="secondary">Class {s.classes.name}{s.sections?.name ? `–${s.sections.name}` : ""}</Badge> : "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">{s.admission_no}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatPKR(Number(s.monthly_fee ?? 0))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4 text-muted-foreground" /> Quick actions</CardTitle>
            <CardDescription>Common daily tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((a) => (
              <Button key={a.label} asChild variant="outline" className="w-full justify-start gap-2 h-10">
                <Link to={a.to}>
                  <a.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-left">{a.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </Button>
            ))}
            <div className="mt-3 rounded-lg border border-border/60 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Live data</p>
              <p className="mt-1">All numbers above reflect real records from {profile?.schoolName ?? "your school"}.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
