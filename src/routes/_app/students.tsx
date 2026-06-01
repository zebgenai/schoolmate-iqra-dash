import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Filter, Download, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
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
import { STUDENTS, CLASSES, SECTIONS, formatPKR } from "@/lib/sample-data";

export const Route = createFileRoute("/_app/students")({
  head: () => ({ meta: [{ title: "Students — IQRA Smart School ERP" }] }),
  component: Students,
});

function StudentForm() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-1.5"><Label>Admission No</Label><Input placeholder="IQ-2025-128" /></div>
      <div className="space-y-1.5"><Label>Student Name</Label><Input placeholder="Ahmad Khan" /></div>
      <div className="space-y-1.5"><Label>Father Name</Label><Input placeholder="Imran Khan" /></div>
      <div className="space-y-1.5"><Label>Guardian Phone</Label><Input placeholder="+92 300 1234567" /></div>
      <div className="space-y-1.5"><Label>WhatsApp Number</Label><Input placeholder="+92 321 1234567" /></div>
      <div className="space-y-1.5">
        <Label>Gender</Label>
        <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent><SelectItem value="m">Male</SelectItem><SelectItem value="f">Female</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5"><Label>Date of Birth</Label><Input type="date" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Class</Label>
          <Select><SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Section</Label>
          <Select><SelectTrigger><SelectValue placeholder="Sec" /></SelectTrigger>
            <SelectContent>{SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5"><Label>Monthly Fee (Rs)</Label><Input type="number" placeholder="3000" /></div>
      <div className="space-y-1.5 sm:col-span-2"><Label>Address</Label><Textarea placeholder="Full home address" rows={2} /></div>
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select defaultValue="active"><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
        </Select>
      </div>
    </div>
  );
}

function Students() {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = STUDENTS.filter(s =>
    (cls === "all" || s.class === cls) &&
    (q === "" || s.name.toLowerCase().includes(q.toLowerCase()) || s.admissionNo.toLowerCase().includes(q.toLowerCase()))
  );

  const handleSave = () => {
    setAddOpen(false);
    toast.success("Student enrolled", { description: "The new student has been added to the register." });
  };

  const handleDelete = (name: string) => {
    toast.success("Student removed", { description: `${name} has been removed from the active register.` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description={`${STUDENTS.length} students enrolled across ${CLASSES.length} classes`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success("Export started", { description: "Your CSV file will download shortly." })}>
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Student</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add new student</DialogTitle>
                  <DialogDescription>Enter the student details to enroll them in the school register.</DialogDescription>
                </DialogHeader>
                <StudentForm />
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleSave}>Save student</Button>
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
          <Select value={cls} onValueChange={setCls}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" aria-label="More filters"><Filter className="h-4 w-4" /></Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No students found"
              description="Try adjusting your search or filters, or add a new student to the register."
              action={
                <Button size="sm" onClick={() => { setQ(""); setCls("all"); }}>Clear filters</Button>
              }
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
                            {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.gender} · {s.dob}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">{s.admissionNo}</TableCell>
                    <TableCell><Badge variant="secondary" className="font-normal">Class {s.class}–{s.section}</Badge></TableCell>
                    <TableCell className="text-sm">{s.fatherName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.guardianPhone}</TableCell>
                    <TableCell className="text-sm font-medium">{formatPKR(s.monthlyFee)}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "Active" ? "default" : "secondary"} className={s.status === "Active" ? "bg-success/15 text-success hover:bg-success/20 border-0" : ""}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" aria-label="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove {s.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the student from the active register. You can restore them later from the archived list.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(s.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
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
