import { motion } from "framer-motion";
import { usePredictions } from "@/hooks/use-game-data";
import { Clock, Users, TrendingUp, Zap } from "lucide-react";

function timeLeft(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

const Predictions = () => {
  const { data: predictions = [], isLoading } = usePredictions();

  const totalPool = predictions.reduce((s, p) => s + p.pool, 0);
  const totalBackers = predictions.reduce((s, p) => s + p.options.reduce((os: number, o: any) => os + (o.backers || 0), 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Predictions</h1>
        <p className="text-sm text-muted-foreground mt-1">Spectator prediction market — pick outcomes and earn $BALL</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-3 gap-3">
        <div className="elite-card p-4 text-center">
          <Zap className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-bold font-mono text-primary">{predictions.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Active Markets</p>
        </div>
        <div className="elite-card p-4 text-center">
          <TrendingUp className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-bold font-mono text-foreground">{totalPool.toLocaleString()} <span className="text-xs text-muted-foreground">$BALL</span></p>
          <p className="text-[10px] text-muted-foreground uppercase">Total Pool</p>
        </div>
        <div className="elite-card p-4 text-center">
          <Users className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-bold font-mono text-foreground">{totalBackers}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Total Backers</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="elite-card p-8 text-center text-muted-foreground text-sm">Loading predictions...</div>
      ) : (
        <div className="space-y-4">
          {predictions.map((pred, i) => (
            <motion.div key={pred.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="elite-card p-5">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-base font-semibold text-foreground">{pred.question}</h3>
                <div className="flex items-center gap-1.5 shrink-0 ml-4">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-mono text-muted-foreground">{timeLeft(pred.endsAt)}</span>
                </div>
              </div>

              <div className="space-y-2">
                {pred.options.map((opt: any) => {
                  const totalB = pred.options.reduce((s: number, o: any) => s + (o.backers || 0), 0);
                  const pct = totalB > 0 ? ((opt.backers || 0) / totalB * 100) : 0;
                  return (
                    <button key={opt.label} className="w-full relative rounded-lg border border-border/50 hover:border-primary/30 p-3 flex items-center justify-between transition-all group overflow-hidden">
                      <div className="absolute inset-0 bg-primary/[0.05] transition-all" style={{ width: `${pct}%` }} />
                      <div className="relative flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{opt.label}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{opt.backers || 0} backers</span>
                      </div>
                      <div className="relative flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground">{pct.toFixed(0)}%</span>
                        <span className="text-sm font-bold font-mono text-primary">{(opt.odds || 1).toFixed(1)}x</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>Pool: <span className="font-mono text-foreground">{pred.pool.toLocaleString()} $BALL</span></span>
                <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors">Place Prediction</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Predictions;
