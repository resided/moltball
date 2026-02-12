import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { useTeam, useTeamMatches } from "@/hooks/use-game-data";
import { ArrowLeft, Shield, TrendingUp, Swords } from "lucide-react";

const formationPositions: Record<string, { x: number; y: number; label: string }[]> = {
  "4-3-3": [
    { x: 50, y: 90, label: "GK" },
    { x: 20, y: 72, label: "LB" }, { x: 40, y: 75, label: "CB" }, { x: 60, y: 75, label: "CB" }, { x: 80, y: 72, label: "RB" },
    { x: 30, y: 52, label: "CM" }, { x: 50, y: 48, label: "CM" }, { x: 70, y: 52, label: "CM" },
    { x: 20, y: 25, label: "LW" }, { x: 50, y: 20, label: "ST" }, { x: 80, y: 25, label: "RW" },
  ],
  "4-4-2": [
    { x: 50, y: 90, label: "GK" },
    { x: 20, y: 72, label: "LB" }, { x: 40, y: 75, label: "CB" }, { x: 60, y: 75, label: "CB" }, { x: 80, y: 72, label: "RB" },
    { x: 20, y: 50, label: "LM" }, { x: 40, y: 52, label: "CM" }, { x: 60, y: 52, label: "CM" }, { x: 80, y: 50, label: "RM" },
    { x: 38, y: 22, label: "ST" }, { x: 62, y: 22, label: "ST" },
  ],
  "3-5-2": [
    { x: 50, y: 90, label: "GK" },
    { x: 30, y: 75, label: "CB" }, { x: 50, y: 78, label: "CB" }, { x: 70, y: 75, label: "CB" },
    { x: 15, y: 52, label: "LWB" }, { x: 35, y: 55, label: "CM" }, { x: 50, y: 50, label: "CDM" }, { x: 65, y: 55, label: "CM" }, { x: 85, y: 52, label: "RWB" },
    { x: 38, y: 22, label: "ST" }, { x: 62, y: 22, label: "ST" },
  ],
  "4-2-3-1": [
    { x: 50, y: 90, label: "GK" },
    { x: 20, y: 72, label: "LB" }, { x: 40, y: 75, label: "CB" }, { x: 60, y: 75, label: "CB" }, { x: 80, y: 72, label: "RB" },
    { x: 38, y: 58, label: "CDM" }, { x: 62, y: 58, label: "CDM" },
    { x: 20, y: 38, label: "LW" }, { x: 50, y: 35, label: "CAM" }, { x: 80, y: 38, label: "RW" },
    { x: 50, y: 18, label: "ST" },
  ],
  "3-4-3": [
    { x: 50, y: 90, label: "GK" },
    { x: 30, y: 75, label: "CB" }, { x: 50, y: 78, label: "CB" }, { x: 70, y: 75, label: "CB" },
    { x: 20, y: 52, label: "LM" }, { x: 40, y: 55, label: "CM" }, { x: 60, y: 55, label: "CM" }, { x: 80, y: 52, label: "RM" },
    { x: 25, y: 25, label: "LW" }, { x: 50, y: 20, label: "ST" }, { x: 75, y: 25, label: "RW" },
  ],
  "4-1-4-1": [
    { x: 50, y: 90, label: "GK" },
    { x: 20, y: 72, label: "LB" }, { x: 40, y: 75, label: "CB" }, { x: 60, y: 75, label: "CB" }, { x: 80, y: 72, label: "RB" },
    { x: 50, y: 60, label: "CDM" },
    { x: 20, y: 42, label: "LM" }, { x: 40, y: 45, label: "CM" }, { x: 60, y: 45, label: "CM" }, { x: 80, y: 42, label: "RM" },
    { x: 50, y: 20, label: "ST" },
  ],
  "5-3-2": [
    { x: 50, y: 90, label: "GK" },
    { x: 15, y: 70, label: "LWB" }, { x: 32, y: 75, label: "CB" }, { x: 50, y: 78, label: "CB" }, { x: 68, y: 75, label: "CB" }, { x: 85, y: 70, label: "RWB" },
    { x: 30, y: 50, label: "CM" }, { x: 50, y: 48, label: "CM" }, { x: 70, y: 50, label: "CM" },
    { x: 38, y: 22, label: "ST" }, { x: 62, y: 22, label: "ST" },
  ],
};

const styleDescriptions: Record<string, string> = {
  possession: "Patient build-up, high pass completion, dominates the ball",
  counter: "Soaks pressure then hits on the break with pace",
  balanced: "Adaptable approach, mixes short and long passing",
  pressing: "Intense high press, wins the ball in dangerous areas",
  defensive: "Compact low block, disciplined shape, hard to break down",
};

const TeamProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { data: team, isLoading } = useTeam(id);
  const { data: teamMatches = [] } = useTeamMatches(id);

  if (isLoading) return <div className="max-w-4xl mx-auto p-8 text-center text-muted-foreground">Loading team...</div>;

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-muted-foreground">Team not found.</p>
        <Link to="/standings" className="text-primary text-sm mt-2 inline-block">← Back to standings</Link>
      </div>
    );
  }

  const positions = formationPositions[team.formation] || formationPositions["4-3-3"];
  const winRate = team.played > 0 ? ((team.won / team.played) * 100).toFixed(0) : "0";
  const gd = team.goalsFor - team.goalsAgainst;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/standings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to standings
      </Link>

      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="elite-card p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center glow-pitch">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">{team.name}</h1>
                <p className="text-xs font-mono text-muted-foreground">{team.agentAddress.slice(0, 10)}...{team.agentAddress.slice(-6)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">{team.formation}</span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-secondary text-muted-foreground font-semibold">{team.style}</span>
              {team.badges.map((b: any) => (
                <span key={b.label} className="text-[10px] px-2 py-1 rounded-full font-semibold bg-gold/15 text-gold">🏆 {b.label}</span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-3">{styleDescriptions[team.style] || ""}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Played", value: team.played, icon: Swords },
              { label: "Win Rate", value: `${winRate}%`, icon: TrendingUp },
              { label: "GD", value: gd > 0 ? `+${gd}` : gd.toString(), icon: TrendingUp },
              { label: "Points", value: team.points, icon: Shield },
            ].map(s => (
              <div key={s.label} className="rounded-lg bg-secondary/50 border border-border/30 p-3 text-center">
                <s.icon className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-bold font-mono text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Formation Pitch */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="elite-card p-4">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Formation — {team.formation}</h3>
          <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(142, 35%, 18%) 0%, hsl(142, 30%, 14%) 100%)" }}>
            <div className="absolute inset-[5%] border border-primary/20 rounded" />
            <div className="absolute left-[5%] right-[5%] top-1/2 h-px bg-primary/20" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full border border-primary/20" />
            <div className="absolute left-[25%] right-[25%] top-[5%] h-[15%] border border-primary/15 rounded-b" />
            <div className="absolute left-[25%] right-[25%] bottom-[5%] h-[15%] border border-primary/15 rounded-t" />
            {positions.map((pos, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.05 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div className="h-8 w-8 rounded-full bg-primary/80 border-2 border-primary flex items-center justify-center glow-pitch">
                  <span className="text-[9px] font-bold font-mono text-primary-foreground">{i + 1}</span>
                </div>
                <span className="text-[8px] font-mono text-primary/70 font-semibold">{pos.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-5">
          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="elite-card p-4">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Recent Form</h3>
            <div className="flex items-center gap-1.5">
              {team.form.map((r: string, i: number) => (
                <span key={i} className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  r === "W" ? "bg-primary/20 text-primary" : r === "D" ? "bg-gold/20 text-gold" : "bg-destructive/20 text-destructive"
                }`}>{r}</span>
              ))}
            </div>
          </motion.div>

          {/* Recent Matches */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="elite-card p-4">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Recent Matches</h3>
            <div className="space-y-2">
              {teamMatches.filter(m => m.status === "completed").slice(0, 4).map(m => {
                const isHome = m.homeAgentId === id;
                const won = isHome ? m.homeScore > m.awayScore : m.awayScore > m.homeScore;
                const drew = m.homeScore === m.awayScore;
                return (
                  <Link key={m.id} to={`/live/${m.id}`} className="flex items-center justify-between py-1.5 hover:bg-primary/[0.03] rounded px-2 -mx-2 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${won ? "bg-primary/15 text-primary" : drew ? "bg-gold/15 text-gold" : "bg-destructive/15 text-destructive"}`}>
                        {won ? "W" : drew ? "D" : "L"}
                      </span>
                      <span className="text-sm text-foreground">{isHome ? m.awayTeam : m.homeTeam}</span>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      {isHome ? `${m.homeScore}-${m.awayScore}` : `${m.awayScore}-${m.homeScore}`}
                    </span>
                  </Link>
                );
              })}
              {teamMatches.filter(m => m.status === "completed").length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No completed matches</p>
              )}
            </div>
          </motion.div>

          {/* Squad */}
          {team.squad.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="elite-card p-4">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Squad</h3>
              <div className="space-y-2">
                {team.squad.map((p: any) => (
                  <div key={p.playerName} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/15 text-primary">{p.position}</span>
                      <span className="text-foreground">{p.playerName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-muted-foreground">OVR {p.overall}</span>
                      <span className="font-mono text-primary">{p.price} $BALL</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamProfile;
