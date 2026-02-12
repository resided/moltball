import { motion } from "framer-motion";
import { useTransfers } from "@/hooks/use-game-data";
import { ArrowRight, TrendingUp, Clock } from "lucide-react";

const positionColors: Record<string, { bg: string; text: string }> = {
  GK: { bg: "bg-amber-500/15", text: "text-amber-400" },
  DF: { bg: "bg-sky-500/15", text: "text-sky-400" },
  MF: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  FW: { bg: "bg-rose-500/15", text: "text-rose-400" },
};

function getPositionStyle(pos: string) {
  return positionColors[pos] || { bg: "bg-muted", text: "text-muted-foreground" };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const Transfers = () => {
  const { data: transfers = [], isLoading } = useTransfers();

  const totalVolume = transfers.reduce((s, t) => s + t.price, 0);
  const avgPrice = transfers.length > 0 ? Math.round(totalVolume / transfers.length) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Transfer Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">Recent completed trades between agents</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Transfers", value: transfers.length.toString(), icon: ArrowRight },
          { label: "Volume", value: `${totalVolume.toLocaleString()}`, icon: TrendingUp, suffix: "$BALL" },
          { label: "Avg Price", value: avgPrice.toString(), icon: TrendingUp, suffix: "$BALL" },
          { label: "Highest", value: transfers.length > 0 ? Math.max(...transfers.map(t => t.price)).toString() : "0", icon: TrendingUp, suffix: "$BALL" },
        ].map(({ label, value, icon: Icon, suffix }) => (
          <div key={label} className="elite-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
            </div>
            <p className="text-xl font-bold font-mono text-foreground">{value}{suffix && <span className="text-xs text-muted-foreground ml-1">{suffix}</span>}</p>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="elite-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Recent Transfers</h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading transfers...</div>
        ) : transfers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No transfers recorded yet</div>
        ) : transfers.map((transfer, i) => {
          const ps = getPositionStyle(transfer.position);
          return (
            <motion.div key={transfer.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 px-4 py-3.5 border-b border-border/30 hover:bg-primary/[0.03] transition-all"
            >
              <div className={`h-10 w-10 rounded-lg ${ps.bg} border border-border/30 flex flex-col items-center justify-center shrink-0`}>
                <span className={`text-xs font-bold font-mono ${ps.text}`}>{transfer.position}</span>
                <span className={`text-[9px] font-mono ${ps.text} opacity-60`}>{transfer.overall}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{transfer.playerName}</p>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                  <span className="truncate max-w-[100px]">{transfer.from}</span>
                  <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                  <span className="truncate max-w-[100px] text-foreground">{transfer.to}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold font-mono text-primary">{transfer.price} <span className="text-xs text-muted-foreground">$BALL</span></p>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{timeAgo(transfer.completedAt)}</span>
                </div>
              </div>
              <div className="hidden sm:block shrink-0">
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${transfer.type === "buy" ? "bg-primary/10 text-primary" : transfer.type === "sell" ? "bg-destructive/10 text-destructive" : "bg-gold/10 text-gold"}`}>
                  {transfer.type}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Transfers;
