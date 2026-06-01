import { createFileRoute } from "@tanstack/react-router";
import { Upload, Save, Palette } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SCHOOL } from "@/lib/sample-data";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "School Settings — IQRA Smart School ERP" }] }),
  component: Settings,
});

const themeColors = [
  { name: "Indigo", value: "indigo", swatch: "bg-[oklch(0.52_0.18_258)]" },
  { name: "Emerald", value: "emerald", swatch: "bg-[oklch(0.6_0.15_155)]" },
  { name: "Rose", value: "rose", swatch: "bg-[oklch(0.6_0.2_15)]" },
  { name: "Amber", value: "amber", swatch: "bg-[oklch(0.7_0.16_75)]" },
  { name: "Slate", value: "slate", swatch: "bg-[oklch(0.35_0.02_260)]" },
];

function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader title="School Settings" description="Configure your school profile and branding." actions={
        <Button><Save className="mr-1.5 h-4 w-4" /> Save Changes</Button>
      } />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">School Profile</CardTitle>
            <CardDescription>Used on receipts, result cards and reports.</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2"><Label>School Name</Label><Input defaultValue={SCHOOL.name} /></div>
            <div className="space-y-1.5"><Label>Principal Name</Label><Input defaultValue={SCHOOL.principal} /></div>
            <div className="space-y-1.5"><Label>Academic Session</Label><Input defaultValue={SCHOOL.session} /></div>
            <div className="space-y-1.5"><Label>Phone Number</Label><Input defaultValue={SCHOOL.phone} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" defaultValue={SCHOOL.email} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Address</Label><Textarea defaultValue={SCHOOL.address} rows={2} /></div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">School Logo</CardTitle>
              <CardDescription>PNG or SVG, square works best.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl font-bold">IQ</div>
                <p className="text-sm text-muted-foreground">Drop file here or</p>
                <Button variant="outline" size="sm"><Upload className="mr-1.5 h-4 w-4" /> Upload Logo</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4" /> Theme Color</CardTitle>
              <CardDescription>Brand accent across the app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select defaultValue="indigo">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {themeColors.map(c => <SelectItem key={c.value} value={c.value}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                {themeColors.map(c => (
                  <button key={c.value} className={`h-8 w-8 rounded-lg ring-2 ring-transparent hover:ring-foreground/30 transition ${c.swatch}`} aria-label={c.name} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
