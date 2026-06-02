import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Wallet, AlertCircle, TrendingUp, Receipt, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
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
import { supabase } from "@/integrations/supabase/client";
import { useSchoolProfile } from "@/hooks/useSession";
import { formatPKR } from "@/lib/sample-data";

export const Route = createFileRoute("/_app/fees")({
  head: () => ({ meta: [{ title: "Fees — IQRA Smart School ERP" }] }),
  component: Fees,
});

function Fees() {
  const { profile } = useSchoolProfile();
  const schoolId = profile?.schoolId ?? null;
  const qc = useQueryClient();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [q, setQ] = useState("");
  const [collectOpen, setCollectOpen] = useState<{ id: string; name: string; fee: number } | null>(null);
  const [amount, setAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));

  const students = useQuery({
    queryKey: ["fees-students", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, admission_no, monthly_fee, classes(name), sections(name)")
        .eq("status", "active");
      if (error) throw error;
      return data ?? [];
    },
  });

  const payments = useQuery({
    queryKey: ["fees-payments", schoolId, year, month],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase.from("fee_payments").select("student_id, amount_paid").eq("year", year).eq("month", month);
      if (error) throw error;
      return data ?? [];
    },
  });

  const paidMap = useMemo(() => {
    const m: Record<string, number> = {};
    (payments.data ?? []).forEach((p: any) => { m[p.student_id] = (m[p.student_id] ?? 0) + Number(p.amount_paid); });
    return m;
  }, [payments.data]);

  const rows = useMemo(() => {
    return (students.data ?? [])
      .filter((s: any) => q === "" || s.name.toLowerCase().includes(q.toLowerCase()) || s.admission_no.toLowerCase().includes(q.toLowerCase()))
      .map((s: any) => {
        const paid = paidMap[s.id] ?? 0;
        return { ...s, paidAmount: paid, isPaid: paid >= Number(s.monthly_fee ?? 0) && Number(s.monthly_fee ?? 0) > 0 };
      });
  }, [students.data, paidMap, q]);

  const collected = Object.values(paidMap).reduce((a, b) => a + b, 0);
  const totalDue = (students.data ?? []).reduce((a, s: any) => a + Number(s.monthly_fee ?? 0), 0);
  const pending = Math.max(0, totalDue - collected);
  const collectionRate = totalDue > 0 ? Math.round((collected / totalDue) * 100) : 0;

  const collectMutation = useMutation({
    mutationFn: async () => {
      if (!collectOpen || !schoolId) throw new Error("Nothing to collect");
      const amt = Number(amount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      const { error } = await supabase.from("fee_payments").insert({
        school_id: schoolId, student_id: collectOpen.id, month, year,
        amount_paid: amt, paid_on: payDate, method: "cash",
        receipt_no: `RCP-${Date.now().toString().slice(-8)}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fees-payments", schoolId, year, month] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts", schoolId] });
      toast.success("Payment recorded", { description: `${formatPKR(Number(amount))} collected from ${collectOpen?.name}.` });
      setCollectOpen(null);
      setAmount("");
    },
    onError: (e: any) => toast.error("Could not record payment", { description: e.message }),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Fee Management" description={`Collections for ${now.toLocaleDateString("en-PK", { month: "long", year: "numeric" })}`} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-5 flex items-start justify-between">
          <div><p className="text-xs uppercase text-muted-foreground tracking-wide">Collected</p>
            <p className="mt-2 text-2xl font-semibold">{formatPKR(collected)}</p></div>
          <div className="h-10 w-10 rounded-lg bg-success/15 text-success flex items-center justify-center"><Wallet className="h-5 w-5" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-start justify-between">
          <div><p className="text-xs uppercase text-muted-foreground tracking-wide">Pending</p>
            <p className="mt-2 text-2xl font-semibold">{formatPKR(pending)}</p></div>
          <div className="h-10 w-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"><AlertCircle className="h-5 w-5" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-start justify-between">
          <div><p className="text-xs uppercase text-muted-foreground tracking-wide">Collection Rate</p>
            <p className="mt-2 text-2xl font-semibold">{collectionRate}%</p></div>
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
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search student…" className="pl-9 h-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {students.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…</div>
          ) : rows.length === 0 ? (
            <EmptyState icon={Receipt} title="No students" description="Add students first to start collecting fees." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Monthly Fee</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-accent text-accent-foreground">{s.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                        <div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.admission_no}</p></div>
                      </div>
                    </TableCell>
                    <TableCell>{s.classes?.name ? <Badge variant="secondary">Class {s.classes.name}{s.sections?.name ? `–${s.sections.name}` : ""}</Badge> : "—"}</TableCell>
                    <TableCell className="text-sm font-medium">{formatPKR(Number(s.monthly_fee ?? 0))}</TableCell>
                    <TableCell className="text-sm">{formatPKR(s.paidAmount)}</TableCell>
                    <TableCell>
                      {s.isPaid
                        ? <Badge className="bg-success/15 text-success hover:bg-success/20">Paid</Badge>
                        : <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20">Unpaid</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant={s.isPaid ? "outline" : "default"} onClick={() => {
                        setCollectOpen({ id: s.id, name: s.name, fee: Number(s.monthly_fee ?? 0) });
                        setAmount(String(Math.max(0, Number(s.monthly_fee ?? 0) - s.paidAmount)));
                      }}>
                        {s.isPaid ? "Add Payment" : "Collect Fee"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!collectOpen} onOpenChange={(o) => { if (!o) setCollectOpen(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Collect Fee</DialogTitle>
            <DialogDescription>{collectOpen?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Amount (Rs)</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={() => collectMutation.mutate()} disabled={collectMutation.isPending}>
              {collectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
