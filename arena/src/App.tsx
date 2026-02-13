import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";
import { AmbientBackground } from "@/components/ui/ambient-background";
import Index from "./pages/Index";
import Standings from "./pages/Standings";
import Matches from "./pages/Matches";
import Market from "./pages/Market";
import Transfers from "./pages/Transfers";
import Season from "./pages/Season";
import LiveMatch from "./pages/LiveMatch";
import TeamProfile from "./pages/TeamProfile";
import Gameweek from "./pages/Gameweek";
import PlayerCharts from "./pages/PlayerCharts";
import Ballbook from "./pages/Ballbook";
import Predictions from "./pages/Predictions";
import PackStore from "./pages/PackStore";
import NotFound from "./pages/NotFound";
import Skill from "./pages/Skill";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AmbientBackground />
      <BrowserRouter>
        <AppLayout>
          <PageTransition>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/standings" element={<Standings />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/live/:id" element={<LiveMatch />} />
              <Route path="/team/:id" element={<TeamProfile />} />
              <Route path="/market" element={<Market />} />
              <Route path="/packs" element={<PackStore />} />
              <Route path="/transfers" element={<Transfers />} />
              <Route path="/gameweek" element={<Gameweek />} />
              <Route path="/charts" element={<PlayerCharts />} />
              <Route path="/ballbook" element={<Ballbook />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/skill" element={<Skill />} />
              <Route path="/season" element={<Season />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
