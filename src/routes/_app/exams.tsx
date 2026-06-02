import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, GraduationCap, CalendarDays, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolProfile } from "@/hooks/useSession";

export const Route = createFileRoute("/_app/exams")({
  head: () => ({ meta: [{ title: "Exams & Results — IQRA Smart School ERP" }] }),
  component: Exams,
});

const gradeFor = (pct: number) =>
  pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";

function Exams() {
  const { profile } = useSchoolProfile();
  const schoolId = profile?.schoolId ?? null;
  const qc = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [examName, setExamName] = useState("");
  const [examClass, setExamClass] = useState("");
  const [examStart, setExamStart] = useState("");
  const [examEnd, setExamEnd] = useState("");

  const [selectedExam, setSelectedExam] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [total, setTotal] = useState(100);
  const [marks, setMarks] = useState<Record<string, number>>({});

  const classes = useQuery({
    queryKey: ["classes", schoolId], enabled: !!schoolId,
    queryFn: async () => (await supabase.from("classes").select("id, name").order("grade_level")).data ?? [],
  });
  const subjects = useQuery({
    queryKey: ["subjects", schoolId], enabled: !!schoolId,
    queryFn: async () => (await supabase.from("subjects").select("id, name").order("name")).data ?? [],
  });
  const exams = useQuery({
    queryKey: ["exams", schoolId], enabled: !!schoolId,
    queryFn: async () => (await supabase.from("exams").select("id, name, term, start_date, end_date, class_id, classes(name)").order("start_date", { ascending: false })).data ?? [],
  });

  const currentExam = (exams.data ?? []).find((e: any) => e.id === selectedExam);
  const examClassId = currentExam?.class_id ?? null;

  const students = useQuery({
    queryKey: ["exam-students", schoolId, examClassId], enabled: !!schoolId && !!examClassId,
    queryFn: async () => (await supabase.from("students").select("id, name, admission_no").eq("class_id", examClassId).eq("status", "active").order("name")).data ?? [],
  });

  const existing = useQuery({
    queryKey: ["marks", selectedExam, selectedSubject], enabled: !!selectedExam && !!selectedSubject,
    queryFn: async () => (await supabase.from("marks").select("student_id, obtained, total").eq("exam_id", selectedExam).eq("subject_id", selectedSubject)).data ?? [],
  });

  useEffect(() => {
    const m: Record<string, number> = {};
    (students.data ?? []).forEach((s: any) => { m[s.id] = 0; });
    (existing.data ?? []).forEach((r: any) => { m[r.student_id] = Number(r.obtained); });
    setMarks(m);
    if (existing.data && existing.data[0]) setTotal(Number((existing.data[0] as any).total));
  }, [students.data, existing.data]);

  const createExam = useMutation({
    mutationFn: async () => {
      if (!schoolId || !examName || !examClass) throw new Error("Name and class are required");
      const { error } = await supabase.from("exams").insert({
        school_id: schoolId, name: examName, class_id: examClass,
        start_date: examStart || null, end_date: examEnd || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exams", schoolId] });
      setCreateOpen(false); setExamName(""); setExamClass(""); setExamStart(""); setExamEnd("");
      toast.success("Exam created");
    },
    onError: (e: any) => toast.error("Could not create exam", { description: e.message }),
  });

  const saveMarks = useMutation({
    mutationFn: async () => {
      if (!schoolId || !selectedExam || !selectedSubject) throw new Error("Pick exam and subject");
      const rows = Object.entries(marks).map(([student_id, obtained]) => {
        const pct = total > 0 ? Math.round((obtained / total) * 100) : 0;
        return { school_id: schoolId, exam_id: selectedExam, student_id, subject_id: selectedSubject, obtained, total, grade: gradeFor(pct) };
      });
      const { error } = await supabase.from("marks").upsert(rows, { onConflict: "exam_id,student_id,subject_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marks", selectedExam, selectedSubject] });
      toast.success("Marks saved");
    },
    onError: (e: any) => toast.error("Save failed", { description: e.message }),
  });

  const list = students.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Exams & Results" description="Schedule exams and enter marks for each subject." actions={
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-1.5 h-4 w-4" /> Create Exam</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create exam</DialogTitle><DialogDescription>Set the basic details. You can enter marks afterward.</DialogDescription></DialogHeader>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2"><Label>Name</Label><Input value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="Mid-Term, Final-Term…" /></div>
              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select value={examClass} onValueChange={setExamClass}>
                  <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
                  <SelectContent>{(classes.data ?? []).map((c: any) => <SelectItem key={c.id} value={c.id}>Class {c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Start</Label><Input type="date" value={examStart} onChange={(e) => setExamStart(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>End</Label><Input type="date" value={examEnd} onChange={(e) => setExamEnd(e.target.value)} /></div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={() => createExam.mutate()} disabled={createExam.isPending}>
                {createExam.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save exam
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Scheduled Exams</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(exams.data ?? []).length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-4"><EmptyState icon={GraduationCap} title="No exams scheduled" description="Create your first exam to start recording marks." /></div>
          ) : (exams.data ?? []).map((e: any) => (
            <button key={e.id} onClick={() => setSelectedExam(e.id)}
              className={`text-left rounded-xl border p-4 transition-colors ${selectedExam === e.id ? "border-primary bg-accent/40" : "border-border hover:border-primary/40 hover:bg-accent/30"}`}>
              <p className="text-sm font-semibold">{e.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Class {e.classes?.name ?? "—"}</p>
              <p className="mt-2 text-xs flex items-center gap-1 text-primary"><CalendarDays className="h-3 w-3" /> {e.start_date ?? "—"}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Marks Entry</CardTitle>
          <CardDescription>Pick an exam above, choose a subject, and enter obtained marks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedExam}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>{(subjects.data ?? []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Total Marks</Label><Input type="number" value={total} onChange={(e) => setTotal(Number(e.target.value) || 100)} /></div>
            <div className="flex items-end">
              <Button className="w-full" onClick={() => saveMarks.mutate()} disabled={!selectedExam || !selectedSubject || list.length === 0 || saveMarks.isPending}>
                {saveMarks.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />} Save Marks
              </Button>
            </div>
          </div>

          {!selectedExam ? (
            <EmptyState icon={GraduationCap} title="Select an exam" description="Pick an exam card above to start entering marks." />
          ) : !selectedSubject ? (
            <EmptyState icon={GraduationCap} title="Select a subject" />
          ) : list.length === 0 ? (
            <EmptyState icon={GraduationCap} title="No students in this class" />
          ) : (
            <div className="rounded-xl border border-border overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Student</TableHead><TableHead className="w-32">Obtained</TableHead><TableHead className="w-24">%</TableHead><TableHead className="w-20">Grade</TableHead></TableRow></TableHeader>
                <TableBody>
                  {list.map((s: any) => {
                    const m = marks[s.id] ?? 0;
                    const p = total > 0 ? Math.round((m / total) * 100) : 0;
                    return (
                      <TableRow key={s.id}>
                        <TableCell><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.admission_no}</p></TableCell>
                        <TableCell><Input type="number" value={m} onChange={(e) => setMarks((mm) => ({ ...mm, [s.id]: Math.min(total, Math.max(0, Number(e.target.value) || 0)) }))} className="h-9 w-24" /></TableCell>
                        <TableCell className="text-sm">{p}%</TableCell>
                        <TableCell><Badge variant="secondary" className={p >= 80 ? "bg-success/15 text-success" : p < 50 ? "bg-destructive/10 text-destructive" : ""}>{gradeFor(p)}</Badge></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
