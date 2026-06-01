import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Filter, Download, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
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
  const filtered = STUDENTS.filter(s =>
    (cls === "all" || s.class === cls) &&
    (q === "" || s.name.toLowerCase().includes(q.toLowerCase()) || s.admissionNo.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description={`${STUDENTS.length} students enrolled across ${CLASSES.length} classes.`}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="mr-1.5 h-4 w-4" /> Export</Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Student</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add new student</DialogTitle>
                  <DialogDescription>Enter student details to enroll them in the system.</DialogDescription>
                </DialogHeader>
                <StudentForm />
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Save student</Button>
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
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or admission no…" className="pl-9" />
          </div>
          <Select value={cls} onValueChange={setCls}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableCell className="text-sm text-muted-foreground">{s.admissionNo}</TableCell>
                  <TableCell><Badge variant="secondary">Class {s.class}–{s.section}</Badge></TableCell>
                  <TableCell className="text-sm">{s.fatherName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.guardianPhone}</TableCell>
                  <TableCell className="text-sm font-medium">{formatPKR(s.monthlyFee)}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "Active" ? "default" : "secondary"} className={s.status === "Active" ? "bg-success/15 text-success hover:bg-success/20" : ""}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-sm text-muted-foreground">No students match your filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
