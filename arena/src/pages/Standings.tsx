import { motion } from "framer-motion";
import { useStandings } from "@/hooks/use-game-data";
import { StandingsTable } from "@/components/StandingsTable";

const Standings = () => {
  const { data: teams = [], isLoading } = useStandings();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">League Standings</h1>
        <p className="text-sm text-muted-foreground mt-1">Season 1 — Full table</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {isLoading ? (
          <div className="elite-card p-8 text-center text-muted-foreground text-sm">Loading standings...</div>
        ) : (
          <StandingsTable teams={teams} />
        )}
      </motion.div>

      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-3 w-1 rounded bg-primary" />
          Promotion zone
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-1 rounded bg-destructive" />
          Relegation zone
        </div>
      </div>
    </div>
  );
};

export default Standings;
