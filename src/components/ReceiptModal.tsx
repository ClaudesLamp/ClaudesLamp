import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface ReceiptModalProps {
  show: boolean;
  walletAddress: string;
  txId: string;
  payoutAmount: number | null;
  payoutTier: string | null;
  claimFailed?: boolean;
  isRetrying?: boolean;
  onClose: () => void;
  onRetry?: () => void;
}

const getTierColors = (tier: string | null): { border: string; text: string; glow: string } => {
  switch (tier) {
    case 'MYTHIC':
      return {
        border: '#FFD700',
        text: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.6)',
      };
    case 'LEGENDARY':
      return {
        border: '#9D4EDD',
        text: '#C77DFF',
        glow: 'rgba(157, 78, 221, 0.6)',
      };
    case 'RARE':
      return {
        border: '#4EA8DE',
        text: '#7DD3FC',
        glow: 'rgba(78, 168, 222, 0.6)',
      };
    case 'COMMON':
    default:
      return {
        border: '#B8860B',
        text: '#DAA520',
        glow: 'rgba(218, 165, 32, 0.5)',
      };
  }
};

const generateLootCard = async (payoutAmount: number, payoutTier: string | null): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const width = 600;
  const height = 400;
  canvas.width = width;
  canvas.height = height;

  const tierColors = getTierColors(payoutTier);

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#2a1810');
  gradient.addColorStop(0.5, '#3d2820');
  gradient.addColorStop(1, '#2a1810');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Circuit grid pattern
  ctx.strokeStyle = 'rgba(180, 140, 80, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Gold pixel border
  ctx.strokeStyle = tierColors.border;
  ctx.lineWidth = 8;
  ctx.strokeRect(12, 12, width - 24, height - 24);

  // Inner border
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Corner brackets
  ctx.strokeStyle = tierColors.border;
  ctx.lineWidth = 3;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(30, 55);
  ctx.lineTo(30, 30);
  ctx.lineTo(55, 30);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(width - 55, 30);
  ctx.lineTo(width - 30, 30);
  ctx.lineTo(width - 30, 55);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(30, height - 55);
  ctx.lineTo(30, height - 30);
  ctx.lineTo(55, height - 30);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(width - 55, height - 30);
  ctx.lineTo(width - 30, height - 30);
  ctx.lineTo(width - 30, height - 55);
  ctx.stroke();

  // "VERDICT: WORTHY" text
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = tierColors.text;
  ctx.shadowColor = tierColors.glow;
  ctx.shadowBlur = 15;
  ctx.fillText('VERDICT: WORTHY', width / 2, 100);
  ctx.shadowBlur = 0;

  // Tier label
  const tierLabel = payoutTier ? `[ ${payoutTier} ]` : '[ COMMON ]';
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = tierColors.text;
  ctx.globalAlpha = 0.8;
  ctx.fillText(tierLabel, width / 2, 130);
  ctx.globalAlpha = 1;

  // Main payout amount
  const formattedAmount = payoutAmount.toLocaleString();
  ctx.font = 'bold 56px monospace';
  ctx.fillStyle = tierColors.text;
  ctx.shadowColor = tierColors.glow;
  ctx.shadowBlur = 25;
  ctx.fillText(`+${formattedAmount}`, width / 2, 210);
  ctx.font = 'bold 32px monospace';
  ctx.fillText('$RUB', width / 2, 255);
  ctx.shadowBlur = 0;

  // "THE ORACLE HAS SPOKEN"
  ctx.font = 'italic 18px monospace';
  ctx.fillStyle = 'rgba(218, 165, 32, 0.7)';
  ctx.fillText('THE ORACLE HAS SPOKEN', width / 2, 310);

  // Footer bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(12, height - 50, width - 24, 38);

  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(218, 165, 32, 0.8)';
  ctx.fillText('claudeslamp.fun', 35, height - 26);

  ctx.textAlign = 'right';
  ctx.fillText('@claudeslamprub', width - 35, height - 26);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
};

