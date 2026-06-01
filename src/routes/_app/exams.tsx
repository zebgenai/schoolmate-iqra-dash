import { createFileRoute } from "@tanstack/react-router";
import { Plus, Printer, GraduationCap, CalendarDays } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { STUDENTS, CLASSES, SUBJECTS, UPCOMING_EXAMS, SCHOOL } from "@/lib/sample-data";

export const Route = createFileRoute("/_app/exams")({
  head: () => ({ meta: [{ title: "Exams & Results — IQRA Smart School ERP" }] }),
  component: Exams,
});

const gradeFor = (pct: number) =>
  pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";

function Exams() {
  const studentsForClass = STUDENTS.slice(0, 10);
  const [marks, setMarks] = useState<Record<string, number>>(() =>
    Object.fromEntries(studentsForClass.map((s, i) => [s.id, 60 + ((i * 7) % 38)]))
  );
  const total = 100;

  const sampleResult = studentsForClass[0];
  const sampleSubjects = SUBJECTS.map((sub, i) => {
    const obtained = 60 + ((i * 9 + 3) % 38);
    return { sub, obtained, total: 100 };
  });
  const totalObtained = sampleSubjects.reduce((a, s) => a + s.obtained, 0);
  const totalMax = sampleSubjects.length * 100;
  const pct = Math.round((totalObtained / totalMax) * 100);

  return (
    <div className="space-y-6">
      <PageHeader title="Exams & Results" description="Schedule exams, enter marks and generate result cards." actions={
        <Button><Plus className="mr-1.5 h-4 w-4" /> Create Exam</Button>
      } />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Upcoming Exams</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Marks Entry — Mid-Term</CardTitle>
          <CardDescription>Class 5 · Mathematics · Out of 100</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label>Class</Label>
              <Select defaultValue="5"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Subject</Label>
              <Select defaultValue="Mathematics"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Total Marks</Label><Input type="number" defaultValue={100} /></div>
          </div>
          <div className="rounded-xl border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="w-32">Obtained</TableHead>
                  <TableHead className="w-24">%</TableHead>
                  <TableHead className="w-20">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsForClass.map((s) => {
                  const m = marks[s.id];
                  const p = Math.round((m / total) * 100);
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.admissionNo}</p>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={m}
                          onChange={(e) => setMarks((mm) => ({ ...mm, [s.id]: Math.min(total, Math.max(0, Number(e.target.value) || 0)) }))}
                          className="h-9 w-24"
                        />
                      </TableCell>
                      <TableCell className="text-sm">{p}%</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={p >= 80 ? "bg-success/15 text-success" : p < 50 ? "bg-destructive/10 text-destructive" : ""}>
                          {gradeFor(p)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save Marks</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Result Card Preview</CardTitle>
            <CardDescription>Mid-Term · {sampleResult.name}</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Printer className="mr-1.5 h-4 w-4" /> Print Result</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Print preview</DialogTitle><DialogDescription>Ready to send to printer.</DialogDescription></DialogHeader>
              <p className="text-sm text-muted-foreground">In a connected build, this would open the browser print dialog.</p>
              <DialogFooter><Button>OK</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <p className="text-base font-semibold">{SCHOOL.name}</p>
                <p className="text-xs text-muted-foreground">{SCHOOL.address}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Result Card</p>
                <p className="text-xs">Mid-Term · {SCHOOL.session}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Student</p><p className="font-medium">{sampleResult.name}</p></div>
              <div><p className="text-xs text-muted-foreground">Father</p><p className="font-medium">{sampleResult.fatherName}</p></div>
              <div><p className="text-xs text-muted-foreground">Class</p><p className="font-medium">Class {sampleResult.class}–{sampleResult.section}</p></div>
              <div><p className="text-xs text-muted-foreground">Adm. No</p><p className="font-medium">{sampleResult.admissionNo}</p></div>
            </div>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Subject</TableHead><TableHead className="text-right">Obtained</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Grade</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {sampleSubjects.map((s) => {
                  const p = Math.round((s.obtained / s.total) * 100);
                  return (
                    <TableRow key={s.sub}>
                      <TableCell className="text-sm">{s.sub}</TableCell>
                      <TableCell className="text-right text-sm">{s.obtained}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{s.total}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{gradeFor(p)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/40 p-4 text-center">
              <div><p className="text-xs text-muted-foreground">Total</p><p className="font-semibold">{totalObtained} / {totalMax}</p></div>
              <div><p className="text-xs text-muted-foreground">Percentage</p><p className="font-semibold">{pct}%</p></div>
              <div><p className="text-xs text-muted-foreground">Grade</p><p className="font-semibold text-primary">{gradeFor(pct)}</p></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
