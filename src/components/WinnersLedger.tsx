import { motion, AnimatePresence } from "framer-motion";
import { useWinnersLedger, WinnerEntry } from "@/hooks/useWinnersLedger";
import { ExternalLink, Trophy } from "lucide-react";
import { useState } from "react";

const getTierColor = (tier: string) => {
  switch (tier?.toUpperCase()) {
    case "MYTHIC": return "hsl(45 100% 60%)";
    case "LEGENDARY": return "hsl(35 100% 55%)";
    case "RARE": return "hsl(40 80% 70%)";
    case "COMMON": 
    default: return "hsl(45 60% 75%)";
  }
};

const getTierGlow = (tier: string) => {
  switch (tier?.toUpperCase()) {
    case "MYTHIC": return "0 0 12px hsl(45 100% 60% / 0.8), 0 0 24px hsl(45 100% 50% / 0.4)";
    case "LEGENDARY": return "0 0 8px hsl(35 100% 55% / 0.6)";
    case "RARE": return "0 0 6px hsl(40 80% 70% / 0.4)";
    default: return "none";
  }
};

const getSolscanLink = (winner: WinnerEntry): string | null => {
  // Return tx link if we have a valid signature
  if (winner.txSignature && winner.txSignature.trim().length > 0) {
    return `https://solscan.io/tx/${winner.txSignature}`;
  }
  return null; // No valid link available - entry won't be clickable
};

interface WinnerRowProps {
  winner: WinnerEntry;
  rank?: number;
  showTrophy?: boolean;
}

const WinnerRow = ({ winner, rank, showTrophy }: WinnerRowProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const solscanLink = getSolscanLink(winner);
  const isClickable = !!solscanLink;

  const content = (
    <>
      {/* Rank/Trophy or Time */}
      <span 
        className="font-pixel text-[7px] shrink-0 w-8 flex items-center gap-0.5"
        style={{ 
          color: isHovered ? "hsl(40 40% 95%)" : "hsl(40 30% 75%)",
        }}
      >
        {showTrophy && rank === 1 ? (
          <Trophy className="w-3 h-3 text-yellow-400" />
        ) : rank ? (
          `#${rank}`
        ) : (
          winner.timestamp
        )}
      </span>

      {/* Wallet */}
      <span 
        className="font-serif-lore text-[10px] md:text-[11px] tracking-wide flex-1 text-center transition-colors duration-200"
        style={{ 
          color: isHovered ? "hsl(0 0% 100%)" : "hsl(40 40% 90%)",
        }}
      >
        {winner.wallet}
      </span>

      {/* Amount - fixed width for alignment */}
      <span 
        className="font-pixel text-[8px] md:text-[9px] shrink-0 flex items-center justify-end gap-1 transition-colors duration-200 w-[70px]"
        style={{ 
          color: isHovered ? "hsl(0 0% 100%)" : getTierColor(winner.tier),
          textShadow: isHovered ? "none" : getTierGlow(winner.tier),
        }}
      >
        <span className="tabular-nums">+{winner.amount.toLocaleString()}</span>
        {isHovered && isClickable && (
          <ExternalLink className="w-2.5 h-2.5" />
        )}
      </span>
    </>
  );

  const commonProps = {
    initial: { opacity: 0, y: -10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.4, ease: "easeOut" as const },
    className: `flex items-center justify-between gap-2 py-0.5 px-1 rounded transition-all duration-200 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`,
    style: {
      background: isHovered ? "hsl(45 40% 30% / 0.2)" : "transparent",
    },
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  if (isClickable && solscanLink) {
    return (
      <motion.a
        href={solscanLink}
        target="_blank"
        rel="noopener noreferrer"
        {...commonProps}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div {...commonProps}>
      {content}
    </motion.div>
  );
};

export const WinnersLedger = () => {
  const { liveWinners, dailyLegends, activeTab, setActiveTab } = useWinnersLedger(10);

  const currentWinners = activeTab === 'live' ? liveWinners : dailyLegends;

  return (
    <div className="hidden md:block fixed bottom-20 right-6 z-30 w-[340px] md:w-[400px]">
      <div 
        className="rounded px-3 py-2 font-pixel text-[7px] md:text-[8px]"
        style={{
          background: "#a65a3e",
          border: "1px solid hsl(20 50% 25%)",
          boxShadow: "0 4px 16px hsl(16 60% 15% / 0.4), inset 0 1px 0 hsl(20 50% 40% / 0.3)",
        }}
      >
        {/* Tab Header */}
        <div 
          className="mb-1.5 pb-1 flex items-center gap-2"
          style={{ 
            borderBottom: "1px solid hsl(20 40% 35% / 0.5)",
          }}
        >
          <span 
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ 
              background: "hsl(45 90% 70%)",
              animation: "pulse 2s ease-in-out infinite",
              boxShadow: "0 0 4px hsl(45 90% 70% / 0.5)"
            }}
          />
          
          {/* Tab Buttons - Always visible */}
          <button
            onClick={() => setActiveTab('live')}
            className="transition-all duration-200 uppercase tracking-wide"
            style={{
              color: activeTab === 'live' ? "hsl(45 90% 80%)" : "hsl(35 50% 70%)",
              textShadow: activeTab === 'live' ? "0 0 8px hsl(45 100% 60% / 0.6)" : "none",
            }}
          >
            LIVE
          </button>
          
          <span style={{ color: "hsl(20 30% 45%)" }}>|</span>
          
          <button
            onClick={() => setActiveTab('legends')}
            className="transition-all duration-200 uppercase tracking-wide"
            style={{
              color: activeTab === 'legends' ? "hsl(45 90% 80%)" : "hsl(35 50% 70%)",
              textShadow: activeTab === 'legends' ? "0 0 8px hsl(45 100% 60% / 0.6)" : "none",
            }}
          >
            LEGENDS
          </button>
        </div>

        {/* Winners List - Fixed height to match SystemLog */}
        <div 
          className="overflow-hidden space-y-0.5"
          style={{ height: "144px" }}
        >
          <AnimatePresence mode="popLayout">
            {currentWinners.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center"
              >
                <span 
                  className="font-pixel text-[9px]"
                  style={{ 
                    color: "hsl(45 70% 80%)",
                    textShadow: "0 0 6px hsl(45 80% 60% / 0.4)",
                  }}
                >
                  {activeTab === 'live' 
                    ? "AWAITING WORTHY SOULS..." 
                    : "NO LEGENDS TODAY..."}
                </span>
              </motion.div>
            ) : (
              currentWinners.map((winner, index) => (
                <WinnerRow 
                  key={winner.id} 
                  winner={winner} 
                  rank={activeTab === 'legends' ? index + 1 : undefined}
                  showTrophy={activeTab === 'legends'}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Cursor blink - matches SystemLog */}
        <div className="mt-1" style={{ color: "hsl(45 90% 75%)" }}>
          <span style={{ animation: "pulse 1s ease-in-out infinite" }}>▌</span>
        </div>
      </div>
    </div>
  );
};
