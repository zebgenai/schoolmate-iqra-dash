import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Phone, Loader2, Pencil, Trash2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolProfile } from "@/hooks/useSession";

export const Route = createFileRoute("/_app/teachers")({
  head: () => ({ meta: [{ title: "Teachers — IQRA Smart School ERP" }] }),
  component: Teachers,
});

type TeacherRow = {
  id: string;
  name: string;
  employee_no: string | null;
  email: string | null;
  phone: string | null;
  qualification: string | null;
  subjects: string[] | null;
  status: string;
};

const teacherSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  employee_no: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  qualification: z.string().trim().max(120).optional().or(z.literal("")),
  subjects: z.string().trim().max(200).optional().or(z.literal("")),
});

function Teachers() {
  const { profile } = useSchoolProfile();
  const schoolId = profile?.schoolId ?? null;
  const qc = useQueryClient();

  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const setField = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const teachers = useQuery({
    queryKey: ["teachers", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, name, employee_no, email, phone, qualification, subjects, status")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TeacherRow[];
    },
  });

  const filtered = useMemo(() => {
    const list = teachers.data ?? [];
    const term = q.toLowerCase();
    if (!term) return list;
    return list.filter((t) =>
      t.name.toLowerCase().includes(term) ||
      (t.subjects ?? []).some((s) => s.toLowerCase().includes(term)) ||
      (t.qualification ?? "").toLowerCase().includes(term)
    );
  }, [teachers.data, q]);

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId) throw new Error("No school selected");
      const parsed = teacherSchema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const v = parsed.data;
      const subjectsArr = (v.subjects || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const { error } = await supabase.from("teachers").insert({
        school_id: schoolId,
        name: v.name,
        employee_no: v.employee_no || null,
        email: v.email || null,
        phone: v.phone || null,
        qualification: v.qualification || null,
        subjects: subjectsArr.length ? subjectsArr : null,
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers", schoolId] });
      setAddOpen(false);
      setForm({});
      toast.success("Teacher added", { description: "The faculty member has been added." });
    },
    onError: (e: any) => toast.error("Could not add teacher", { description: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teachers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers", schoolId] });
      toast.success("Teacher removed");
    },
    onError: (e: any) => toast.error("Could not delete", { description: e.message }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers"
        description={teachers.isLoading ? "Loading faculty…" : `${teachers.data?.length ?? 0} active faculty members.`}
        actions={
          <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setForm({}); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Teacher</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Add new teacher</DialogTitle>
                <DialogDescription>Enter the faculty member's details.</DialogDescription>
              </DialogHeader>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2"><Label>Full Name *</Label><Input value={form.name ?? ""} onChange={(e) => setField("name", e.target.value)} placeholder="Mr. Atif Zeb" /></div>
                <div className="space-y-1.5"><Label>Employee No</Label><Input value={form.employee_no ?? ""} onChange={(e) => setField("employee_no", e.target.value)} placeholder="EMP-021" /></div>
                <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone ?? ""} onChange={(e) => setField("phone", e.target.value)} placeholder="+92 300 1234567" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Email</Label><Input type="email" value={form.email ?? ""} onChange={(e) => setField("email", e.target.value)} placeholder="teacher@iqra.edu.pk" /></div>
                <div className="space-y-1.5"><Label>Qualification</Label><Input value={form.qualification ?? ""} onChange={(e) => setField("qualification", e.target.value)} placeholder="M.Sc Mathematics" /></div>
                <div className="space-y-1.5"><Label>Subjects (comma separated)</Label><Input value={form.subjects ?? ""} onChange={(e) => setField("subjects", e.target.value)} placeholder="Math, Physics" /></div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
                  {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save teacher
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or subject…" className="pl-9" />
          </div>
        </CardContent>
      </Card>

      {teachers.isLoading ? (
        <div className="flex items-center justify-center py-14 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading teachers…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={teachers.data?.length ? "No teachers match your search" : "No teachers yet"}
          description={teachers.data?.length ? "Try a different search term." : "Add your first faculty member to get started."}
          action={!teachers.data?.length ? <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Add Teacher</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <Card key={t.id} className="transition-all hover:shadow-md hover:-translate-y-0.5">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {t.name.replace(/^(Mr|Mrs|Ms)\.?\s*/, "").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{t.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(t.subjects ?? []).slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>
                      ))}
                      {!t.subjects?.length && <span className="text-xs text-muted-foreground">No subjects</span>}
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  {t.qualification && <p><span className="text-foreground font-medium">Qualification:</span> {t.qualification}</p>}
                  {t.employee_no && <p><span className="text-foreground font-medium">Employee #:</span> {t.employee_no}</p>}
                  {t.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {t.phone}</p>}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.info("Edit coming soon")}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove {t.name}?</AlertDialogTitle>
                        <AlertDialogDescription>This permanently removes the teacher. This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(t.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Yes, remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
