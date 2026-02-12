import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/hooks/use-wallet";

export function usePackTypes() {
  return useQuery({
    queryKey: ["pack-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pack_types")
        .select("*")
        .eq("available", true)
        .order("price_ball", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useMyCards() {
  const { walletId } = useWallet();
  return useQuery({
    queryKey: ["my-cards", walletId],
    enabled: !!walletId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_cards")
        .select("*, player:players(*)")
        .eq("wallet_id", walletId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCardListings() {
  return useQuery({
    queryKey: ["card-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_listings")
        .select("*, card:player_cards(*, player:players(*)), seller:user_wallets!card_listings_seller_wallet_id_fkey(display_name)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}
