import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Users, UserCheck, Wallet, AlertCircle,
  CalendarDays, UserPlus, TrendingUp, TrendingDown, FileText,
  CalendarCheck, ArrowRight, ClipboardList,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/PageHeader";
import {
  STATS, ATTENDANCE_WEEK, FEE_MONTHLY, RECENT_ADMISSIONS, FEE_DEFAULTERS,
  UPCOMING_EXAMS, formatPKR, SCHOOL,
} from "@/lib/sample-data";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: `Dashboard — ${SCHOOL.name} ERP` },
      { name: "description", content: "Live overview of students, attendance, fees and exams at IQRA Smart School." },
    ],
  }),
  component: Dashboard,
});

type StatCardProps = {
  label: string; value: string; icon: React.ElementType;
  delta?: string; deltaUp?: boolean; tint?: "primary" | "success" | "warning" | "info" | "destructive";
};

const tints: Record<NonNullable<StatCardProps["tint"]>, { icon: string; blob: string }> = {
  primary: { icon: "bg-primary/10 text-primary", blob: "bg-primary/10" },
  success: { icon: "bg-success/15 text-success", blob: "bg-success/10" },
  warning: { icon: "bg-warning/25 text-[oklch(0.45_0.13_75)]", blob: "bg-warning/15" },
  info: { icon: "bg-info/15 text-info", blob: "bg-info/10" },
  destructive: { icon: "bg-destructive/10 text-destructive", blob: "bg-destructive/10" },
};

function StatCard({ label, value, icon: Icon, delta, deltaUp, tint = "primary" }: StatCardProps) {
  const t = tints[tint];
  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-glow hover:-translate-y-0.5 group">
      <div className={`pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl opacity-60 transition-transform group-hover:scale-125 ${t.blob}`} />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
            <p className="mt-3 text-[28px] font-bold tracking-tight leading-none text-foreground">{value}</p>
            {delta && (
              <div className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold ${deltaUp ? "text-success" : "text-destructive"}`}>
                {deltaUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{delta}</span>
              </div>
            )}
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.icon} shadow-sm`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warn" | "success" }) {
  const toneCls = tone === "warn" ? "text-destructive" : tone === "success" ? "text-success" : "text-foreground";
  return (
    <div className="flex flex-col px-5 py-4 first:rounded-l-xl last:rounded-r-xl">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`mt-1 text-lg font-semibold ${toneCls}`}>{value}</span>
    </div>
  );
}

const quickActions = [
  { label: "Add Student", icon: UserPlus, to: "/students" },
  { label: "Mark Attendance", icon: CalendarCheck, to: "/attendance" },
  { label: "Collect Fee", icon: Wallet, to: "/fees" },
  { label: "Generate Report", icon: FileText, to: "/reports" },
];

function Dashboard() {
  const lastName = SCHOOL.principal.split(" ").slice(-1)[0];
  const attendanceRate = ((STATS.presentToday / (STATS.presentToday + STATS.absentToday)) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Assalam-o-Alaikum, ${lastName}`}
        description={`Here's a snapshot of ${SCHOOL.name} for today.`}
        actions={
          <Button asChild>
            <Link to="/students"><UserPlus className="mr-1.5 h-4 w-4" /> New Admission</Link>
          </Button>
        }
      />

      {/* Primary KPIs — 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={STATS.totalStudents.toLocaleString()} icon={Users} delta="+23 this month" deltaUp tint="primary" />
        <StatCard label="Present Today" value={`${attendanceRate}%`} icon={UserCheck} delta={`${STATS.presentToday} of ${STATS.presentToday + STATS.absentToday}`} deltaUp tint="success" />
        <StatCard label="Fees Collected" value={formatPKR(STATS.feesCollected)} icon={Wallet} delta="+8% vs last month" deltaUp tint="info" />
        <StatCard label="Pending Dues" value={formatPKR(STATS.pendingFees)} icon={AlertCircle} delta="34 students" tint="warning" />
      </div>

      {/* Secondary stats — compact strip */}
      <Card>
        <CardContent className="p-0 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border">
          <MiniStat label="Teachers" value={STATS.totalTeachers.toString()} />
          <MiniStat label="New Admissions" value={STATS.recentAdmissions.toString()} tone="success" />
          <MiniStat label="Absent Today" value={STATS.absentToday.toString()} tone="warn" />
          <MiniStat label="Upcoming Exams" value={STATS.upcomingExams.toString()} />
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Attendance this week</CardTitle>
            <CardDescription>Present vs absent students per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ATTENDANCE_WEEK} barGap={4} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 10,
                    fontSize: 12,
                    boxShadow: "var(--shadow-card)",
                  }}
                />
                <Bar dataKey="present" name="Present" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="var(--color-chart-5)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fee collection trend</CardTitle>
            <CardDescription>Monthly totals this session</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={FEE_MONTHLY} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 10,
                    fontSize: 12,
                    boxShadow: "var(--shadow-card)",
                  }}
                  formatter={(v: number) => formatPKR(v)}
                />
                <Line type="monotone" dataKey="amount" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables row */}
      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Recent admissions</CardTitle>
              <CardDescription>Latest students enrolled</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link to="/admissions">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Admission No</TableHead>
                  <TableHead className="text-right">Monthly Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECENT_ADMISSIONS.slice(0, 5).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                            {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">s/o {s.fatherName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="font-normal">Class {s.class}–{s.section}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">{s.admissionNo}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatPKR(s.monthlyFee)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Fee defaulters</CardTitle>
              <CardDescription>Pending dues this month</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link to="/fees">All <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {FEE_DEFAULTERS.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-destructive/10 text-destructive">
                        {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">Class {s.class}–{s.section} · {s.months} mo overdue</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-destructive whitespace-nowrap">{formatPKR(s.pending)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming exams + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4 text-muted-foreground" /> Upcoming exams</CardTitle>
            <CardDescription>Scheduled across classes</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            {UPCOMING_EXAMS.map((e, i) => (
              <div key={i} className="rounded-xl border border-border bg-muted/20 p-4 hover:border-primary/40 hover:bg-accent/30 transition-colors">
                <p className="text-sm font-semibold">{e.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Class {e.class} · {e.subjects} subjects</p>
                <p className="mt-3 text-xs flex items-center gap-1 text-primary font-medium"><CalendarDays className="h-3 w-3" /> {e.date}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick actions</CardTitle>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
