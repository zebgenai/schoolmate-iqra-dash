import { Bell, Search, Moon, Sun, LogOut, User as UserIcon, Settings as SettingsIcon, Loader2 } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { useSchoolProfile } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

const roleLabel: Record<string, string> = {
  super_admin: "Super Admin",
  school_admin: "School Admin",
  teacher: "Teacher",
  accountant: "Accountant",
};

export function TopBar() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  const { profile, loading } = useSchoolProfile();
  const navigate = useNavigate();

  const name = profile?.fullName || profile?.email || "User";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const role = profile?.role ? roleLabel[profile.role] : "Staff";

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="hidden md:flex flex-col pr-4 mr-2 border-r border-border/70">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {profile?.schoolName ?? "School"}
        </span>
        <span className="text-sm font-semibold text-foreground">Session 2025 — 2026</span>
      </div>
      <div className="relative ml-auto hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search students, teachers, classes…" className="h-10 pl-11 rounded-full bg-muted/60 border-transparent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20" />
      </div>
      <Button variant="ghost" size="icon" className="ml-auto md:ml-0" onClick={toggle} aria-label="Toggle theme">
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full px-1 text-[10px]" variant="destructive">3</Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs text-muted-foreground">No new notifications</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 rounded-full p-0.5 pl-3 hover:bg-muted transition-colors">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-xs font-semibold text-foreground">{loading ? "…" : name}</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{role}</span>
            </div>
            <Avatar className="h-9 w-9 ring-2 ring-background shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-primary to-[oklch(0.62_0.18_285)] text-primary-foreground text-xs font-bold">
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : (initials || "U")}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col">
            <span>{name}</span>
            <span className="text-xs font-normal text-muted-foreground">{role} · {profile?.schoolName ?? "—"}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem><UserIcon className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings"><SettingsIcon className="mr-2 h-4 w-4" /> School Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
