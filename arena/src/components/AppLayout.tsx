import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { WalletConnect } from "@/components/WalletConnect";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border/30 px-4 elite-header sticky top-0 z-10">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="ml-auto flex items-center gap-3">
              <WalletConnect />
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                LIVE
              </span>
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow glow-pitch" />
            </div>
          </header>
          <main className="flex-1 p-6 stadium-bg overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
