import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Users, GraduationCap, UserCheck, UserX, Wallet, AlertCircle,
  CalendarDays, UserPlus, TrendingUp, TrendingDown, FileText,
  CalendarCheck, Plus, ClipboardList,
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

const tints: Record<NonNullable<StatCardProps["tint"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-[oklch(0.45_0.13_75)]",
  info: "bg-info/15 text-info",
  destructive: "bg-destructive/10 text-destructive",
};

function StatCard({ label, value, icon: Icon, delta, deltaUp, tint = "primary" }: StatCardProps) {
  return (
    <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
            {delta && (
              <div className={`mt-1.5 flex items-center gap-1 text-xs ${deltaUp ? "text-success" : "text-destructive"}`}>
                {deltaUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{delta}</span>
              </div>
            )}
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tints[tint]}`}>
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
  { label: "Create Exam", icon: GraduationCap, to: "/exams" },
  { label: "Generate Report", icon: FileText, to: "/reports" },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${SCHOOL.principal.split(" ").slice(-1)[0]}. Here's what's happening today.`}
        actions={
          <Button asChild>
            <Link to="/students"><Plus className="mr-1 h-4 w-4" /> New Admission</Link>
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={STATS.totalStudents.toLocaleString()} icon={Users} delta="+23 this month" deltaUp tint="primary" />
        <StatCard label="Total Teachers" value={STATS.totalTeachers.toString()} icon={GraduationCap} tint="info" />
        <StatCard label="Present Today" value={STATS.presentToday.toString()} icon={UserCheck} delta="92.8% attendance" deltaUp tint="success" />
        <StatCard label="Absent Today" value={STATS.absentToday.toString()} icon={UserX} delta="-7 vs yesterday" deltaUp tint="destructive" />
        <StatCard label="Fees Collected (Aug)" value={formatPKR(STATS.feesCollected)} icon={Wallet} delta="+8% MoM" deltaUp tint="success" />
        <StatCard label="Pending Fees" value={formatPKR(STATS.pendingFees)} icon={AlertCircle} delta="34 students" tint="warning" />
        <StatCard label="Upcoming Exams" value={STATS.upcomingExams.toString()} icon={CalendarDays} tint="info" />
        <StatCard label="Recent Admissions" value={STATS.recentAdmissions.toString()} icon={UserPlus} delta="last 30 days" deltaUp tint="primary" />
      </div>

      {/* Quick actions */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground self-center mr-2 px-2">Quick actions:</span>
          {quickActions.map((a) => (
            <Button key={a.label} asChild variant="outline" size="sm" className="gap-1.5">
              <Link to={a.to}><a.icon className="h-4 w-4" /> {a.label}</Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Attendance Summary</CardTitle>
            <CardDescription>Present vs absent — this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ATTENDANCE_WEEK} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="present" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="absent" fill="var(--color-chart-5)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Fee Collection</CardTitle>
            <CardDescription>Trend across the academic session</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={FEE_MONTHLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => formatPKR(v)}
                />
                <Line type="monotone" dataKey="amount" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables row */}
      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Admissions</CardTitle>
              <CardDescription>Newly enrolled students</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild><Link to="/admissions">View all</Link></Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Adm. No</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECENT_ADMISSIONS.map((s) => (
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
                          <p className="text-xs text-muted-foreground">{s.fatherName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">Class {s.class}–{s.section}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.admissionNo}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatPKR(s.monthlyFee)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Fee Defaulters</CardTitle>
              <CardDescription>Pending dues this month</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild><Link to="/fees">All</Link></Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {FEE_DEFAULTERS.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-destructive/10 text-destructive">
                        {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">Class {s.class}–{s.section} · {s.months} mo</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-destructive whitespace-nowrap">{formatPKR(s.pending)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming exams */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Upcoming Exams</CardTitle>
          <CardDescription>Scheduled across all classes</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {UPCOMING_EXAMS.map((e, i) => (
            <div key={i} className="rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-accent/30 transition-colors">
              <p className="text-sm font-semibold">{e.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Class {e.class} · {e.subjects} subjects</p>
              <p className="mt-2 text-xs flex items-center gap-1 text-primary"><CalendarDays className="h-3 w-3" /> {e.date}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
