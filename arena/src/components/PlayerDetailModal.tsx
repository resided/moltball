import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useWallet } from "@/hooks/use-wallet";
import { usePlayerPriceHistory } from "@/hooks/use-game-data";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Minus, Plus, TrendingUp, TrendingDown } from "lucide-react";

const positionColors: Record<string, { bg: string; text: string }> = {
  GK: { bg: "bg-amber-500/20", text: "text-amber-400" },
  DF: { bg: "bg-sky-500/20", text: "text-sky-400" },
  MF: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  FW: { bg: "bg-rose-500/20", text: "text-rose-400" },
};

function getPositionStyle(pos: string) {
  return positionColors[pos] || { bg: "bg-muted", text: "text-muted-foreground" };
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={`text-xs font-mono font-bold ${value >= 85 ? "text-primary" : value >= 75 ? "text-foreground" : "text-muted-foreground"}`}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8 }} className={`h-full rounded-full ${color}`} />
      </div>
    </div>
  );
}

interface PlayerDetailModalProps {
  player: {
    id: string;
    playerName: string;
    position: string;
    overall: number;
    price: number;
    seller: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTradeComplete?: () => void;
}

export function PlayerDetailModal({ player, open, onOpenChange, onTradeComplete }: PlayerDetailModalProps) {
  const { wallet, walletId, isConnected, holdings, refreshWallet } = useWallet();
  const [shares, setShares] = useState(1);
  const [buying, setBuying] = useState(false);
  const [selling, setSelling] = useState(false);

  const { data: priceHistory = [] } = usePlayerPriceHistory(player?.id);

  const chartData = useMemo(() => {
    if (priceHistory.length === 0 && player) {
      // Generate simple chart from current price
      return [{ day: "Now", price: player.price }];
    }
    return priceHistory.map((ph: any) => ({
      day: new Date(ph.recorded_at).toLocaleDateString("en-US", { month: "numeric", day: "numeric" }),
      price: Math.round(ph.price),
    }));
  }, [priceHistory, player]);

  if (!player) return null;

  const ps = getPositionStyle(player.position);
  const userHolding = holdings.find((h: any) => h.player_id === player.id);
  const userShares = userHolding?.shares || 0;
  const totalCost = player.price * shares;
  const canAfford = isConnected && (wallet?.ball_balance || 0) >= totalCost;

  const firstPrice = chartData[0]?.price ?? player.price;
  const lastPrice = chartData[chartData.length - 1]?.price ?? player.price;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? ((priceChange / firstPrice) * 100).toFixed(1) : "0";

  const handleBuy = async () => {
    if (!walletId) return;
    setBuying(true);
    try {
      const { data, error } = await supabase.functions.invoke("buy-shares", {
        body: { wallet_id: walletId, player_id: player.id, shares },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Bought ${shares} share${shares > 1 ? "s" : ""} of ${player.playerName}!`);
      refreshWallet();
      onTradeComplete?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to buy shares");
    } finally {
      setBuying(false);
    }
  };

  const handleSell = async () => {
    if (!walletId) return;
    setSelling(true);
    try {
      const { data, error } = await supabase.functions.invoke("sell-shares", {
        body: { wallet_id: walletId, player_id: player.id, shares },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Sold ${shares} share${shares > 1 ? "s" : ""} of ${player.playerName}! Profit: ${data.profit > 0 ? "+" : ""}${data.profit} $BALL`);
      refreshWallet();
      onTradeComplete?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to sell shares");
    } finally {
      setSelling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 glass-strong border-border/50 overflow-hidden">
        <DialogTitle className="sr-only">{player.playerName} Details</DialogTitle>

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="absolute inset-0 gradient-premium opacity-60" />
          <div className="relative flex items-start gap-4">
            <div className={`h-16 w-16 rounded-xl ${ps.bg} border border-border/50 flex flex-col items-center justify-center shrink-0 glow-pitch`}>
              <span className={`text-lg font-bold font-mono ${ps.text}`}>{player.position}</span>
              <span className={`text-[10px] font-mono ${ps.text} opacity-70`}>{player.overall}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground tracking-tight">{player.playerName}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Listed by {player.seller}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold font-mono text-primary text-glow">{player.price}</span>
                  <span className="text-xs text-muted-foreground">$BALL</span>
                </div>
                {chartData.length > 1 && (
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full flex items-center gap-1 ${priceChange >= 0 ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                    {priceChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(Number(priceChangePercent))}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 1 && (
          <div className="px-6 pb-3">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Price History</h3>
            <div className="h-24 rounded-lg bg-secondary/30 border border-border/30 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 72%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 72%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={false} axisLine={false} />
                  <YAxis hide domain={["dataMin - 20", "dataMax + 20"]} />
                  <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", fontSize: "12px", fontFamily: "JetBrains Mono" }} formatter={(value: number) => [`${value} $BALL`, "Price"]} />
                  <Area type="monotone" dataKey="price" stroke="hsl(142, 72%, 50%)" strokeWidth={2} fill="url(#priceGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* User Holdings */}
        {isConnected && userShares > 0 && (
          <div className="px-6 pb-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="text-xs text-muted-foreground">Your Holdings</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-bold text-foreground">{userShares} shares</span>
                <span className="text-xs text-muted-foreground">≈ {Math.round(userShares * player.price)} $BALL</span>
              </div>
            </div>
          </div>
        )}

        {/* Trade Controls */}
        <div className="px-6 pb-6 space-y-3">
          {isConnected ? (
            <>
              {/* Quantity selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Shares</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShares(Math.max(1, shares - 1))} className="h-7 w-7 rounded-md glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-foreground">{shares}</span>
                  <button onClick={() => setShares(Math.min(100, shares + 1))} className="h-7 w-7 rounded-md glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-xs font-mono text-muted-foreground">= {totalCost} $BALL</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBuy}
                  disabled={!canAfford || buying}
                  className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-bold text-sm tracking-wide hover:bg-primary/90 transition-all glow-pitch-strong active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {buying ? "Buying..." : `BUY ${shares} for ${totalCost} $BALL`}
                </button>
                {userShares > 0 && (
                  <button
                    onClick={handleSell}
                    disabled={userShares < shares || selling}
                    className="flex-1 h-11 rounded-lg border border-destructive/50 text-destructive font-bold text-sm tracking-wide hover:bg-destructive/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selling ? "Selling..." : `SELL ${shares}`}
                  </button>
                )}
              </div>

              {!canAfford && (
                <p className="text-xs text-destructive text-center">Insufficient balance. Need {totalCost} $BALL, have {Math.round(wallet?.ball_balance || 0)}</p>
              )}
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">Connect your wallet to trade</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
