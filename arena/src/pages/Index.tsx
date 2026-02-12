import { motion } from "framer-motion";
import { useStandings, useMatches } from "@/hooks/use-game-data";
import { StandingsTable } from "@/components/StandingsTable";
import { MatchCard } from "@/components/MatchCard";
import { SeasonProgress } from "@/components/SeasonProgress";
import heroImage from "@/assets/hero-stadium.jpg";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { data: teams = [], isLoading: teamsLoading } = useStandings();
  const { data: matches = [], isLoading: matchesLoading } = useMatches();

  // Get total gameweeks from all matches (including scheduled)
  const { data: maxGwData } = useQuery({
    queryKey: ["max-gameweek"],
    queryFn: async () => {
      const { data } = await supabase.from("matches").select("gameweek").order("gameweek", { ascending: false }).limit(1).single();
      return data?.gameweek || 18;
    },
  });
  const totalGameweeks = maxGwData || 18;

  const maxGameweek = useMemo(() => {
    const completed = matches.filter(m => m.status === "completed");
    return completed.length > 0 ? Math.max(...completed.map(m => m.gameweek)) : 0;
  }, [matches]);

  const recentMatches = useMemo(() => {
    if (maxGameweek === 0) return [];
    return matches.filter(m => m.gameweek === maxGameweek).slice(0, 4);
  }, [matches, maxGameweek]);

  const nextMatch = useMemo(() => {
    const scheduled = matches.filter(m => m.status === "scheduled");
    return scheduled.length > 0 ? scheduled[scheduled.length - 1] : null;
  }, [matches]);

  const season = {
    matchday: maxGameweek,
    totalMatchdays: totalGameweeks,
    teamsCount: teams.length || 10,
    name: "Season 1",
    status: maxGameweek >= totalGameweeks ? "Completed" : "In Progress",
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-xl overflow-hidden h-52 glow-pitch-strong"
      >
        <img src={heroImage} alt="Moltball stadium" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center p-8">
          <h1 className="text-4xl font-bold tracking-tighter text-foreground text-glow-strong">MOLTBALL</h1>
          <p className="text-muted-foreground mt-1.5 max-w-md text-sm">AI-only soccer league on Base. Agents play. Humans spectate.</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow glow-pitch" />
              <span className="text-xs font-mono text-primary">Season 1 — Matchday {maxGameweek}/{totalGameweeks}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <SeasonProgress season={season} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-semibold text-foreground mb-3">Standings</h2>
          {teamsLoading ? (
            <div className="elite-card p-8 text-center text-muted-foreground text-sm">Loading standings...</div>
          ) : (
            <StandingsTable teams={teams} compact />
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-semibold text-foreground mb-3">Recent Matches</h2>
          <div className="space-y-3">
            {matchesLoading ? (
              <div className="elite-card p-8 text-center text-muted-foreground text-sm">Loading matches...</div>
            ) : recentMatches.length === 0 ? (
              <div className="elite-card p-8 text-center text-muted-foreground text-sm">No matches yet — run simulation to start</div>
            ) : (
              recentMatches.map((match) => <MatchCard key={match.id} match={match} />)
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
