import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, Save, UserCheck, UserX, Clock } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STUDENTS, CLASSES, SECTIONS } from "@/lib/sample-data";

export const Route = createFileRoute("/_app/attendance")({
  head: () => ({ meta: [{ title: "Attendance — IQRA Smart School ERP" }] }),
  component: Attendance,
});

type Status = "P" | "A" | "L";

const statusLabel: Record<Status, string> = { P: "Present", A: "Absent", L: "Leave" };
const statusStyles: Record<Status, string> = {
  P: "bg-success text-success-foreground hover:bg-success/90",
  A: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  L: "bg-warning text-warning-foreground hover:bg-warning/90",
};

function Attendance() {
  const today = new Date().toISOString().slice(0, 10);
  const list = STUDENTS.slice(0, 14);
  const [marks, setMarks] = useState<Record<string, Status>>(() =>
    Object.fromEntries(list.map((s, i) => [s.id, (i % 8 === 0 ? "A" : i % 11 === 0 ? "L" : "P") as Status]))
  );

  const counts = list.reduce(
    (acc, s) => {
      const v = marks[s.id];
      acc[v] += 1;
      return acc;
    },
    { P: 0, A: 0, L: 0 } as Record<Status, number>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Mark daily attendance for each class and section."
        actions={<Button><Save className="mr-1.5 h-4 w-4" /> Save Attendance</Button>}
      />

      <Card>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label>Class</Label>
            <Select defaultValue="5">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Section</Label>
            <Select defaultValue="A">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SECTIONS.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" defaultValue={today} />
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full"><CalendarCheck className="mr-1.5 h-4 w-4" /> Load Class</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Present</p><p className="text-2xl font-semibold text-success">{counts.P}</p></div>
          <div className="h-9 w-9 rounded-lg bg-success/15 text-success flex items-center justify-center"><UserCheck className="h-5 w-5" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Absent</p><p className="text-2xl font-semibold text-destructive">{counts.A}</p></div>
          <div className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"><UserX className="h-5 w-5" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Leave</p><p className="text-2xl font-semibold text-[oklch(0.45_0.13_75)]">{counts.L}</p></div>
          <div className="h-9 w-9 rounded-lg bg-warning/20 text-[oklch(0.45_0.13_75)] flex items-center justify-center"><Clock className="h-5 w-5" /></div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Class 5 – Section A</CardTitle>
          <CardDescription>{list.length} students · {today}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border">
          {list.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                    {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.admissionNo}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {(["P", "A", "L"] as Status[]).map((st) => (
                  <Button
                    key={st}
                    size="sm"
                    variant={marks[s.id] === st ? "default" : "outline"}
                    className={`h-8 w-8 p-0 ${marks[s.id] === st ? statusStyles[st] : ""}`}
                    onClick={() => setMarks((m) => ({ ...m, [s.id]: st }))}
                    aria-label={statusLabel[st]}
                  >
                    {st}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
