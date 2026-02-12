import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const WALLET_KEY = "moltball_wallet_id";

export function useWallet() {
  const [walletId, setWalletId] = useState<string | null>(() =>
    localStorage.getItem(WALLET_KEY)
  );
  const queryClient = useQueryClient();

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["wallet", walletId],
    enabled: !!walletId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_wallets")
        .select("*")
        .eq("id", walletId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: holdings = [] } = useQuery({
    queryKey: ["holdings", walletId],
    enabled: !!walletId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_holdings")
        .select("*, player:players(*)")
        .eq("wallet_id", walletId!);
      if (error) throw error;
      return data || [];
    },
  });

  const connectWallet = useMutation({
    mutationFn: async (displayName?: string) => {
      // Generate a mock wallet address
      const addr = "0x" + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join("");

      const { data, error } = await supabase
        .from("user_wallets")
        .insert({
          wallet_address: addr,
          display_name: displayName || `Player_${addr.slice(2, 6)}`,
          ball_balance: 10000,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem(WALLET_KEY, data.id);
      setWalletId(data.id);
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });

  const disconnect = () => {
    localStorage.removeItem(WALLET_KEY);
    setWalletId(null);
    queryClient.invalidateQueries({ queryKey: ["wallet"] });
    queryClient.invalidateQueries({ queryKey: ["holdings"] });
  };

  const refreshWallet = () => {
    queryClient.invalidateQueries({ queryKey: ["wallet", walletId] });
    queryClient.invalidateQueries({ queryKey: ["holdings", walletId] });
  };

  return {
    wallet,
    walletId,
    holdings,
    isLoading,
    isConnected: !!walletId && !!wallet,
    connectWallet,
    disconnect,
    refreshWallet,
  };
}
