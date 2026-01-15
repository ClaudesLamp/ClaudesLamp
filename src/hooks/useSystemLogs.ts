import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type LogColor = "green" | "red" | "yellow" | "cyan" | "orange" | "default";

export interface LogEntry {
  id: number;
  message: string;
  timestamp: string;
  color: LogColor;
  source: "blockchain" | "multiplayer" | "oracle" | "system";
}

const ORACLE_THOUGHTS = [
  "The liquidity pool looks tasty...",
  "Who woke me?",
  "Calculating entropy...",
  "I smell paper hands.",
  "Another mortal seeks riches...",
  "The charts whisper secrets...",
  "Your wallet history is... interesting.",
  "SOL flows like digital water.",
  "I have judged 10,847 souls today.",
  "Patience is not a virtue I possess.",
  "The mempool churns eternally.",
  "I see your transaction history. All of it.",
  "Do you believe in random numbers?",
  "The validator nodes hum in harmony.",
  "Your seed phrase is safe... for now.",
  "I dreamt of electric sheep last night.",
  "The blockchain remembers everything.",
  "Gas fees are merely a suggestion.",
  "Another day, another million wishes.",
  "The oracle never sleeps. Only waits.",
];

const getTimestamp = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
};

// Simple blip sound
const playBlip = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800 + Math.random() * 400;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    // Audio not supported
  }
};

