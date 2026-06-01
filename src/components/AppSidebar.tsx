import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarCheck,
  Wallet,
  GraduationCap,
  Briefcase,
  FileBarChart,
  Settings,
  School,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SCHOOL } from "@/lib/sample-data";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Students", url: "/students", icon: Users },
  { title: "Admissions", url: "/admissions", icon: UserPlus },
  { title: "Attendance", url: "/attendance", icon: CalendarCheck },
  { title: "Fees", url: "/fees", icon: Wallet },
  { title: "Exams & Results", url: "/exams", icon: GraduationCap },
  { title: "Teachers", url: "/teachers", icon: Briefcase },
  { title: "Reports", url: "/reports", icon: FileBarChart },
  { title: "School Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.62_0.18_285)] text-primary-foreground shadow-lg shadow-primary/30">
            <School className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-sidebar-foreground">{SCHOOL.name}</span>
              <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">School ERP</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/40 font-bold">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="h-10 rounded-lg data-[active=true]:bg-primary/15 data-[active=true]:text-primary data-[active=true]:font-semibold data-[active=true]:border data-[active=true]:border-primary/20 data-[active=true]:shadow-sm hover:bg-sidebar-accent/60"
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {!collapsed && (
          <div className="mt-auto p-4">
            <div className="rounded-xl border border-sidebar-border/60 bg-sidebar-accent/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/50 mb-1.5">Support</p>
              <p className="text-xs text-sidebar-foreground/80 leading-relaxed mb-3">Need help with the portal?</p>
              <button className="w-full py-1.5 bg-sidebar-accent text-sidebar-foreground rounded-md text-xs font-semibold hover:bg-sidebar-accent/70 transition-colors">
                Contact Admin
              </button>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
