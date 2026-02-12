import { motion } from "framer-motion";
import { useStandings, useMatches } from "@/hooks/use-game-data";
import { SeasonProgress } from "@/components/SeasonProgress";
import { useMemo } from "react";

const SeasonPage = () => {
  const { data: standings = [], isLoading } = useStandings();
  const { data: matches = [] } = useMatches();

  const completedMatches = matches.filter(m => m.status === "completed");
  const totalGoals = standings.reduce((s, t) => s + t.goalsFor, 0);
  const avgGoals = completedMatches.length > 0 ? (totalGoals / completedMatches.length).toFixed(1) : "0";

  const maxGameweek = useMemo(() => {
    if (matches.length === 0) return 0;
    return Math.max(...completedMatches.map(m => m.gameweek), 0);
  }, [completedMatches, matches]);

  const totalGameweeks = useMemo(() => {
    if (matches.length === 0) return 18;
    return Math.max(...matches.map(m => m.gameweek));
  }, [matches]);

  const season = {
    number: 1,
    matchday: maxGameweek,
    totalMatchdays: totalGameweeks,
    teamsCount: standings.length,
    status: maxGameweek >= totalGameweeks ? "Completed" : "In Progress",
  };

  // Top scorers from standings goal data (simplified — shows team goal leaders)
  const topTeams = [...standings].sort((a, b) => b.goalsFor - a.goalsFor).slice(0, 5);
  const topDefense = [...standings].sort((a, b) => a.goalsAgainst - b.goalsAgainst).slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Season Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Season 1 progress and leaders</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <SeasonProgress season={season} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="elite-card p-4">
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total matches</span>
              <span className="font-mono text-foreground">{completedMatches.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total goals</span>
              <span className="font-mono text-foreground">{totalGoals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg goals/match</span>
              <span className="font-mono text-primary">{avgGoals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active teams</span>
              <span className="font-mono text-foreground">{standings.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Matchday</span>
              <span className="font-mono text-foreground">{maxGameweek} / {totalGameweeks}</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="elite-card p-4">
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Top Attack
          </h3>
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-xs text-muted-foreground text-center py-4">Loading...</p>
            ) : topTeams.map((t, i) => (
              <div key={t.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.played} played</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-primary">{t.goalsFor} goals</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="elite-card p-4">
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Best Defense
          </h3>
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-xs text-muted-foreground text-center py-4">Loading...</p>
            ) : topDefense.map((t, i) => (
              <div key={t.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.played} played</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-gold">{t.goalsAgainst} GA</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SeasonPage;
