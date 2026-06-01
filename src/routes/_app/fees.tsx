import { createFileRoute } from "@tanstack/react-router";
import { Wallet, AlertCircle, TrendingUp, Receipt, Printer, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { STUDENTS, STATS, formatPKR, SCHOOL } from "@/lib/sample-data";

export const Route = createFileRoute("/_app/fees")({
  head: () => ({ meta: [{ title: "Fees — IQRA Smart School ERP" }] }),
  component: Fees,
});

const feeRows = STUDENTS.slice(0, 16).map((s, i) => ({
  ...s,
  paid: i % 3 !== 0,
  amount: s.monthlyFee,
  due: i % 3 === 0 ? s.monthlyFee : 0,
}));

function FeeReceipt({ student }: { student: typeof feeRows[number] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between border-b border-border pb-4">
        <div>
          <p className="text-sm font-semibold">{SCHOOL.name}</p>
          <p className="text-xs text-muted-foreground">{SCHOOL.address}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Fee Receipt</p>
          <p className="text-xs font-mono">RCP-{student.admissionNo}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-xs text-muted-foreground">Student</p><p className="font-medium">{student.name}</p></div>
        <div><p className="text-xs text-muted-foreground">Class</p><p className="font-medium">Class {student.class}–{student.section}</p></div>
        <div><p className="text-xs text-muted-foreground">Father</p><p className="font-medium">{student.fatherName}</p></div>
        <div><p className="text-xs text-muted-foreground">Month</p><p className="font-medium">August 2026</p></div>
      </div>
      <div className="rounded-lg bg-muted/40 p-4 space-y-1.5 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Monthly Tuition</span><span>{formatPKR(student.amount)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-success">– {formatPKR(0)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Late Fine</span><span>{formatPKR(0)}</span></div>
        <div className="flex justify-between border-t border-border pt-2 font-semibold"><span>Total</span><span>{formatPKR(student.amount)}</span></div>
      </div>
      <div className="flex justify-end">
        <Button size="sm" variant="outline"><Printer className="mr-1.5 h-4 w-4" /> Print Receipt</Button>
      </div>
    </div>
  );
}

function Fees() {
  return (
    <div className="space-y-6">
      <PageHeader title="Fee Management" description="Track collections, dues and receipts." actions={
        <Button><Receipt className="mr-1.5 h-4 w-4" /> New Collection</Button>
      } />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-5 flex items-start justify-between">
          <div><p className="text-xs uppercase text-muted-foreground tracking-wide">Collected (Aug)</p>
            <p className="mt-2 text-2xl font-semibold">{formatPKR(STATS.feesCollected)}</p>
            <p className="mt-1 text-xs text-success flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +8% MoM</p></div>
          <div className="h-10 w-10 rounded-lg bg-success/15 text-success flex items-center justify-center"><Wallet className="h-5 w-5" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-start justify-between">
          <div><p className="text-xs uppercase text-muted-foreground tracking-wide">Pending</p>
            <p className="mt-2 text-2xl font-semibold">{formatPKR(STATS.pendingFees)}</p>
            <p className="mt-1 text-xs text-muted-foreground">34 students</p></div>
          <div className="h-10 w-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"><AlertCircle className="h-5 w-5" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-start justify-between">
          <div><p className="text-xs uppercase text-muted-foreground tracking-wide">Collection Rate</p>
            <p className="mt-2 text-2xl font-semibold">79.6%</p>
            <p className="mt-1 text-xs text-muted-foreground">vs 76% last month</p></div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><TrendingUp className="h-5 w-5" /></div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Student Fee Status</CardTitle>
            <CardDescription>Monthly tuition — current cycle</CardDescription>
          </div>
          <div className="relative w-64 hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search student…" className="pl-9 h-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeRows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-accent text-accent-foreground">{s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                      <div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.admissionNo}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">Class {s.class}–{s.section}</Badge></TableCell>
                  <TableCell className="text-sm font-medium">{formatPKR(s.amount)}</TableCell>
                  <TableCell>
                    {s.paid
                      ? <Badge className="bg-success/15 text-success hover:bg-success/20">Paid</Badge>
                      : <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20">Unpaid</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant={s.paid ? "outline" : "default"}>
                          {s.paid ? "View Receipt" : "Collect Fee"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>{s.paid ? "Fee Receipt" : "Collect Fee"}</DialogTitle>
                          <DialogDescription>{s.name} · Class {s.class}–{s.section}</DialogDescription>
                        </DialogHeader>
                        {!s.paid && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5"><Label>Amount</Label><Input type="number" defaultValue={s.amount} /></div>
                            <div className="space-y-1.5"><Label>Discount</Label><Input type="number" defaultValue={0} /></div>
                            <div className="space-y-1.5"><Label>Late Fine</Label><Input type="number" defaultValue={0} /></div>
                            <div className="space-y-1.5"><Label>Date</Label><Input type="date" defaultValue={new Date().toISOString().slice(0,10)} /></div>
                          </div>
                        )}
                        <FeeReceipt student={s} />
                        <DialogFooter>
                          <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                          {!s.paid && (
                            <DialogClose asChild>
                              <Button onClick={() => toast.success("Payment recorded", { description: `${formatPKR(s.amount)} collected from ${s.name}. Receipt is ready to print.` })}>
                                Confirm Payment
                              </Button>
                            </DialogClose>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
