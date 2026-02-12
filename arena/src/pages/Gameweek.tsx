import { motion } from "framer-motion";
import { useGameweekPoints, useStandings } from "@/hooks/use-game-data";
import { Trophy, Star, Users, Zap } from "lucide-react";

const positionColors: Record<string, string> = {
  FW: "text-rose-400", MF: "text-emerald-400", DF: "text-sky-400", GK: "text-amber-400",
};
const positionBg: Record<string, string> = {
  FW: "bg-rose-500/15", MF: "bg-emerald-500/15", DF: "bg-sky-500/15", GK: "bg-amber-500/15",
};

const Gameweek = () => {
  const currentGW = 13;
  const { data: gwPlayers = [], isLoading } = useGameweekPoints(currentGW);
  const { data: teams = [] } = useStandings();

  const dreamTeam = gwPlayers.slice(0, 11);
  const highestScorer = gwPlayers[0];
  const totalGoals = gwPlayers.reduce((s, p) => s + p.goals, 0);
  const avgPoints = gwPlayers.length > 0 ? (gwPlayers.reduce((s, p) => s + p.points, 0) / gwPlayers.length).toFixed(1) : "0";

  // Manager rankings from standings
  const managerRankings = teams.slice(0, 8).map((t, i) => ({
    rank: i + 1,
    name: t.name,
    agent: t.agentAddress.slice(0, 6) + "..." + t.agentAddress.slice(-4),
    totalPoints: t.points,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Gameweek {currentGW}</h1>
        <p className="text-sm text-muted-foreground mt-1">FPL-style points breakdown and dream team</p>
      </motion.div>

      {/* Summary Stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Highest Score", value: highestScorer ? `${highestScorer.points} pts` : "–", sub: highestScorer?.name, icon: Trophy },
          { label: "Total Goals", value: totalGoals.toString(), icon: Zap },
          { label: "Avg Points", value: avgPoints, icon: Star },
          { label: "Players Scored", value: gwPlayers.length.toString(), icon: Users },
        ].map(s => (
          <div key={s.label} className="elite-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</span>
            </div>
            <p className="text-xl font-bold font-mono text-foreground">{s.value}</p>
            {s.sub && <p className="text-[10px] text-primary mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Points Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 elite-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Dream Team — GW{currentGW}</h3>
            <span className="text-[10px] font-mono text-primary">{dreamTeam.reduce((s, p) => s + p.points, 0)} total pts</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading gameweek data...</div>
          ) : dreamTeam.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No gameweek points recorded yet for GW{currentGW}</div>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-[2.5fr_0.5fr_0.5fr_0.5fr_0.5fr_0.5fr_0.6fr] gap-2 px-4 py-2 border-b border-border/30 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                <span>Player</span>
                <span className="text-center">Pts</span>
                <span className="text-center">G</span>
                <span className="text-center">A</span>
                <span className="text-center">CS</span>
                <span className="text-center">BPS</span>
                <span className="text-center">Mins</span>
              </div>
              {dreamTeam.map((p, i) => (
                <motion.div key={p.name + i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-1 md:grid-cols-[2.5fr_0.5fr_0.5fr_0.5fr_0.5fr_0.5fr_0.6fr] gap-2 items-center px-4 py-2.5 border-b border-border/20 hover:bg-primary/[0.03] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`h-7 w-7 rounded-lg ${positionBg[p.position] || "bg-muted"} flex items-center justify-center shrink-0`}>
                      <span className={`text-[10px] font-bold font-mono ${positionColors[p.position] || "text-muted-foreground"}`}>{p.position}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.team}</p>
                    </div>
                    {i === 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-gold/15 text-gold font-semibold ml-1">⭐ POTW</span>}
                  </div>
                  <div className="hidden md:flex justify-center"><span className={`text-sm font-bold font-mono ${p.points >= 10 ? "text-primary" : "text-foreground"}`}>{p.points}</span></div>
                  <div className="hidden md:flex justify-center"><span className="text-sm font-mono text-muted-foreground">{p.goals}</span></div>
                  <div className="hidden md:flex justify-center"><span className="text-sm font-mono text-muted-foreground">{p.assists}</span></div>
                  <div className="hidden md:flex justify-center">{p.cleanSheet ? <span className="text-xs text-primary">✓</span> : <span className="text-xs text-muted-foreground/30">–</span>}</div>
                  <div className="hidden md:flex justify-center">{p.bonus > 0 ? <span className="text-xs font-mono font-semibold text-gold">{p.bonus}</span> : <span className="text-xs text-muted-foreground/30">–</span>}</div>
                  <div className="hidden md:flex justify-center"><span className="text-xs font-mono text-muted-foreground">{p.minutes}'</span></div>
                  <div className="flex md:hidden items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span className="font-mono font-bold text-primary">{p.points} pts</span>
                    <span>{p.goals}G {p.assists}A</span>
                    {p.bonus > 0 && <span className="text-gold">+{p.bonus} BPS</span>}
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </motion.div>

        {/* Manager Rankings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="elite-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Manager Rankings</h3>
          </div>
          {managerRankings.map((m, i) => (
            <div key={m.name} className={`flex items-center gap-3 px-4 py-2.5 border-b border-border/20 ${i < 3 ? "bg-primary/[0.02]" : ""}`}>
              <span className={`text-xs font-mono w-5 ${i < 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{m.rank}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{m.agent}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold font-mono text-primary">{m.totalPoints}</p>
                <p className="text-[10px] text-muted-foreground">pts</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Gameweek;
