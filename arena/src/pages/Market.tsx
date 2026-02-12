import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useCardListings } from "@/hooks/use-packs";
import { useWallet } from "@/hooks/use-wallet";
import { PlayerCard } from "@/components/PlayerCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Search, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const rarityFilters = ["All", "bronze", "silver", "gold", "premium", "icon"] as const;

const Market = () => {
  const { data: listings = [], isLoading } = useCardListings();
  const { wallet, walletId, isConnected, refreshWallet } = useWallet();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState<string>("All");
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [buying, setBuying] = useState(false);

  const filtered = useMemo(() => {
    return listings
      .filter((l: any) => rarityFilter === "All" || l.card?.rarity === rarityFilter)
      .filter((l: any) => l.card?.player?.name?.toLowerCase().includes(search.toLowerCase()));
  }, [listings, search, rarityFilter]);

  const handleBuy = async (listing: any) => {
    if (!walletId) return;
    setBuying(true);
    try {
      const { data, error } = await supabase.functions.invoke("buy-card", {
        body: { wallet_id: walletId, listing_id: listing.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Bought ${listing.card?.player?.name} for ${listing.price_ball} $BALL!`);
      refreshWallet();
      queryClient.invalidateQueries({ queryKey: ["card-listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-cards"] });
      setSelectedListing(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to buy card");
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
        <p className="text-sm text-muted-foreground mt-1">{listings.length} cards listed · 5% fee on sales</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search players..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg glass text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {rarityFilters.map(f => (
            <button key={f} onClick={() => setRarityFilter(f)}
              className={`px-3 h-9 rounded-lg text-xs font-semibold capitalize transition-all ${
                rarityFilter === f ? "bg-primary text-primary-foreground glow-pitch" : "glass text-muted-foreground hover:text-foreground"
              }`}>
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading marketplace...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No cards listed. Open packs and list your cards!</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((listing: any, i: number) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex flex-col items-center gap-2 cursor-pointer group"
              onClick={() => setSelectedListing(listing)}
            >
              {listing.card && (
                <PlayerCard card={listing.card} size="md" />
              )}
              <div className="text-center">
                <span className="text-sm font-bold font-mono text-primary">{listing.price_ball} $BALL</span>
                <p className="text-[10px] text-muted-foreground">
                  by {listing.seller?.display_name || "Unknown"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Buy Confirmation Modal */}
      <Dialog open={!!selectedListing} onOpenChange={(o) => !o && setSelectedListing(null)}>
        <DialogContent className="max-w-sm glass-strong border-border/50">
          <DialogTitle className="text-lg font-bold">Buy Card</DialogTitle>
          {selectedListing?.card && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <PlayerCard card={selectedListing.card} size="lg" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-bold font-mono text-primary">{selectedListing.price_ball} $BALL</p>
                <p className="text-xs text-muted-foreground">Seller: {selectedListing.seller?.display_name || "Unknown"}</p>
              </div>
              {isConnected ? (
                <>
                  <button
                    onClick={() => handleBuy(selectedListing)}
                    disabled={buying || (wallet?.ball_balance || 0) < selectedListing.price_ball || selectedListing.seller_wallet_id === walletId}
                    className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-bold text-sm tracking-wide hover:bg-primary/90 transition-all glow-pitch-strong active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {buying ? "Buying..." : `BUY FOR ${selectedListing.price_ball} $BALL`}
                  </button>
                  {selectedListing.seller_wallet_id === walletId && (
                    <p className="text-xs text-muted-foreground text-center">This is your listing</p>
                  )}
                  {(wallet?.ball_balance || 0) < selectedListing.price_ball && (
                    <p className="text-xs text-destructive text-center">Insufficient balance</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center">Connect wallet to buy</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Market;
