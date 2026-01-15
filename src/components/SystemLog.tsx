import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSystemLogs, LogColor, LogEntry } from "@/hooks/useSystemLogs";

export interface SystemLogHandle {
  startScanSequence: (wishText: string) => Promise<void>;
}

export const SystemLog = forwardRef<SystemLogHandle>((_, ref) => {
  const { logs, isScanning, startScanSequence } = useSystemLogs(25);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    startScanSequence
  }));

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Light colors on dark terracotta background
  const getLogColor = (color: LogColor) => {
    switch (color) {
      case "green": return "hsl(50 90% 75%)"; // Soft gold for oracle
      case "red": return "hsl(15 80% 70%)"; // Warm coral for errors
      case "yellow": return "hsl(45 100% 80%)"; // Bright cream-gold for warnings
      case "cyan": return "hsl(40 60% 80%)"; // Pale sand for blockchain
      case "orange": return "hsl(0 85% 72%)"; // Soft red/coral for multiplayer - distinct!
      default: return "hsl(40 40% 85%)"; // Off-white cream
    }
  };

  const getTextShadow = (color: LogColor) => {
    switch (color) {
      case "red": return "0 0 8px hsl(15 80% 70% / 0.5)";
      case "green": return "0 0 6px hsl(50 90% 75% / 0.4)";
      case "yellow": return "0 0 6px hsl(45 100% 80% / 0.4)";
      case "cyan": return "0 0 6px hsl(40 60% 80% / 0.3)";
      case "orange": return "0 0 10px hsl(0 85% 72% / 0.6)"; // Red glow for multiplayer
      default: return "none";
    }
  };

  return (
    <div className="hidden md:block fixed bottom-20 left-6 z-30 w-[340px] md:w-[400px]">
      <div 
        className="rounded px-3 py-2 font-pixel text-[7px] md:text-[8px]"
        style={{
          background: "#a65a3e",
          border: "1px solid hsl(20 50% 25%)",
          boxShadow: "0 4px 16px hsl(16 60% 15% / 0.4), inset 0 1px 0 hsl(20 50% 40% / 0.3)",
        }}
      >
        {/* Header */}
        <div 
          className="mb-1.5 pb-1 flex items-center gap-2"
          style={{ 
            borderBottom: "1px solid hsl(20 40% 35% / 0.5)",
            color: "hsl(45 80% 85%)"
          }}
        >
          <span 
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ 
              background: isScanning ? "hsl(var(--gold))" : "hsl(45 90% 70%)",
              animation: isScanning ? "pulse 0.3s ease-in-out infinite" : "pulse 2s ease-in-out infinite",
              boxShadow: isScanning ? "0 0 8px hsl(var(--gold))" : "0 0 4px hsl(45 90% 70% / 0.5)"
            }}
          />
          {isScanning ? "⚡ ANALYZING SOUL..." : "SYSTEM LOG"}
        </div>

        {/* Log entries - Fixed height to match WinnersLedger */}
        <div 
          ref={scrollRef}
          className="overflow-hidden space-y-0.5"
          style={{ height: "144px" }}
        >
          <AnimatePresence mode="popLayout">
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex gap-2"
              >
                <span 
                  className="shrink-0 opacity-60"
                  style={{ 
                    color: "hsl(40 30% 75%)"
                  }}
                >
                  [{log.timestamp}]
                </span>
                <span 
                  style={{ 
                    color: getLogColor(log.color),
                    textShadow: getTextShadow(log.color)
                  }}
                >
                  {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Cursor blink */}
        <div className="mt-1" style={{ color: "hsl(45 90% 75%)" }}>
          <span style={{ animation: isScanning ? "pulse 0.2s ease-in-out infinite" : "pulse 1s ease-in-out infinite" }}>▌</span>
        </div>
      </div>
    </div>
  );
});

SystemLog.displayName = "SystemLog";
