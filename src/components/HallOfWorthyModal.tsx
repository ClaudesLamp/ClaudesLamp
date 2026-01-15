import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/core/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useHallOfWorthy, WorthyEntry } from "@/hooks/useHallOfWorthy";
import { X, ExternalLink } from "lucide-react";

interface HallOfWorthyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getTierStyles = (tier: string) => {
  switch (tier?.toUpperCase()) {
    case "MYTHIC":
      return {
        bg: "bg-gradient-to-br from-yellow-900/40 to-amber-800/30",
        border: "border-yellow-500/60",
        glow: "shadow-[0_0_20px_rgba(255,215,0,0.4)]",
        text: "text-yellow-400",
        badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
      };
    case "LEGENDARY":
      return {
        bg: "bg-gradient-to-br from-purple-900/40 to-violet-800/30",
        border: "border-purple-500/60",
        glow: "shadow-[0_0_15px_rgba(157,78,221,0.3)]",
        text: "text-purple-400",
        badge: "bg-purple-500/20 text-purple-300 border-purple-500/50",
      };
    case "RARE":
      return {
        bg: "bg-gradient-to-br from-blue-900/40 to-cyan-800/30",
        border: "border-blue-500/60",
        glow: "shadow-[0_0_12px_rgba(78,168,222,0.3)]",
        text: "text-blue-400",
        badge: "bg-blue-500/20 text-blue-300 border-blue-500/50",
      };
    default: // COMMON
      return {
        bg: "bg-gradient-to-br from-amber-900/30 to-stone-800/30",
        border: "border-amber-700/50",
        glow: "shadow-[0_0_8px_rgba(184,134,11,0.2)]",
        text: "text-amber-600",
        badge: "bg-amber-700/20 text-amber-400 border-amber-600/50",
      };
  }
};

const WorthyCard = ({ entry }: { entry: WorthyEntry }) => {
  const styles = getTierStyles(entry.payout_tier);
  const date = new Date(entry.created_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleClick = () => {
    if (entry.tx_signature) {
      window.open(`https://solscan.io/tx/${entry.tx_signature}`, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={handleClick}
      className={`
        relative cursor-pointer p-2 md:p-4 rounded-lg border
        ${styles.bg} ${styles.border} ${styles.glow}
        transition-all duration-200 hover:brightness-110
        backdrop-blur-sm
      `}
    >
      {/* Tier Badge */}
      <div className={`inline-block px-1.5 md:px-2 py-0.5 rounded border text-[8px] md:text-[10px] font-mono tracking-wider mb-1 md:mb-2 ${styles.badge}`}>
        {entry.payout_tier || "COMMON"}
      </div>

      {/* Payout Amount */}
      <div className={`text-base md:text-xl font-bold ${styles.text} tabular-nums`}>
        +{entry.payout_amount?.toLocaleString() || 0}
      </div>
      <div className="text-[10px] md:text-xs text-muted-foreground/70 font-mono mb-1 md:mb-2">$RUB</div>

      {/* Wallet */}
      <div className="text-[10px] md:text-sm font-mono text-foreground/80 mb-0.5 md:mb-1">
        {entry.wallet_trunc}
      </div>

      {/* Date */}
      <div className="text-[8px] md:text-[10px] text-muted-foreground/60 font-mono">
        {formattedDate}
      </div>

      {/* External Link Icon */}
      <ExternalLink className="absolute top-2 md:top-3 right-2 md:right-3 w-2.5 h-2.5 md:w-3 md:h-3 text-muted-foreground/40" />

      {/* Jackpot indicator */}
      {entry.is_jackpot && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 animate-pulse" />
      )}
    </motion.div>
  );
};

export const HallOfWorthyModal = ({ open, onOpenChange }: HallOfWorthyModalProps) => {
  const { data: entries, isLoading, error } = useHallOfWorthy();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] md:w-auto max-h-[85vh] md:max-h-[80vh] bg-[#1a1210]/95 border-primary/30 backdrop-blur-xl overflow-hidden p-0 [&>button]:hidden">
        {/* Custom Header */}
        <div className="relative px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-primary/20">
          {/* Circuit pattern overlay */}
          <div 
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD700' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <DialogHeader className="relative">
            <DialogTitle className="text-center font-mono text-lg md:text-2xl tracking-[0.2em] md:tracking-[0.3em] text-primary pr-8 md:pr-0">
              HALL OF THE WORTHY
            </DialogTitle>
            <p className="text-center text-[10px] md:text-xs text-muted-foreground/60 font-mono tracking-wider mt-1">
              CLAIMED BLESSINGS FROM THE LAMP
            </p>
          </DialogHeader>

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 md:top-4 md:right-4 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded border border-primary/30 text-primary/60 hover:text-primary hover:border-primary/60 transition-colors z-10"
          >
            <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(85vh-100px)] md:max-h-[calc(80vh-100px)]">
          {isLoading && (
            <div className="text-center py-12">
              <div className="text-primary/60 font-mono text-sm animate-pulse">
                LOADING WORTHY SOULS...
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-destructive/60 font-mono text-sm">
                FAILED TO RETRIEVE RECORDS
              </div>
            </div>
          )}

          {!isLoading && !error && entries?.length === 0 && (
            <div className="text-center py-12">
              <div className="text-primary/40 font-mono text-sm tracking-wider">
                NO WORTHY SOULS YET...
              </div>
              <div className="text-muted-foreground/40 font-mono text-xs mt-2">
                BE THE FIRST TO CLAIM YOUR BLESSING
              </div>
            </div>
          )}

          {!isLoading && !error && entries && entries.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
              <AnimatePresence>
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <WorthyCard entry={entry} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer stats */}
        {entries && entries.length > 0 && (
          <div className="px-4 md:px-6 py-2 md:py-3 border-t border-primary/20 bg-[#1a1210]/50">
            <div className="flex justify-between text-[10px] md:text-xs font-mono text-muted-foreground/60">
              <span>TOTAL: {entries.length}</span>
              <span>
                BLESSED: {entries.reduce((sum, e) => sum + (e.payout_amount || 0), 0).toLocaleString()} $RUB
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
