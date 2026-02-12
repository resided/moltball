import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { usePackTypes } from "@/hooks/use-packs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlayerCard } from "@/components/PlayerCard";
import { useQueryClient } from "@tanstack/react-query";
import { Package, Sparkles, Zap, Crown, Gem } from "lucide-react";

const tierIcons: Record<string, any> = {
  bronze: Package,
  silver: Zap,
  gold: Sparkles,
  premium: Crown,
  icon: Gem,
};

const tierGradients: Record<string, string> = {
  bronze: "from-amber-900/40 to-amber-800/20 border-amber-700/40",
  silver: "from-slate-400/20 to-slate-500/10 border-slate-400/30",
  gold: "from-yellow-500/25 to-amber-400/10 border-yellow-500/40",
  premium: "from-violet-500/25 to-fuchsia-500/10 border-violet-400/40",
  icon: "from-cyan-400/25 to-blue-500/10 border-cyan-400/40",
};

const tierTextColors: Record<string, string> = {
  bronze: "text-amber-400",
  silver: "text-slate-300",
  gold: "text-yellow-400",
  premium: "text-violet-300",
  icon: "text-cyan-300",
};

const PackStore = () => {
  const { data: packs = [], isLoading } = usePackTypes();
  const { wallet, walletId, isConnected } = useWallet();
  const queryClient = useQueryClient();
  const [opening, setOpening] = useState<string | null>(null);
  const [revealedCards, setRevealedCards] = useState<any[]>([]);
  const [showReveal, setShowReveal] = useState(false);

  const handleOpenPack = async (packTypeId: string) => {
    if (!walletId || !isConnected) {
      toast.error("Connect your wallet first");
      return;
    }
    setOpening(packTypeId);
    try {
      const { data, error } = await supabase.functions.invoke("open-pack", {
        body: { wallet_id: walletId, pack_type_id: packTypeId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setRevealedCards(data.cards);
      setShowReveal(true);
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["my-cards"] });
      toast.success(`Opened ${data.pack_name}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to open pack");
    } finally {
      setOpening(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Pack Store</h1>
        <p className="text-sm text-muted-foreground mt-1">Open packs to collect player cards · Trade on the Marketplace</p>
      </motion.div>

      {/* Pack Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-72 rounded-xl glass animate-pulse" />
          ))
        ) : (
          packs.map((pack: any, i: number) => {
            const Icon = tierIcons[pack.tier] || Package;
            const grad = tierGradients[pack.tier] || tierGradients.bronze;
            const textColor = tierTextColors[pack.tier] || "text-foreground";
            const canAfford = isConnected && (wallet?.ball_balance || 0) >= pack.price_ball;

            return (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-xl bg-gradient-to-br ${grad} border-2 p-5 flex flex-col items-center text-center space-y-3 hover:scale-[1.03] transition-all`}
              >
                <div className={`h-14 w-14 rounded-xl bg-background/30 flex items-center justify-center ${textColor}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className={`font-bold text-lg ${textColor}`}>{pack.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{pack.description}</p>
                <div className="flex items-baseline gap-1 mt-auto pt-2">
                  <span className={`text-xl font-bold font-mono ${textColor}`}>{pack.price_ball.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">$BALL</span>
                </div>
                <button
                  onClick={() => handleOpenPack(pack.id)}
                  disabled={!canAfford || opening === pack.id}
                  className={`w-full h-10 rounded-lg font-bold text-sm tracking-wide transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${
                    pack.tier === "icon"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_hsl(190,80%,55%,0.3)]"
                      : pack.tier === "premium"
                      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_0_15px_hsl(270,70%,60%,0.25)]"
                      : pack.tier === "gold"
                      ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-background shadow-[0_0_15px_hsl(45,90%,55%,0.2)]"
                      : "bg-foreground/10 text-foreground hover:bg-foreground/20"
                  }`}
                >
                  {opening === pack.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Opening...
                    </span>
                  ) : (
                    "OPEN PACK"
                  )}
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pack Reveal Overlay */}
      <AnimatePresence>
        {showReveal && revealedCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
            onClick={() => setShowReveal(false)}
          >
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-foreground mb-8"
            >
              Pack Opened! 🎉
            </motion.h2>
            <div className="flex flex-wrap justify-center gap-4">
              {revealedCards.map((card: any, i: number) => (
                <PlayerCard
                  key={card.id}
                  card={card}
                  size="lg"
                  delay={i * 0.2}
                  revealed
                />
              ))}
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: revealedCards.length * 0.2 + 0.5 }}
              className="text-sm text-muted-foreground mt-8"
            >
              Tap anywhere to close
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PackStore;
