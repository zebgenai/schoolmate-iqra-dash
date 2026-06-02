import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Download, Pencil, Trash2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolProfile } from "@/hooks/useSession";
import { formatPKR } from "@/lib/sample-data";

export const Route = createFileRoute("/_app/students")({
  head: () => ({ meta: [{ title: "Students — IQRA Smart School ERP" }] }),
  component: Students,
});

type StudentRow = {
  id: string;
  admission_no: string;
  name: string;
  father_name: string | null;
  guardian_phone: string | null;
  whatsapp: string | null;
  gender: "male" | "female" | null;
  dob: string | null;
  monthly_fee: number | null;
  address: string | null;
  status: "active" | "inactive";
  class_id: string | null;
  section_id: string | null;
  classes?: { name: string } | null;
  sections?: { name: string } | null;
};

const studentSchema = z.object({
  admission_no: z.string().trim().min(1, "Admission No is required").max(40),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  father_name: z.string().trim().max(80).optional().or(z.literal("")),
  guardian_phone: z.string().trim().max(30).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  gender: z.enum(["male", "female"]).optional(),
  dob: z.string().optional().or(z.literal("")),
  class_id: z.string().uuid("Pick a class").optional().or(z.literal("")),
  section_id: z.string().uuid().optional().or(z.literal("")),
  monthly_fee: z.coerce.number().min(0).max(1_000_000).optional(),
  address: z.string().trim().max(300).optional().or(z.literal("")),
});

function Students() {
  const { profile } = useSchoolProfile();
  const schoolId = profile?.schoolId ?? null;
  const qc = useQueryClient();

  const [q, setQ] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);

  const classes = useQuery({
    queryKey: ["classes", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("id, name").order("grade_level");
      if (error) throw error;
      return data ?? [];
    },
  });

  const sections = useQuery({
    queryKey: ["sections", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase.from("sections").select("id, name, class_id").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const students = useQuery({
    queryKey: ["students", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, classes(name), sections(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as StudentRow[];
    },
  });

  const filtered = useMemo(() => {
    const list = students.data ?? [];
    return list.filter((s) =>
      (classFilter === "all" || s.class_id === classFilter) &&
      (q === "" || s.name.toLowerCase().includes(q.toLowerCase()) || s.admission_no.toLowerCase().includes(q.toLowerCase()))
    );
  }, [students.data, q, classFilter]);

  // form state
  const [form, setForm] = useState<Record<string, any>>({});
  const setField = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId) throw new Error("No school selected");
      const parsed = studentSchema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const v = parsed.data;
      const payload = {
        school_id: schoolId,
        admission_no: v.admission_no,
        name: v.name,
        father_name: v.father_name || null,
        guardian_phone: v.guardian_phone || null,
        whatsapp: v.whatsapp || null,
        gender: v.gender || null,
        dob: v.dob || null,
        class_id: v.class_id || null,
        section_id: v.section_id || null,
        monthly_fee: v.monthly_fee ?? 0,
        address: v.address || null,
        status: "active" as const,
      };
      const { error } = await supabase.from("students").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students", schoolId] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts", schoolId] });
      setAddOpen(false);
      setForm({});
      toast.success("Student enrolled", { description: "The new student has been added to the register." });
    },
    onError: (e: any) => toast.error("Could not save student", { description: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students", schoolId] });
      toast.success("Student removed");
    },
    onError: (e: any) => toast.error("Could not delete", { description: e.message }),
  });

  const availableSections = (sections.data ?? []).filter((s) => !form.class_id || s.class_id === form.class_id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description={students.isLoading ? "Loading register…" : `${students.data?.length ?? 0} students enrolled at ${profile?.schoolName ?? "your school"}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.info("Export coming soon")}>
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
            <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setForm({}); }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Student</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add new student</DialogTitle>
                  <DialogDescription>Enter the student details to enroll them in the school register.</DialogDescription>
                </DialogHeader>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Admission No *</Label><Input value={form.admission_no ?? ""} onChange={(e) => setField("admission_no", e.target.value)} placeholder="IQ-2025-128" /></div>
                  <div className="space-y-1.5"><Label>Student Name *</Label><Input value={form.name ?? ""} onChange={(e) => setField("name", e.target.value)} placeholder="Ahmad Khan" /></div>
                  <div className="space-y-1.5"><Label>Father Name</Label><Input value={form.father_name ?? ""} onChange={(e) => setField("father_name", e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Guardian Phone</Label><Input value={form.guardian_phone ?? ""} onChange={(e) => setField("guardian_phone", e.target.value)} placeholder="+92 300 1234567" /></div>
                  <div className="space-y-1.5"><Label>WhatsApp</Label><Input value={form.whatsapp ?? ""} onChange={(e) => setField("whatsapp", e.target.value)} /></div>
                  <div className="space-y-1.5">
                    <Label>Gender</Label>
                    <Select value={form.gender ?? ""} onValueChange={(v) => setField("gender", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Date of Birth</Label><Input type="date" value={form.dob ?? ""} onChange={(e) => setField("dob", e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Class</Label>
                      <Select value={form.class_id ?? ""} onValueChange={(v) => setField("class_id", v)}>
                        <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
                        <SelectContent>{(classes.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>Class {c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Section</Label>
                      <Select value={form.section_id ?? ""} onValueChange={(v) => setField("section_id", v)}>
                        <SelectTrigger><SelectValue placeholder="Sec" /></SelectTrigger>
                        <SelectContent>{availableSections.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5"><Label>Monthly Fee (Rs)</Label><Input type="number" value={form.monthly_fee ?? ""} onChange={(e) => setField("monthly_fee", e.target.value)} placeholder="3000" /></div>
                  <div className="space-y-1.5 sm:col-span-2"><Label>Address</Label><Textarea value={form.address ?? ""} onChange={(e) => setField("address", e.target.value)} rows={2} /></div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
                    {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save student
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or admission number…" className="pl-9" />
          </div>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {(classes.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>Class {c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {students.isLoading ? (
            <div className="flex items-center justify-center py-14 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading students…
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title={students.data?.length ? "No students match" : "No students yet"}
              description={students.data?.length ? "Try clearing search or filters." : "Add your first student to get started."}
              action={students.data?.length
                ? <Button size="sm" onClick={() => { setQ(""); setClassFilter("all"); }}>Clear filters</Button>
                : <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Add Student</Button>}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Student</TableHead>
                  <TableHead>Adm. No</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Father</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
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
                          <p className="text-xs text-muted-foreground capitalize">{s.gender ?? ""} {s.dob ? `· ${s.dob}` : ""}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">{s.admission_no}</TableCell>
                    <TableCell>
                      {s.classes?.name ? <Badge variant="secondary" className="font-normal">Class {s.classes.name}{s.sections?.name ? `–${s.sections.name}` : ""}</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-sm">{s.father_name ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.guardian_phone ?? "—"}</TableCell>
                    <TableCell className="text-sm font-medium">{formatPKR(Number(s.monthly_fee ?? 0))}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "active" ? "default" : "secondary"} className={s.status === "active" ? "bg-success/15 text-success hover:bg-success/20 border-0 capitalize" : "capitalize"}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit" onClick={() => toast.info("Edit coming soon")}><Pencil className="h-3.5 w-3.5" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove {s.name}?</AlertDialogTitle>
                              <AlertDialogDescription>This permanently removes the student from the register. This cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(s.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Yes, remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