const downloadLootCard = async (payoutAmount: number, payoutTier: string | null): Promise<void> => {
  try {
    const blob = await generateLootCard(payoutAmount, payoutTier);
    
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `claudeslamp-${payoutTier?.toLowerCase() || 'common'}-${payoutAmount}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Loot card downloaded!", { duration: 2000 });
    }
  } catch (error) {
    console.error('Download error:', error);
    toast.error("Failed to download image", { duration: 3000 });
  }
};

export const ReceiptModal = ({ show, walletAddress, txId, payoutAmount, payoutTier, claimFailed, isRetrying, onClose, onRetry }: ReceiptModalProps) => {
  const currentDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const truncatedWallet = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "UNKNOWN";

  const formattedAmount = payoutAmount?.toLocaleString() || "0";
  const cleanTxId = (txId || "").trim();
  const hasConfirmedTx = cleanTxId.length > 20 && !cleanTxId.includes("...");

  const handleShareOnX = () => {
    const tweetText = encodeURIComponent(
      `I survived the judgement. Claude's Lamp granted me ${formattedAmount} $RUB. Are you worthy? @claudeslamprub $RUB`
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  const handleShareCommunity = () => {
    window.open('https://x.com/i/communities/2011592243715486003', '_blank');
  };

  const handleDownloadCard = () => {
    if (!payoutAmount) return;
    downloadLootCard(payoutAmount, payoutTier);
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop - clickable to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[20] backdrop-blur-md cursor-pointer"
            style={{
              background: "radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)",
            }}
          />

          {/* Terminal Receipt Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 25,
            }}
            className="fixed inset-0 z-[25] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 15px rgba(180, 140, 80, 0.15), 0 0 30px rgba(180, 140, 80, 0.08)",
                  "0 0 20px rgba(180, 140, 80, 0.2), 0 0 40px rgba(180, 140, 80, 0.1)",
                  "0 0 15px rgba(180, 140, 80, 0.15), 0 0 30px rgba(180, 140, 80, 0.08)",
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="pointer-events-auto relative overflow-hidden"
              style={{
                maxWidth: "380px",
                width: "90%",
                background: "linear-gradient(180deg, hsl(30 20% 8%) 0%, hsl(25 25% 5%) 100%)",
                border: "1px solid hsl(35 40% 30%)",
              }}
            >
              {/* Scan line animation */}
              <motion.div
                animate={{
                  top: ["-5%", "105%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute left-0 right-0 h-6 pointer-events-none z-20"
                style={{
                  background: "linear-gradient(180deg, transparent, rgba(180, 140, 80, 0.06), transparent)",
                }}
              />

              {/* CRT curve effect */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
                }}
              />

              {/* Terminal header bar */}
              <div 
                className="flex items-center justify-between px-4 py-2"
                style={{
                  background: "hsl(25 30% 12%)",
                  borderBottom: "1px solid hsl(35 35% 25%)",
                }}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: "hsl(43 70% 50%)" }}
                  />
                  <span className="font-mono text-[10px] tracking-widest" style={{ color: "hsl(43 50% 55%)" }}>
                    LAMP_TERMINAL
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 transition-colors hover:bg-white/10 rounded"
                  style={{ color: "hsl(43 50% 55%)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Terminal content */}
              <div className="p-5 relative z-10">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-4"
                >
                  <h2 
                    className="font-mono text-sm tracking-[0.2em]"
                    style={{ color: "hsl(43 60% 50%)" }}
                  >
                    ═══ TRANSFER COMPLETE ═══
                  </h2>
                </motion.div>

                {/* Receipt details */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="font-mono text-xs space-y-3 mb-5"
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid hsl(35 30% 20%)",
                    padding: "16px",
                  }}
                >
                  <div className="flex justify-between" style={{ color: "hsl(35 25% 55%)" }}>
                    <span className="opacity-70">TIMESTAMP:</span>
                    <span>{currentDate}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: "hsl(35 25% 55%)" }}>
                    <span className="opacity-70">RECIPIENT:</span>
                    <span style={{ color: "hsl(43 60% 55%)" }}>{truncatedWallet}</span>
                  </div>
                  <div 
                    className="h-px my-2"
                    style={{ background: "repeating-linear-gradient(90deg, hsl(35 30% 30%) 0, hsl(35 30% 30%) 4px, transparent 4px, transparent 8px)" }}
                  />
                  <div className="flex justify-between">
                    <span className="opacity-70" style={{ color: "hsl(35 25% 55%)" }}>AMOUNT:</span>
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="font-bold"
                      style={{ color: "hsl(43 70% 55%)" }}
                    >
                      +{formattedAmount} $RUB
                    </motion.span>
                  </div>
                  <div className="flex justify-between" style={{ color: "hsl(35 25% 55%)" }}>
                    <span className="opacity-70">GAS_FEE:</span>
                    <span style={{ color: "hsl(43 50% 45%)" }}>0.00 SOL [COVERED]</span>
                  </div>
                </motion.div>

                {/* Status badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  className="text-center mb-4"
                >
                  <motion.span 
                    animate={{
                      textShadow: claimFailed ? [
                        "0 0 8px rgba(220, 38, 38, 0.4)",
                        "0 0 15px rgba(220, 38, 38, 0.6)",
                        "0 0 8px rgba(220, 38, 38, 0.4)",
                      ] : [
                        "0 0 8px rgba(180, 140, 80, 0.4)",
                        "0 0 15px rgba(180, 140, 80, 0.6)",
                        "0 0 8px rgba(180, 140, 80, 0.4)",
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="font-mono text-sm font-bold tracking-wider"
                    style={{ 
                      color: claimFailed ? "hsl(0 70% 50%)" : "hsl(43 65% 50%)",
                    }}
                  >
                    {hasConfirmedTx 
                      ? '▓▓▓▓▓ CONFIRMED ▓▓▓▓▓' 
                      : claimFailed 
                        ? '▓▓▓ TRANSFER FAILED ▓▓▓'
                        : isRetrying
                          ? '▓▓▓ RETRYING... ▓▓▓'
                          : '▓▓▓ PENDING CLAIM ▓▓▓'}
                  </motion.span>
                </motion.div>

                {/* TX section with retry button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-center p-2"
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                    border: claimFailed ? "1px dashed hsl(0 50% 35%)" : "1px dashed hsl(35 25% 25%)",
                  }}
                >
                  {hasConfirmedTx ? (
                    <a
                      href={`https://solscan.io/tx/${cleanTxId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] hover:underline cursor-pointer transition-colors"
                      style={{ color: "hsl(43 50% 55%)" }}
                    >
                      TX_ID: {cleanTxId.slice(0, 8)}...{cleanTxId.slice(-8)} ↗
                    </a>
                  ) : claimFailed && onRetry ? (
                    <motion.button
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(220, 38, 38, 0.2)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onRetry}
                      disabled={isRetrying}
                      className="font-mono text-xs px-4 py-2 transition-all disabled:opacity-50"
                      style={{
                        color: "hsl(43 70% 55%)",
                        border: "1px solid hsl(43 50% 40%)",
                        background: "transparent",
                      }}
                    >
                      {isRetrying ? '⏳ RETRYING...' : '🔄 RETRY TRANSFER'}
                    </motion.button>
                  ) : (
                    <span className="font-mono text-[10px]" style={{ color: "hsl(35 30% 45%)" }}>
                      ON-CHAIN TX: {isRetrying ? 'SENDING...' : 'PENDING'}
                    </span>
                  )}
                </motion.div>

                {/* Share Buttons */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="mt-4"
                >
                  <p 
                    className="font-pixel text-center mb-2 text-[9px] tracking-widest"
                    style={{ color: "hsl(35 30% 45%)" }}
                  >
                    SHARE ON:
                  </p>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={handleShareOnX}
                      className="flex-1 font-pixel py-1.5 px-3 flex items-center justify-center transition-all duration-200 hover:bg-[rgba(255,215,0,0.15)]"
                      style={{
                        background: "transparent",
                        color: "hsl(43 60% 55%)",
                        border: "1px solid hsl(43 50% 40%)",
                        fontSize: "9px",
                        letterSpacing: "0.05em",
                      }}
                    >
                      X PROFILE
                    </button>
                    <button
                      onClick={handleShareCommunity}
                      className="flex-1 font-pixel py-1.5 px-3 flex items-center justify-center transition-all duration-200 hover:bg-[rgba(255,215,0,0.15)]"
                      style={{
                        background: "transparent",
                        color: "hsl(43 60% 55%)",
                        border: "1px solid hsl(43 50% 40%)",
                        fontSize: "9px",
                        letterSpacing: "0.05em",
                      }}
                    >
                      X COMMUNITY
                    </button>
                  </div>
                  {/* Download Card Button */}
                  <button
                    onClick={handleDownloadCard}
                    className="w-full font-pixel py-1.5 px-3 flex items-center justify-center gap-1 transition-all duration-200 hover:bg-[rgba(180,140,80,0.15)]"
                    style={{
                      background: "transparent",
                      color: "hsl(35 40% 50%)",
                      border: "1px solid hsl(35 30% 35%)",
                      fontSize: "8px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    📥 DOWNLOAD CARD
                  </button>
                </motion.div>

                {/* Footer blinking cursor */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-3 text-center"
                >
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="font-mono text-xs"
                    style={{ color: "hsl(43 50% 45%)" }}
                  >
                    █
                  </motion.span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
