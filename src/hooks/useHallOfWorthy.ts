import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WorthyEntry {
  id: string;
  created_at: string;
  wallet_trunc: string;
  payout_amount: number;
  payout_tier: string;
  tx_signature: string;
  is_jackpot: boolean;
}

export const useHallOfWorthy = () => {
  return useQuery({
    queryKey: ["hall-of-worthy"],
    queryFn: async (): Promise<WorthyEntry[]> => {
      const { data, error } = await supabase
        .from("public_wishes")
        .select("id, created_at, wallet_trunc, payout_amount, payout_tier, tx_signature, is_jackpot")
        .eq("verdict", "WORTHY")
        .not("tx_signature", "is", null)
        .order("payout_amount", { ascending: false });

      if (error) throw error;
      return (data || []) as WorthyEntry[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
