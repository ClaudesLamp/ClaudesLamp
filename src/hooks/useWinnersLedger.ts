import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WinnerEntry {
  id: string;
  wallet: string;
  walletFull: string;
  amount: number;
  tier: string;
  timestamp: string;
  txSignature?: string;
}

// Ensures winners only appear after the on-screen verdict sequence finishes.
// (Matches the 6s scan/judgment experience.)
const MIN_ENTRY_AGE_MS = 6_000;

const formatTime = (date: Date) => {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};

const minCreatedAtIso = () => new Date(Date.now() - MIN_ENTRY_AGE_MS).toISOString();

interface PublicWish {
  id: string;
  wallet_trunc: string;
  verdict: string;
  score: number | null;
  payout_amount: number | null;
  payout_tier: string | null;
  is_jackpot: boolean | null;
  tx_signature: string | null;
  created_at: string;
}

export const useWinnersLedger = (maxWinners: number = 10) => {
  const [liveWinners, setLiveWinners] = useState<WinnerEntry[]>([]);
  const [dailyLegends, setDailyLegends] = useState<WinnerEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"live" | "legends">("live");

  const timeoutsRef = useRef<number[]>([]);

  const clearScheduled = useCallback(() => {
    for (const t of timeoutsRef.current) window.clearTimeout(t);
    timeoutsRef.current = [];
  }, []);

  // Fetch recent winners from public_wishes table (LIVE tab)
  const fetchLiveWinners = useCallback(async () => {
    const { data, error } = await supabase
      .from('public_wishes')
      .select('id, wallet_trunc, verdict, score, payout_amount, payout_tier, is_jackpot, tx_signature, created_at')
      .eq('verdict', 'WORTHY')
      .gt('payout_amount', 0)
      // Only show winners once an on-chain tx exists (claimed/confirmed)
      .not('tx_signature', 'is', null)
      .neq('tx_signature', '')
      .lt('created_at', minCreatedAtIso())
      .order('created_at', { ascending: false })
      .limit(maxWinners);

    if (error) {
      console.error("Failed to fetch live winners:", error);
      return;
    }

    if (data) {
      const formattedWinners: WinnerEntry[] = (data as PublicWish[])
        .map((w) => {
          const txSignature = (w.tx_signature ?? '').trim();
          return {
            id: w.id,
            wallet: w.wallet_trunc,
            walletFull: w.wallet_trunc, // Only truncated version available for privacy
            amount: w.payout_amount || 0,
            tier: w.payout_tier || "COMMON",
            timestamp: formatTime(new Date(w.created_at)),
            txSignature: txSignature || undefined,
          };
        })
        .filter((w) => !!w.txSignature);

      setLiveWinners(formattedWinners);
    }
  }, [maxWinners]);

  // Fetch daily top winners from public_wishes table (LEGENDS tab)
  const fetchDailyLegends = useCallback(async () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('public_wishes')
      .select('id, wallet_trunc, verdict, score, payout_amount, payout_tier, is_jackpot, tx_signature, created_at')
      .eq('verdict', 'WORTHY')
      .gt('payout_amount', 0)
      // Only show winners once an on-chain tx exists (claimed/confirmed)
      .not('tx_signature', 'is', null)
      .neq('tx_signature', '')
      .gte('created_at', twentyFourHoursAgo)
      .lt('created_at', minCreatedAtIso())
      .order('payout_amount', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Failed to fetch daily legends:", error);
      return;
    }

    if (data) {
      const formattedLegends: WinnerEntry[] = (data as PublicWish[])
        .map((w) => {
          const txSignature = (w.tx_signature ?? '').trim();
          return {
            id: w.id,
            wallet: w.wallet_trunc,
            walletFull: w.wallet_trunc, // Only truncated version available for privacy
            amount: w.payout_amount || 0,
            tier: w.payout_tier || "COMMON",
            timestamp: formatTime(new Date(w.created_at)),
            txSignature: txSignature || undefined,
          };
        })
        .filter((w) => !!w.txSignature);

      setDailyLegends(formattedLegends);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLiveWinners();
    fetchDailyLegends();
  }, [fetchLiveWinners, fetchDailyLegends]);

  // Realtime subscription for new winners via public_wishes (sanitized table)
  useEffect(() => {
    clearScheduled();

    console.log('[WinnersLedger] Setting up realtime subscription...');

    const channel = supabase
      .channel("winners-ledger-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "public_wishes",
        },
        (payload) => {
          console.log('[WinnersLedger] INSERT received:', payload);
          handleNewWish(payload.new as PublicWish | undefined);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "public_wishes",
        },
        (payload) => {
          console.log('[WinnersLedger] UPDATE received:', payload);
          handleNewWish(payload.new as PublicWish | undefined);
        }
      )
      .subscribe((status, err) => {
        console.log('[WinnersLedger] Subscription status:', status, err || '');
        if (status === 'SUBSCRIBED') {
          console.log('[WinnersLedger] Successfully subscribed to realtime updates');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('[WinnersLedger] Channel error:', err);
        }
      });

    function handleNewWish(newRow: PublicWish | undefined) {
      if (!newRow) return;
      if (newRow.verdict !== "WORTHY") return;

      // Only show entries once they have an on-chain tx to link to
      const txSignature = (newRow.tx_signature ?? '').trim();
      if (!txSignature) return;
      
      const amount = Number(newRow.payout_amount ?? 0);
      if (!amount || amount <= 0) return;

      const createdAtMs = newRow.created_at ? new Date(newRow.created_at).getTime() : Date.now();
      const delayMs = Math.max(0, createdAtMs + MIN_ENTRY_AGE_MS - Date.now());

      console.log('[WinnersLedger] Scheduling winner display in', delayMs, 'ms');

      const timeoutId = window.setTimeout(() => {
        const newWinner: WinnerEntry = {
          id: newRow.id,
          wallet: newRow.wallet_trunc,
          walletFull: newRow.wallet_trunc,
          amount,
          tier: newRow.payout_tier || "COMMON",
          timestamp: formatTime(new Date(newRow.created_at)),
          txSignature,
        };

        console.log('[WinnersLedger] Adding winner to list:', newWinner.wallet, newWinner.amount);

            setLiveWinners((prev) => {
              const existingIndex = prev.findIndex((w) => w.id === newWinner.id);
              if (existingIndex !== -1) {
                const next = [...prev];
                next[existingIndex] = { ...next[existingIndex], ...newWinner };
                return next;
              }
              return [newWinner, ...prev].slice(0, maxWinners);
            });

        fetchDailyLegends();
      }, delayMs);

      timeoutsRef.current.push(timeoutId);
    }

    return () => {
      console.log('[WinnersLedger] Cleaning up subscription');
      clearScheduled();
      supabase.removeChannel(channel);
    };
  }, [maxWinners, fetchDailyLegends, clearScheduled]);

  return {
    liveWinners,
    dailyLegends,
    activeTab,
    setActiveTab,
  };
};
