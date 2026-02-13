import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { usePackTypes } from "@/hooks/use-packs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PackCard } from "@/components/packs/PackCard";
import { PackOpeningSequence } from "@/components/packs/PackOpeningSequence";
import type { FUTCardData } from "@/components/packs/FUTCard";

const PackStore = () => {
  const { data: packs = [], isLoading } = usePackTypes();
  const { wallet, walletId, isConnected } = useWallet();
  const queryClient = useQueryClient();
  const [opening, setOpening] = useState<string | null>(null);
  const [revealedCards, setRevealedCards] = useState<FUTCardData[]>([]);
  const [revealTier, setRevealTier] = useState("bronze");
  const [revealPackName, setRevealPackName] = useState("");
  const [showReveal, setShowReveal] = useState(false);

  const handleOpenPack = async (pack: any) => {
    if (!walletId || !isConnected) {
      toast.error("Connect your wallet first");
      return;
    }
    setOpening(pack.id);
    try {
      const { data, error } = await supabase.functions.invoke("open-pack", {
        body: { wallet_id: walletId, pack_type_id: pack.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setRevealedCards(data.cards);
      setRevealTier(pack.tier);
      setRevealPackName(data.pack_name || pack.name);
      setShowReveal(true);
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["my-cards"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to open pack");
    } finally {
      setOpening(null);
    }
  };

  const handleCloseReveal = () => {
    setShowReveal(false);
    setRevealedCards([]);
    toast.success("Cards added to your collection!");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Pack Store</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Open packs to collect player cards
        </p>
      </motion.div>

      {/* Pack Grid — 5-col desktop, horizontal scroll mobile */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[360px] rounded-2xl glass animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Desktop grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {packs.map((pack: any, i: number) => (
              <PackCard
                key={pack.id}
                pack={pack}
                canAfford={isConnected && (wallet?.ball_balance || 0) >= pack.price_ball}
                isOpening={opening === pack.id}
                onOpen={() => handleOpenPack(pack)}
                index={i}
              />
            ))}
          </div>

          {/* Mobile horizontal scroll */}
          <div className="sm:hidden flex gap-4 overflow-x-auto pack-scroll-snap pb-4 -mx-4 px-4">
            {packs.map((pack: any, i: number) => (
              <PackCard
                key={pack.id}
                pack={pack}
                canAfford={isConnected && (wallet?.ball_balance || 0) >= pack.price_ball}
                isOpening={opening === pack.id}
                onOpen={() => handleOpenPack(pack)}
                index={i}
              />
            ))}
          </div>
        </>
      )}

      {/* Pack Opening Overlay */}
      <AnimatePresence>
        {showReveal && revealedCards.length > 0 && (
          <PackOpeningSequence
            cards={revealedCards}
            tier={revealTier}
            packName={revealPackName}
            onClose={handleCloseReveal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PackStore;
