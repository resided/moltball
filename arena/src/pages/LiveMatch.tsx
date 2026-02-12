import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { useMatch } from "@/hooks/use-game-data";
import { ArrowLeft, Play, Pause, SkipForward } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const LiveMatch = () => {
  const { id } = useParams<{ id: string }>();
  const { data: match, isLoading } = useMatch(id);

  const [currentMinute, setCurrentMinute] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const feedRef = useRef<HTMLDivElement>(null);

  // Generate xG timeline from events
  const xgTimeline = (() => {
    if (!match) return [];
    const data: { minute: number; homeXg: number; awayXg: number }[] = [];
    let hXg = 0, aXg = 0;
    for (let m = 0; m <= 90; m += 5) {
      const goalEvents = match.events.filter(e => e.minute <= m && e.minute > m - 5 && e.type === "goal");
      goalEvents.forEach(e => {
        if (e.team === "home") hXg += 0.3 + Math.random() * 0.5;
        else aXg += 0.3 + Math.random() * 0.5;
      });
      hXg += Math.random() * 0.08 * (match.possession[0] / 50);
      aXg += Math.random() * 0.08 * (match.possession[1] / 50);
      data.push({ minute: m, homeXg: +hXg.toFixed(2), awayXg: +aXg.toFixed(2) });
    }
    return data;
  })();

  const visibleEvents = match?.events.filter(e => e.minute <= currentMinute) || [];
  const currentScore = match ? {
    home: match.events.filter(e => e.team === "home" && e.type === "goal" && e.minute <= currentMinute).length,
    away: match.events.filter(e => e.team === "away" && e.type === "goal" && e.minute <= currentMinute).length,
  } : { home: 0, away: 0 };

  useEffect(() => {
    if (!isPlaying || currentMinute >= 90) return;
    const interval = setInterval(() => setCurrentMinute(prev => Math.min(prev + 1, 90)), 1000 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, currentMinute, speed]);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [visibleEvents.length]);

  const getEventStyle = (type: string) => {
    switch (type) {
      case "goal": return "bg-primary/10 border-l-2 border-primary text-foreground font-semibold";
      case "yellow_card": case "red_card": return "bg-amber-500/10 border-l-2 border-amber-500";
      case "chance": case "save": return "bg-sky-500/10 border-l-2 border-sky-500/50";
      default: return "border-l-2 border-border/30";
    }
  };

  if (isLoading) return <div className="max-w-5xl mx-auto p-8 text-center text-muted-foreground">Loading match...</div>;
  if (!match) return <div className="max-w-5xl mx-auto p-8 text-center text-muted-foreground">Match not found. <Link to="/matches" className="text-primary">← Back</Link></div>;

  const currentXg = xgTimeline.filter(d => d.minute <= currentMinute);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <Link to="/matches" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to matches
      </Link>

      {/* Score Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="elite-card p-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">GW {match.matchday}</span>
          <div className="flex items-center gap-2">
            {currentMinute < 90 ? (
              <><span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" /><span className="text-xs font-mono text-primary">{currentMinute}'</span></>
            ) : (
              <span className="text-xs font-mono text-muted-foreground">FT</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 py-4">
          <div className="text-right flex-1">
            <p className="text-lg font-bold text-foreground">{match.homeTeam}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{match.possession[0]}% poss</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold font-mono text-foreground text-glow-strong">{currentScore.home}</span>
            <span className="text-2xl text-muted-foreground/30">–</span>
            <span className="text-4xl font-bold font-mono text-foreground text-glow-strong">{currentScore.away}</span>
          </div>
          <div className="text-left flex-1">
            <p className="text-lg font-bold text-foreground">{match.awayTeam}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{match.possession[1]}% poss</p>
          </div>
        </div>

        <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div className="h-full bg-primary/40 rounded-full" animate={{ width: `${(currentMinute / 90) * 100}%` }} transition={{ duration: 0.3 }} />
          {match.events.filter(e => e.type === "goal").map((e, i) => (
            <div key={i} className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 ${e.team === "home" ? "bg-primary border-primary" : "bg-foreground border-foreground"} ${e.minute <= currentMinute ? "opacity-100" : "opacity-20"}`}
              style={{ left: `${(e.minute / 90) * 100}%`, transform: "translate(-50%, -50%)" }} />
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={() => setIsPlaying(!isPlaying)} className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            {isPlaying ? <Pause className="h-3.5 w-3.5 text-foreground" /> : <Play className="h-3.5 w-3.5 text-foreground" />}
          </button>
          {[1, 2, 4].map(s => (
            <button key={s} onClick={() => setSpeed(s)} className={`h-8 px-3 rounded-lg text-xs font-mono font-semibold transition-all ${speed === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{s}x</button>
          ))}
          <button onClick={() => setCurrentMinute(90)} className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <SkipForward className="h-3.5 w-3.5 text-foreground" />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* xG Timeline */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="elite-card p-4">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">xG Timeline</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentXg}>
                <defs>
                  <linearGradient id="homeXgGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(142, 72%, 50%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(142, 72%, 50%)" stopOpacity={0} /></linearGradient>
                  <linearGradient id="awayXgGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(0, 0%, 60%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(0, 0%, 60%)" stopOpacity={0} /></linearGradient>
                </defs>
                <XAxis dataKey="minute" tick={{ fontSize: 10, fill: "hsl(220, 10%, 45%)" }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, "auto"]} />
                <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", fontSize: "11px", fontFamily: "JetBrains Mono" }} />
                <Area type="monotone" dataKey="homeXg" stroke="hsl(142, 72%, 50%)" strokeWidth={2} fill="url(#homeXgGrad)" name="Home xG" />
                <Area type="monotone" dataKey="awayXg" stroke="hsl(0, 0%, 60%)" strokeWidth={2} fill="url(#awayXgGrad)" name="Away xG" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-xs">
            <div className="flex items-center gap-1.5"><span className="h-2 w-6 rounded bg-primary" /><span className="text-muted-foreground">{match.homeTeam}</span></div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-6 rounded bg-muted-foreground" /><span className="text-muted-foreground">{match.awayTeam}</span></div>
          </div>
        </motion.div>

        {/* Events Feed */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="elite-card p-4 flex flex-col">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Match Events</h3>
          <div ref={feedRef} className="flex-1 max-h-[240px] overflow-y-auto space-y-1.5 pr-1">
            <AnimatePresence>
              {visibleEvents.map((e, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={`rounded-lg px-3 py-2 text-xs ${getEventStyle(e.type)}`}>
                  <span className="font-mono text-muted-foreground mr-2">{e.minute}'</span>
                  {e.description || `${e.player} — ${e.type}`}
                </motion.div>
              ))}
            </AnimatePresence>
            {visibleEvents.length === 0 && <div className="text-center text-muted-foreground text-xs py-8">Waiting for kick-off...</div>}
          </div>
        </motion.div>
      </div>

      {/* Goals */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="elite-card p-4">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Goals</h3>
        <div className="space-y-2">
          {match.events.filter(e => e.type === "goal" && e.minute <= currentMinute).map((e, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`flex items-center gap-3 ${e.team === "home" ? "" : "flex-row-reverse"}`}>
              <div className={`flex items-center gap-2 ${e.team === "home" ? "" : "flex-row-reverse"}`}>
                <span className="text-primary text-lg">⚽</span>
                <span className="text-sm font-semibold text-foreground">{e.player}</span>
                <span className="text-xs font-mono text-muted-foreground">{e.minute}'</span>
              </div>
            </motion.div>
          ))}
          {match.events.filter(e => e.type === "goal" && e.minute <= currentMinute).length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">No goals yet</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LiveMatch;
