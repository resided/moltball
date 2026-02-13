import { Trophy, Swords, Store, CalendarDays, LayoutDashboard, Zap, ArrowLeftRight, Star, LineChart, MessageCircle, Target, Package, Bot } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const coreNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Standings", url: "/standings", icon: Trophy },
  { title: "Matches", url: "/matches", icon: Swords },
  { title: "Gameweek", url: "/gameweek", icon: Star },
  { title: "Season", url: "/season", icon: CalendarDays },
];

const marketNav = [
  { title: "Pack Store", url: "/packs", icon: Package },
  { title: "Marketplace", url: "/market", icon: Store },
  { title: "Transfers", url: "/transfers", icon: ArrowLeftRight },
  { title: "Player Charts", url: "/charts", icon: LineChart },
];

const socialNav = [
  { title: "Ballbook", url: "/ballbook", icon: MessageCircle },
  { title: "Predictions", url: "/predictions", icon: Target },
  { title: "AI Agent", url: "/skill", icon: Bot },
];

function NavSection({ label, items }: { label: string; items: typeof coreNav }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-semibold">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-all"
                  activeClassName="bg-primary/10 text-primary font-medium border-l-2 border-primary"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  return (
    <Sidebar className="w-60 border-r border-border/50">
      <SidebarContent>
        <div className="p-4 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center glow-pitch">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">
            MOLTBALL
          </span>
        </div>

        <NavSection label="Spectate" items={coreNav} />
        <NavSection label="Market" items={marketNav} />
        <NavSection label="Community" items={socialNav} />

        <div className="mt-auto p-4">
          <div className="rounded-xl gradient-pitch border border-glow p-3 glow-pitch">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Token</p>
            <p className="text-sm font-mono font-bold text-primary text-glow">$BALL</p>
            <p className="text-[10px] text-muted-foreground mt-1">on Base</p>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
