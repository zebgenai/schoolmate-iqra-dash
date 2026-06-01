import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TEACHERS } from "@/lib/sample-data";

export const Route = createFileRoute("/_app/teachers")({
  head: () => ({ meta: [{ title: "Teachers — IQRA Smart School ERP" }] }),
  component: Teachers,
});

function Teachers() {
  return (
    <div className="space-y-6">
      <PageHeader title="Teachers" description={`${TEACHERS.length} active faculty members.`} actions={
        <Button><Plus className="mr-1.5 h-4 w-4" /> Add Teacher</Button>
      } />

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or subject…" className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEACHERS.map((t) => (
          <Card key={t.id} className="transition-all hover:shadow-md hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {t.name.replace(/^(Mr|Mrs|Ms)\.?\s*/, "").split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{t.name}</p>
                  <Badge variant="secondary" className="mt-1">{t.subject}</Badge>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <p><span className="text-foreground font-medium">Qualification:</span> {t.qualification}</p>
                <p><span className="text-foreground font-medium">Classes:</span> {t.classes}</p>
                <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {t.phone}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">View</Button>
                <Button variant="outline" size="sm" className="flex-1">Edit</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
