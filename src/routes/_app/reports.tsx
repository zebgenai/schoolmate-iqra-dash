import { createFileRoute } from "@tanstack/react-router";
import {
  Users, CalendarCheck, Wallet, AlertCircle, GraduationCap, UserPlus,
  Filter, Download, Printer, FileText,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CLASSES } from "@/lib/sample-data";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports — IQRA Smart School ERP" }] }),
  component: Reports,
});

const reports = [
  { name: "Student List Report", desc: "Class-wise list with full details", icon: Users, tint: "bg-primary/10 text-primary" },
  { name: "Attendance Report", desc: "Daily, monthly or term-wise attendance", icon: CalendarCheck, tint: "bg-success/15 text-success" },
  { name: "Fee Collection Report", desc: "Collections by date range and class", icon: Wallet, tint: "bg-info/15 text-info" },
  { name: "Pending Fee Report", desc: "Outstanding dues by student/class", icon: AlertCircle, tint: "bg-destructive/10 text-destructive" },
  { name: "Result Report", desc: "Exam results, grades and rankings", icon: GraduationCap, tint: "bg-warning/20 text-[oklch(0.45_0.13_75)]" },
  { name: "Admission Report", desc: "New admissions for any period", icon: UserPlus, tint: "bg-accent text-accent-foreground" },
];

function Reports() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate, print or export school-wide reports." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Filter className="h-4 w-4" /> Filters</CardTitle>
          <CardDescription>Applied to all report types below.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5"><Label>Class</Label>
            <Select defaultValue="all"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>From</Label><Input type="date" defaultValue="2026-06-01" /></div>
          <div className="space-y-1.5"><Label>To</Label><Input type="date" defaultValue="2026-06-30" /></div>
          <div className="flex items-end"><Button className="w-full"><FileText className="mr-1.5 h-4 w-4" /> Apply</Button></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => (
          <Card key={r.name} className="transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30">
            <CardContent className="p-5">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${r.tint}`}>
                <r.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{r.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              <div className="mt-5 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1"><Printer className="mr-1.5 h-4 w-4" /> Print</Button>
                <Button variant="outline" size="sm" className="flex-1"><Download className="mr-1.5 h-4 w-4" /> Export</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
