import { motion } from "framer-motion";
import { useMatches } from "@/hooks/use-game-data";
import { MatchCard } from "@/components/MatchCard";

const Matches = () => {
  const { data: matches = [], isLoading } = useMatches();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Match Results</h1>
        <p className="text-sm text-muted-foreground mt-1">All matches — live data</p>
      </motion.div>

      {isLoading ? (
        <div className="elite-card p-8 text-center text-muted-foreground text-sm">Loading matches...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match, i) => (
            <motion.div key={match.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <MatchCard match={match} expanded />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;