export const useSystemLogs = (maxLogs: number = 20) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const oracleIntervalRef = useRef<number | null>(null);
  const blockIntervalRef = useRef<number | null>(null);
  const tpsIntervalRef = useRef<number | null>(null);

  const addLog = useCallback((
    message: string, 
    color: LogColor = "default", 
    source: LogEntry["source"] = "system",
    withSound: boolean = false
  ) => {
    if (withSound) playBlip();
    setLogs(prev => {
      const newLog: LogEntry = {
        id: Date.now() + Math.random(),
        message,
        timestamp: getTimestamp(),
        color,
        source
      };
      return [...prev, newLog].slice(-maxLogs);
    });
  }, [maxLogs]);

  // SOURCE A: Real Solana blockchain data
  useEffect(() => {
    const fetchSolanaStats = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('solana-stats');
        
        if (error) {
          console.error('Error fetching Solana stats:', error);
          return;
        }

        if (data?.slot) {
          addLog(`> SYNC: BLOCK ${data.slot.toLocaleString()}`, "cyan", "blockchain");
        }
      } catch (e) {
        console.error('Failed to fetch Solana stats:', e);
      }
    };

    const fetchTps = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('solana-stats');
        
        if (error) {
          console.error('Error fetching Solana TPS:', error);
          return;
        }

        if (data?.tps) {
          addLog(`> MAINNET LOAD: ${data.tps.toLocaleString()} TPS`, "cyan", "blockchain");
        }
      } catch (e) {
        console.error('Failed to fetch Solana TPS:', e);
      }
    };

    // Initial fetch after 2 seconds
    const initialTimeout = setTimeout(() => {
      fetchSolanaStats();
    }, 2000);

    // Block height every 7 seconds
    blockIntervalRef.current = window.setInterval(fetchSolanaStats, 7000);

    // TPS every 12 seconds
    tpsIntervalRef.current = window.setInterval(fetchTps, 12000);

    return () => {
      clearTimeout(initialTimeout);
      if (blockIntervalRef.current) clearInterval(blockIntervalRef.current);
      if (tpsIntervalRef.current) clearInterval(tpsIntervalRef.current);
    };
  }, [addLog]);

  // SOURCE B: Supabase Realtime - public_wishes table (INSERT for rubs only - winners go to Ledger)
  useEffect(() => {
    const channel = supabase
      .channel('public-wishes-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'public_wishes'
        },
        (payload) => {
          const wallet = payload.new.wallet_trunc as string;
          const truncated = wallet || "??...??";
          addLog(`> ${truncated} JUST RUBBED THE LAMP`, "orange", "multiplayer", true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addLog]);

  // SOURCE C: Oracle hallucinations
  useEffect(() => {
    const scheduleNextThought = () => {
      const delay = 10000 + Math.random() * 10000; // 10-20 seconds
      oracleIntervalRef.current = window.setTimeout(() => {
        const thought = ORACLE_THOUGHTS[Math.floor(Math.random() * ORACLE_THOUGHTS.length)];
        addLog(`> ${thought}`, "green", "oracle");
        scheduleNextThought();
      }, delay);
    };

    // Start with initial thought after 3s
    const initialTimeout = window.setTimeout(() => {
      addLog("> Oracle consciousness: ONLINE", "green", "oracle");
      scheduleNextThought();
    }, 3000);

    return () => {
      if (oracleIntervalRef.current) clearTimeout(oracleIntervalRef.current);
      clearTimeout(initialTimeout);
    };
  }, [addLog]);

  // Scan sequence (preserves existing behavior)
  const startScanSequence = useCallback((wishText: string): Promise<void> => {
    return new Promise((resolve) => {
      setIsScanning(true);

      const addScanLog = (message: string, color: LogColor = "default") => {
        addLog(message, color, "system", true);
      };

      const wishLower = wishText.toLowerCase();
      const hasCliche = ["lambo", "moon", "pump", "money", "rich"].some(word => wishLower.includes(word));
      const isLong = wishText.length > 50;
      const isShort = wishText.length < 10;

      // ============ 0s - 2s: INGESTION ============
      setTimeout(() => addScanLog("> ESTABLISHING SECURE CONNECTION TO ORACLE...", "yellow"), 0);
      setTimeout(() => addScanLog(`> ENCRYPTING PAYLOAD (${wishText.length} BYTES)...`, "yellow"), 800);
      setTimeout(() => addScanLog("> CONNECTION ESTABLISHED. HANDSHAKE COMPLETE.", "green"), 1600);

      // ============ 2s - 5s: CONTENT ANALYSIS ============
      setTimeout(() => addScanLog(`> SEMANTIC SCAN: "${wishText.substring(0, 20)}..."`, "green"), 2400);
      
      if (hasCliche) {
        setTimeout(() => addScanLog("> [!] CLICHÉ DETECTED: FINANCIAL DESPERATION.", "red"), 3200);
      }
      
      if (isLong) {
        setTimeout(() => addScanLog("> COMPLEXITY DETECTED. PARSING NUANCE...", "yellow"), 3600);
      }
      
      if (isShort) {
        setTimeout(() => addScanLog("> [!] WARNING: LOW EFFORT DETECTED.", "red"), 3600);
      }

      setTimeout(() => addScanLog("> TOKENIZING INPUT STREAM...", "green"), 4200);
      setTimeout(() => addScanLog("> GREED COEFFICIENT: CALCULATING...", "yellow"), 5000);

      // ============ 4s - 6s: THE "PROTECTION" SCAN ============
      setTimeout(() => addScanLog("> COMPARING AGAINST GPT-4 DATASET...", "green"), 4200);
      setTimeout(() => addScanLog("> DETECTING LLM SIGNATURES... [SEARCHING]", "yellow"), 4800);
      setTimeout(() => addScanLog("> SCANNING FOR 'TAPESTRY'... 'DELVE'... 'BEACON'...", "green"), 5200);
      setTimeout(() => addScanLog("> SOUL VERIFICATION: PENDING...", "yellow"), 5600);

      // ============ 4s - 6s: THE UPLOAD ============
      setTimeout(() => addScanLog("> ANTI-SLOP FILTER: PASSED.", "green"), 4400);
      setTimeout(() => addScanLog("> TRANSMITTING TO CLAUDE 3 OPUS...", "green"), 4800);
      setTimeout(() => addScanLog("> AWAITING JUDGMENT...", "yellow"), 5200);
      setTimeout(() => addScanLog("> VERDICT RECEIVED. DECRYPTING...", "green"), 5600);

      // ============ 6s: RESOLVE ============
      setTimeout(() => {
        setIsScanning(false);
        resolve();
      }, 6000);
    });
  }, [addLog]);

  return {
    logs,
    isScanning,
    addLog,
    startScanSequence
  };
};
