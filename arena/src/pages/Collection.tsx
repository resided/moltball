import { motion } from "framer-motion";
import { useState } from "react";
import { useMyCards } from "@/hooks/use-packs";
import { useWallet } from "@/hooks/use-wallet";
import { PlayerCard } from "@/components/PlayerCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Minus, Plus, Tag } from "lucide-react";

const rarityFilters = ["All", "bronze", "silver", "gold", "premium", "icon"] as const;

const Collection = () => {
  const { data: cards = [], isLoading } = useMyCards();
  const { isConnected, walletId } = useWallet();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("All");
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [listPrice, setListPrice] = useState(100);
  const [listing, setListing] = useState(false);

  const filtered = filter === "All" ? cards : cards.filter((c: any) => c.rarity === filter);

  const handleList = async () => {
    if (!walletId || !selectedCard) return;
    setListing(true);
    try {
      const { data, error } = await supabase.functions.invoke("list-card", {
        body: { wallet_id: walletId, card_id: selectedCard.id, price_ball: listPrice, action: "list" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Card listed on marketplace!");
      queryClient.invalidateQueries({ queryKey: ["my-cards"] });
      queryClient.invalidateQueries({ queryKey: ["card-listings"] });
      setSelectedCard(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to list card");
    } finally {
      setListing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">My Collection</h1>
        <p className="text-sm text-muted-foreground mt-1">{cards.length} cards collected</p>
      </motion.div>

      {!isConnected ? (
        <div className="text-center py-16 text-muted-foreground">Connect your wallet to view your collection</div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex gap-1.5 flex-wrap">
            {rarityFilters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 h-8 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === f ? "bg-primary text-primary-foreground glow-pitch" : "glass text-muted-foreground hover:text-foreground"
                }`}>
                {f}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading collection...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No cards. Open packs to get started!</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filtered.map((card: any, i: number) => (
                <PlayerCard
                  key={card.id}
                  card={card}
                  size="md"
                  delay={i * 0.02}
                  onClick={() => { setSelectedCard(card); setListPrice(Math.round((card.player?.price_ball || 100) * 1.1)); }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* List Card Modal */}
      <Dialog open={!!selectedCard} onOpenChange={(o) => !o && setSelectedCard(null)}>
        <DialogContent className="max-w-sm glass-strong border-border/50">
          <DialogTitle className="text-lg font-bold">List Card for Sale</DialogTitle>
          {selectedCard && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <PlayerCard card={selectedCard} size="lg" />
              </div>
              {selectedCard.is_listed ? (
                <p className="text-center text-sm text-muted-foreground">This card is already listed</p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setListPrice(Math.max(1, listPrice - 50))} className="h-7 w-7 rounded-md glass flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-20 text-center font-mono font-bold text-foreground">{listPrice}</span>
                      <button onClick={() => setListPrice(listPrice + 50)} className="h-7 w-7 rounded-md glass flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-xs text-muted-foreground">$BALL</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center">5% marketplace fee applies</p>
                  <button
                    onClick={handleList}
                    disabled={listing}
                    className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-bold text-sm tracking-wide hover:bg-primary/90 transition-all glow-pitch-strong active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Tag className="h-4 w-4" />
                    {listing ? "Listing..." : `LIST FOR ${listPrice} $BALL`}
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Collection;
