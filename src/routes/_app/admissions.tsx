import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, Download, Printer, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { STUDENTS, formatPKR } from "@/lib/sample-data";

export const Route = createFileRoute("/_app/admissions")({
  head: () => ({ meta: [{ title: "Admissions — IQRA Smart School ERP" }] }),
  component: Admissions,
});

function Admissions() {
  const admissions = STUDENTS.slice(0, 12);
  return (
    <div className="space-y-6">
      <PageHeader title="Admissions" description="Recent enrollments — last 30 days." actions={
        <>
          <Button variant="outline" size="sm"><Printer className="mr-1.5 h-4 w-4" /> Print</Button>
          <Button variant="outline" size="sm"><Download className="mr-1.5 h-4 w-4" /> Export</Button>
          <Button size="sm"><UserPlus className="mr-1.5 h-4 w-4" /> New Admission</Button>
        </>
      } />

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground tracking-wide">This Month</p><p className="mt-2 text-2xl font-semibold">23</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground tracking-wide">This Session</p><p className="mt-2 text-2xl font-semibold">142</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground tracking-wide">Avg. Monthly Fee</p><p className="mt-2 text-2xl font-semibold">{formatPKR(3450)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Admission Records</CardTitle>
            <CardDescription>{admissions.length} students</CardDescription>
          </div>
          <div className="relative w-64 hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" className="pl-9 h-9" />
          </div>
        </CardHeader>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {admissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-accent text-accent-foreground">{s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                      <p className="text-sm font-medium">{s.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.admissionNo}</TableCell>
                  <TableCell><Badge variant="secondary">Class {s.class}–{s.section}</Badge></TableCell>
                  <TableCell className="text-sm">{s.fatherName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.guardianPhone}</TableCell>
                  <TableCell className="text-sm font-medium">{formatPKR(s.monthlyFee)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
