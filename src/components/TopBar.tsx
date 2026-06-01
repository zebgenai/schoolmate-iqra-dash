import { Bell, Search, Moon, Sun, LogOut, User as UserIcon, Settings as SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";
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

export function TopBar() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="hidden md:block">
        <h1 className="text-sm font-semibold text-foreground">{SCHOOL.name}</h1>
        <p className="text-[11px] text-muted-foreground">Session {SCHOOL.session}</p>
      </div>
      <div className="relative ml-auto hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search students, teachers, classes…"
          className="h-9 pl-9 bg-muted/40 border-transparent focus-visible:bg-background"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto md:ml-0"
        onClick={() => setDark((d) => !d)}
        aria-label="Toggle theme"
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
          <button className="flex items-center gap-2 rounded-full p-0.5 hover:bg-muted transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">TM</AvatarFallback>
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
