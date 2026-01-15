import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TreasuryStats {
  treasuryBalance: number;
  initialBalance: number;
  totalSupply: number;
  totalDistributed: number;
  percentage: number; // Lamp oil: % of initial balance remaining
  supplyPercentage: number; // "I GUARD X%": % of total supply in treasury
  symbol: string;
  tokenMint: string | null;
  treasuryWallet: string | null;
  isLive: boolean;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_STATS: TreasuryStats = {
  treasuryBalance: 0,
  initialBalance: 0,
  totalSupply: 1_000_000_000,
  totalDistributed: 0,
  percentage: 100.0, // Default to 100% until real data loads
  supplyPercentage: 0,
  symbol: 'RUB',
  tokenMint: null,
  treasuryWallet: null,
  isLive: false,
  isLoading: true,
  error: null,
};

// Track if we've received valid data at least once
let hasReceivedData = false;

// Singleton pattern to share state across components
let globalStats: TreasuryStats = { ...DEFAULT_STATS };
let listeners: Set<(stats: TreasuryStats) => void> = new Set();
let fetchInterval: ReturnType<typeof setInterval> | null = null;
let isFetching = false;
let storedInitialBalance: number | null = null;

const INITIAL_BALANCE_KEY = 'lamp_initial_treasury_balance_v2';
const CACHED_STATS_KEY = 'lamp_cached_treasury_stats';

// Load cached stats immediately on module load (instant display)
try {
  const cachedStats = localStorage.getItem(CACHED_STATS_KEY);
  if (cachedStats) {
    const parsed = JSON.parse(cachedStats);
    globalStats = { ...DEFAULT_STATS, ...parsed, isLoading: false, error: null };
    hasReceivedData = true;
    storedInitialBalance = globalStats.initialBalance || null;
    console.log('Loaded cached treasury stats instantly');
  }
} catch (e) {
  console.log('No cached stats available');
}

const notifyListeners = () => {
  listeners.forEach(listener => listener({ ...globalStats }));
};

const fetchStats = async () => {
  if (isFetching) return;
  isFetching = true;

  try {
    // Fetch current treasury balance from chain
    const { data, error } = await supabase.functions.invoke('treasury-stats');
    
    // Fetch total distributed from public_wishes (public table without sensitive data)
    const { data: wishData } = await supabase
      .from('public_wishes')
      .select('payout_amount')
      .eq('verdict', 'WORTHY')
      .gt('payout_amount', 0)
      .not('tx_signature', 'is', null);
    
    const totalDistributed = wishData?.reduce((sum, w) => sum + (w.payout_amount || 0), 0) || 0;
    
    if (error) {
      console.error('Error fetching treasury stats:', error);
      // Only update error state if we've never received data
      // Otherwise keep showing last known good state
      if (!hasReceivedData) {
        globalStats = {
          ...globalStats,
          isLoading: false,
          error: 'Failed to fetch',
        };
      }
    } else if (data) {
      const currentBalance =
        typeof data.treasuryBalance === "number" ? data.treasuryBalance : 0;
      const totalSupply =
        typeof data.totalSupply === "number" ? data.totalSupply : 1_000_000_000;

      // Normalize critical metadata (used by Footer + Source Viewer) even when balance is 0.
      // NOTE: 0 is a valid on-chain state (e.g. treasury drained), so we must NOT skip it.
      const nextTokenMint =
        data.tokenMint && data.tokenMint !== "NOT_CONFIGURED" ? data.tokenMint : null;
      const nextTreasuryWallet =
        data.treasuryWallet && data.treasuryWallet !== "NOT_CONFIGURED"
          ? data.treasuryWallet
          : null;
      
      // First time seeing live data? Store initial balance
      // Initial balance = current balance + already distributed
      if (!storedInitialBalance && currentBalance > 0) {
        const storedValue = localStorage.getItem(INITIAL_BALANCE_KEY);
        if (storedValue) {
          storedInitialBalance = parseFloat(storedValue);
        } else {
          // Initial = current + what was already given out
          storedInitialBalance = currentBalance + totalDistributed;
          localStorage.setItem(INITIAL_BALANCE_KEY, storedInitialBalance.toString());
        }
      }
      
      const initialBalance = storedInitialBalance || (currentBalance + totalDistributed) || 100_000_000;
      
      // Lamp Oil: how much is left of the initial treasury amount
      // percentage = (currentBalance / initialBalance) * 100
      const percentage = initialBalance > 0 
        ? Math.max(0, Math.min(100, (currentBalance / initialBalance) * 100))
        : 100;
      
      // Supply Percentage: what % of total supply is in treasury
      // supplyPercentage = (currentBalance / totalSupply) * 100
      const supplyPercentage = totalSupply > 0
        ? Math.max(0, Math.min(100, (currentBalance / totalSupply) * 100))
        : 0;
      
      // Mark that we've received valid data
      hasReceivedData = true;
      
      globalStats = {
        treasuryBalance: currentBalance,
        initialBalance: initialBalance,
        totalSupply: totalSupply,
        totalDistributed: totalDistributed,
        percentage: percentage,
        supplyPercentage: supplyPercentage,
        symbol: data.symbol || 'RUB',
        tokenMint: nextTokenMint,
        treasuryWallet: nextTreasuryWallet,
        isLive: data.isLive || false,
        isLoading: false,
        error: null,
      };
      
      // Cache the stats for instant load next time
      try {
        localStorage.setItem(CACHED_STATS_KEY, JSON.stringify(globalStats));
      } catch (e) {
        // Ignore storage errors
      }
    }
  } catch (err) {
    console.error('Error:', err);
    globalStats = {
      ...globalStats,
      isLoading: false,
      error: 'Connection error',
    };
  } finally {
    isFetching = false;
    notifyListeners();
  }
};

const startPolling = () => {
  if (!fetchInterval) {
    fetchStats(); // Initial fetch
    fetchInterval = setInterval(fetchStats, 10000); // Refresh every 10 seconds to avoid rate limits
  }
};

const stopPollingIfNoListeners = () => {
  if (listeners.size === 0 && fetchInterval) {
    clearInterval(fetchInterval);
    fetchInterval = null;
  }
};

export const useTreasuryStats = (): TreasuryStats => {
  const [stats, setStats] = useState<TreasuryStats>({ ...globalStats });

  useEffect(() => {
    // Subscribe to updates
    const listener = (newStats: TreasuryStats) => setStats(newStats);
    listeners.add(listener);
    
    // Start polling if first listener
    startPolling();
    
    // Sync with current global state
    setStats({ ...globalStats });

    return () => {
      listeners.delete(listener);
      stopPollingIfNoListeners();
    };
  }, []);

  return stats;
};

// Format large numbers with commas
export const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B';
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K';
  }
  return num.toLocaleString();
};

// Get color based on percentage
export const getOilColor = (percentage: number): { main: string; glow: string; class: string } => {
  if (percentage > 50) {
    return { 
      main: '#FFD700', 
      glow: 'rgba(255, 215, 0, 0.6)',
      class: 'gold'
    };
  } else if (percentage >= 20) {
    return { 
      main: '#FF8C00', 
      glow: 'rgba(255, 140, 0, 0.6)',
      class: 'orange'
    };
  } else {
    return { 
      main: '#FF4444', 
      glow: 'rgba(255, 68, 68, 0.6)',
      class: 'red'
    };
  }
};

// Reset initial balance (for testing/new launches)
export const resetInitialBalance = () => {
  localStorage.removeItem(INITIAL_BALANCE_KEY);
  storedInitialBalance = null;
  fetchStats();
};
