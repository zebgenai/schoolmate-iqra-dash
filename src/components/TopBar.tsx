import { Bell, Search, Moon, Sun, LogOut, User as UserIcon, Settings as SettingsIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SCHOOL } from "@/lib/sample-data";
import { useTheme } from "@/components/ThemeProvider";

export function TopBar() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="hidden md:flex flex-col pr-4 mr-2 border-r border-border/70">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Session</span>
        <span className="text-sm font-semibold text-foreground">2025 — 2026</span>
      </div>
      <div className="relative ml-auto hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search students, teachers, classes…"
          className="h-10 pl-11 rounded-full bg-muted/60 border-transparent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto md:ml-0"
        onClick={toggle}
        aria-label="Toggle theme"
      >
        {dark ? <Sun className="h-4 w-4 transition-transform" /> : <Moon className="h-4 w-4 transition-transform" />}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full px-1 text-[10px]" variant="destructive">
              3
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex flex-col items-start gap-0.5">
            <span className="text-sm">12 fees pending today</span>
            <span className="text-xs text-muted-foreground">2 hours ago</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-0.5">
            <span className="text-sm">New admission: Ali Raza (Class 5)</span>
            <span className="text-xs text-muted-foreground">5 hours ago</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-0.5">
            <span className="text-sm">Mid-term exams start June 12</span>
            <span className="text-xs text-muted-foreground">Yesterday</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 rounded-full p-0.5 pl-3 hover:bg-muted transition-colors">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-xs font-semibold text-foreground">{SCHOOL.principal}</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Principal</span>
            </div>
            <Avatar className="h-9 w-9 ring-2 ring-background shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-primary to-[oklch(0.62_0.18_285)] text-primary-foreground text-xs font-bold">AZ</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col">
            <span>{SCHOOL.principal}</span>
            <span className="text-xs font-normal text-muted-foreground">Principal · Admin</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem><UserIcon className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings"><SettingsIcon className="mr-2 h-4 w-4" /> School Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/login"><LogOut className="mr-2 h-4 w-4" /> Sign out</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
