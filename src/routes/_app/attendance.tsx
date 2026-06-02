import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, Save, UserCheck, UserX, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolProfile } from "@/hooks/useSession";

export const Route = createFileRoute("/_app/attendance")({
  head: () => ({ meta: [{ title: "Attendance — IQRA Smart School ERP" }] }),
  component: Attendance,
});

type Status = "present" | "absent" | "late" | "leave";

function Attendance() {
  const { profile } = useSchoolProfile();
  const schoolId = profile?.schoolId ?? null;
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  const [classId, setClassId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  const [date, setDate] = useState(today);
  const [marks, setMarks] = useState<Record<string, Status>>({});

  const classes = useQuery({
    queryKey: ["classes", schoolId],
    enabled: !!schoolId,
    queryFn: async () => (await supabase.from("classes").select("id, name").order("grade_level")).data ?? [],
  });
  const sections = useQuery({
    queryKey: ["sections", schoolId],
    enabled: !!schoolId,
    queryFn: async () => (await supabase.from("sections").select("id, name, class_id").order("name")).data ?? [],
  });

  const studentsQ = useQuery({
    queryKey: ["att-students", schoolId, classId, sectionId],
    enabled: !!schoolId && !!classId,
    queryFn: async () => {
      let q = supabase.from("students").select("id, name, admission_no").eq("class_id", classId).eq("status", "active");
      if (sectionId) q = q.eq("section_id", sectionId);
      const { data, error } = await q.order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const existing = useQuery({
    queryKey: ["att-existing", schoolId, classId, sectionId, date],
    enabled: !!schoolId && !!classId,
    queryFn: async () => {
      const ids = (studentsQ.data ?? []).map((s) => s.id);
      if (ids.length === 0) return [] as any[];
      const { data, error } = await supabase.from("attendance").select("student_id, status").in("student_id", ids).eq("date", date);
      if (error) throw error;
      return data ?? [];
    },
  });

  // hydrate marks from existing
  useMemo(() => {
    const m: Record<string, Status> = {};
    (studentsQ.data ?? []).forEach((s) => { m[s.id] = "present"; });
    (existing.data ?? []).forEach((r: any) => { m[r.student_id] = r.status; });
    setMarks(m);
  }, [studentsQ.data, existing.data]);

  const counts = useMemo(() => {
    const c = { present: 0, absent: 0, late: 0, leave: 0 } as Record<Status, number>;
    Object.values(marks).forEach((s) => c[s]++);
    return c;
  }, [marks]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId) throw new Error("No school");
      const rows = Object.entries(marks).map(([student_id, status]) => ({
        school_id: schoolId, student_id, date, status,
      }));
      const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "student_id,date" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["att-existing", schoolId, classId, sectionId, date] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts", schoolId] });
      toast.success("Attendance saved", { description: `${counts.present} present, ${counts.absent} absent, ${counts.late} late, ${counts.leave} on leave.` });
    },
    onError: (e: any) => toast.error("Save failed", { description: e.message }),
  });

  const availableSections = (sections.data ?? []).filter((s) => !classId || s.class_id === classId);
  const list = studentsQ.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Attendance"
        description="Mark each student present, absent, late or on leave."
        actions={
          <Button onClick={() => saveMutation.mutate()} disabled={!classId || list.length === 0 || saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
            Save Attendance
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label>Class</Label>
            <Select value={classId} onValueChange={(v) => { setClassId(v); setSectionId(""); }}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>{(classes.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>Class {c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Section</Label>
            <Select value={sectionId} onValueChange={setSectionId} disabled={!classId}>
              <SelectTrigger><SelectValue placeholder="All sections" /></SelectTrigger>
              <SelectContent>{availableSections.map((s) => <SelectItem key={s.id} value={s.id}>Section {s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex items-end text-xs text-muted-foreground">
            <CalendarCheck className="mr-1.5 h-4 w-4" /> {list.length} students loaded
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Present</p><p className="text-2xl font-semibold text-success">{counts.present}</p></div>
          <div className="h-9 w-9 rounded-lg bg-success/15 text-success flex items-center justify-center"><UserCheck className="h-5 w-5" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Absent</p><p className="text-2xl font-semibold text-destructive">{counts.absent}</p></div>
          <div className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"><UserX className="h-5 w-5" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Late / Leave</p><p className="text-2xl font-semibold text-[oklch(0.45_0.13_75)]">{counts.late + counts.leave}</p></div>
          <div className="h-9 w-9 rounded-lg bg-warning/20 text-[oklch(0.45_0.13_75)] flex items-center justify-center"><Clock className="h-5 w-5" /></div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Class Roster</CardTitle>
          <CardDescription>{list.length} students · {date}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!classId ? (
            <EmptyState icon={CalendarCheck} title="Pick a class" description="Choose a class above to load the roster." />
          ) : studentsQ.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…</div>
          ) : list.length === 0 ? (
            <EmptyState icon={UserCheck} title="No students in this class" />
          ) : (
            <div className="divide-y divide-border">
              {list.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                        {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.admission_no}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {(["present", "absent", "late", "leave"] as Status[]).map((st) => (
                      <Button
                        key={st}
                        size="sm"
                        variant={marks[s.id] === st ? "default" : "outline"}
                        className={`h-8 px-3 capitalize ${marks[s.id] === st ? (st === "present" ? "bg-success hover:bg-success/90 text-success-foreground" : st === "absent" ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "bg-warning hover:bg-warning/90 text-warning-foreground") : ""}`}
                        onClick={() => setMarks((m) => ({ ...m, [s.id]: st }))}
                      >
                        {st}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
