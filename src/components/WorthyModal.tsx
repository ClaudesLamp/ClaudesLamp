import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Trophy, Crown, Star } from "lucide-react";
import { toast } from "sonner";

interface WorthyModalProps {
  show: boolean;
  oracleMessage: string;
  payoutAmount: number | null;
  payoutTier: string | null;
  isJackpot: boolean;
  onClaim: () => void;
}

// X/Twitter icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const getTierColors = (tier: string | null): { bg: string; border: string; text: string; glow: string } => {
  switch (tier) {
    case 'MYTHIC':
      return {
        bg: 'linear-gradient(135deg, #1a1200 0%, #3d2900 50%, #1a1200 100%)',
        border: '#FFD700',
        text: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.6)',
      };
    case 'LEGENDARY':
      return {
        bg: 'linear-gradient(135deg, #1a0a20 0%, #2d1040 50%, #1a0a20 100%)',
        border: '#9D4EDD',
        text: '#C77DFF',
        glow: 'rgba(157, 78, 221, 0.6)',
      };
    case 'RARE':
      return {
        bg: 'linear-gradient(135deg, #0a1520 0%, #102030 50%, #0a1520 100%)',
        border: '#4EA8DE',
        text: '#7DD3FC',
        glow: 'rgba(78, 168, 222, 0.6)',
      };
    case 'COMMON':
    default:
      return {
        bg: 'linear-gradient(135deg, #1a1510 0%, #2d2520 50%, #1a1510 100%)',
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

  // Gold pixel border (thick)
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
  const bracketSize = 25;
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

  // Main payout amount (HUGE)
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

const formatPayout = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toLocaleString();
};

const getTierDisplay = (tier: string | null): { label: string; color: string; icon: React.ReactNode } => {
  switch (tier) {
    case 'MYTHIC':
      return { 
        label: 'THE MYTHIC', 
        color: 'hsl(45 100% 50%)',
        icon: <Crown className="w-5 h-5" />
      };
    case 'LEGENDARY':
      return { 
        label: 'THE LEGENDARY', 
        color: 'hsl(280 70% 60%)',
        icon: <Trophy className="w-5 h-5" />
      };
    case 'RARE':
      return { 
        label: 'THE RARE', 
        color: 'hsl(200 70% 55%)',
        icon: <Star className="w-5 h-5" />
      };
    case 'COMMON':
    default:
      return { 
        label: 'THE COMMON', 
        color: 'hsl(43 55% 50%)',
        icon: <Sparkles className="w-5 h-5" />
      };
  }
};

export const WorthyModal = ({ show, oracleMessage, payoutAmount, payoutTier, isJackpot, onClaim }: WorthyModalProps) => {
  const tierInfo = getTierDisplay(payoutTier);

  const handleShareOnX = () => {
    if (!payoutAmount) return;
    const formattedAmount = payoutAmount.toLocaleString();
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
          {/* Backdrop with scan lines */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[20] backdrop-blur-md"
            style={{
              background: isJackpot 
                ? "radial-gradient(ellipse at center, rgba(80,60,0,0.8) 0%, rgba(0,0,0,0.95) 100%)"
                : "radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)",
            }}
          />

          {/* Jackpot particles effect */}
          {isJackpot && (
            <motion.div
              className="fixed inset-0 z-[22] pointer-events-none overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: i % 2 === 0 ? 'hsl(45 100% 50%)' : 'hsl(35 100% 60%)',
                    left: `${Math.random() * 100}%`,
                    top: '-10px',
                  }}
                  animate={{
                    y: ['0vh', '110vh'],
                    x: [0, (Math.random() - 0.5) * 100],
                    rotate: [0, 360],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: 'linear',
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* Digital Artifact Modal */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
            }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              delay: 0.1 
            }}
            className="fixed inset-0 z-[25] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{
                boxShadow: isJackpot ? [
                  "0 0 30px rgba(255, 200, 0, 0.4), 0 0 60px rgba(255, 200, 0, 0.2), inset 0 0 30px rgba(255, 200, 0, 0.1)",
                  "0 0 50px rgba(255, 200, 0, 0.6), 0 0 100px rgba(255, 200, 0, 0.3), inset 0 0 50px rgba(255, 200, 0, 0.15)",
                  "0 0 30px rgba(255, 200, 0, 0.4), 0 0 60px rgba(255, 200, 0, 0.2), inset 0 0 30px rgba(255, 200, 0, 0.1)",
                ] : [
                  "0 0 15px rgba(180, 140, 80, 0.2), 0 0 30px rgba(180, 140, 80, 0.1), inset 0 0 20px rgba(180, 140, 80, 0.05)",
                  "0 0 25px rgba(180, 140, 80, 0.3), 0 0 40px rgba(180, 140, 80, 0.15), inset 0 0 30px rgba(180, 140, 80, 0.08)",
                  "0 0 15px rgba(180, 140, 80, 0.2), 0 0 30px rgba(180, 140, 80, 0.1), inset 0 0 20px rgba(180, 140, 80, 0.05)",
                ]
              }}
              transition={{
                duration: isJackpot ? 1.5 : 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="pointer-events-auto relative overflow-hidden"
              style={{
                background: isJackpot 
                  ? "linear-gradient(180deg, hsl(40 40% 15%) 0%, hsl(30 30% 8%) 100%)"
                  : "linear-gradient(180deg, hsl(30 20% 10%) 0%, hsl(25 25% 7%) 100%)",
                border: isJackpot 
                  ? "3px solid hsl(45 100% 50%)"
                  : "2px solid hsl(40 40% 35%)",
                maxWidth: "420px",
                width: "90%",
              }}
            >
              {/* Circuit pattern overlay */}
              <div 
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(90deg, hsl(40 40% 45%) 1px, transparent 1px),
                    linear-gradient(0deg, hsl(40 40% 45%) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Scan line effect */}
              <motion.div
                animate={{
                  top: ["-10%", "110%"],
                }}
                transition={{
                  duration: isJackpot ? 2 : 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute left-0 right-0 h-8 pointer-events-none"
                style={{
                  background: isJackpot 
                    ? "linear-gradient(180deg, transparent, rgba(255, 200, 0, 0.15), transparent)"
                    : "linear-gradient(180deg, transparent, rgba(180, 140, 80, 0.08), transparent)",
                }}
              />

              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: isJackpot ? "hsl(45 100% 50% / 0.7)" : "hsl(40 35% 40% / 0.5)" }} />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: isJackpot ? "hsl(45 100% 50% / 0.7)" : "hsl(40 35% 40% / 0.5)" }} />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: isJackpot ? "hsl(45 100% 50% / 0.7)" : "hsl(40 35% 40% / 0.5)" }} />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: isJackpot ? "hsl(45 100% 50% / 0.7)" : "hsl(40 35% 40% / 0.5)" }} />

              <div className="p-6 md:p-8 relative z-10">
                {/* Status indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center gap-2 mb-4"
                >
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: isJackpot ? 0.5 : 1.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: isJackpot ? "hsl(45 100% 50%)" : "hsl(120 40% 40%)" }}
                  />
                  <span className="font-mono text-[10px] tracking-widest" style={{ color: isJackpot ? "hsl(45 100% 50%)" : "hsl(120 30% 45%)" }}>
                    {isJackpot ? "🎰 MYTHIC_TRIGGERED 🎰" : "VERDICT_CONFIRMED"}
                  </span>
                </motion.div>

                {/* Tier Badge */}
                {payoutTier && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.25, type: "spring", stiffness: 300 }}
                    className="flex items-center justify-center gap-2 mb-3"
                  >
                    <div 
                      className="flex items-center gap-2 px-3 py-1 rounded-sm"
                      style={{ 
                        background: `${tierInfo.color}22`,
                        border: `1px solid ${tierInfo.color}`,
                        color: tierInfo.color,
                      }}
                    >
                      {tierInfo.icon}
                      <span className="font-pixel text-xs tracking-wider">{tierInfo.label}</span>
                    </div>
                  </motion.div>
                )}

                {/* Verdict Header */}
                <motion.h2
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-pixel text-center mb-2"
                  style={{
                    color: isJackpot ? "hsl(45 100% 50%)" : "hsl(43 55% 50%)",
                    fontSize: "clamp(1.75rem, 6vw, 2.5rem)",
                    textShadow: isJackpot 
                      ? "0 0 20px rgba(255, 200, 0, 0.6), 0 0 40px rgba(255, 200, 0, 0.4)"
                      : "0 0 15px rgba(180, 140, 80, 0.4), 0 0 30px rgba(180, 140, 80, 0.2)",
                    letterSpacing: "0.15em",
                  }}
                >
                  WORTHY
                </motion.h2>

                {/* Payout Amount */}
                {payoutAmount && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
                    className="text-center mb-2"
                  >
                    <motion.span
                      animate={isJackpot ? { 
                        scale: [1, 1.05, 1],
                        textShadow: [
                          "0 0 20px rgba(255, 200, 0, 0.5)",
                          "0 0 40px rgba(255, 200, 0, 0.8)",
                          "0 0 20px rgba(255, 200, 0, 0.5)",
                        ]
                      } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="font-pixel"
                      style={{
                        color: tierInfo.color,
                        fontSize: isJackpot ? "clamp(2rem, 8vw, 3rem)" : "clamp(1.5rem, 5vw, 2rem)",
                      }}
                    >
                      +{formatPayout(payoutAmount)} $RUB
                    </motion.span>
                  </motion.div>
                )}

                {/* Decorative line */}
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="mx-auto mb-5 h-px"
                  style={{
                    width: "80%",
                    background: isJackpot 
                      ? "linear-gradient(90deg, transparent, hsl(45 100% 50%), transparent)"
                      : "linear-gradient(90deg, transparent, hsl(40 40% 40%), transparent)",
                  }}
                />

                {/* Oracle Message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6 p-4"
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    border: `1px solid ${isJackpot ? 'hsl(45 80% 35%)' : 'hsl(40 30% 28%)'}`,
                  }}
                >
                  <p
                    className="font-mono text-center"
                    style={{
                      color: "hsl(35 25% 60%)",
                      fontSize: "clamp(0.8rem, 2.5vw, 0.95rem)",
                      lineHeight: 1.6,
                    }}
                  >
                    &gt; {oracleMessage || "You have pleased the Oracle."}
                  </p>
                </motion.div>

                {/* Claim info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center mb-4"
                >
                  <span 
                    className="font-mono text-xs tracking-wider"
                    style={{ color: "hsl(40 30% 40%)" }}
                  >
                    [ TREASURY_ALLOCATION_READY ]
                  </span>
                </motion.div>

                {/* Claim Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: isJackpot 
                      ? "0 0 30px rgba(255, 200, 0, 0.5)"
                      : "0 0 20px rgba(180, 140, 80, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClaim}
                  className="w-full font-pixel py-3 px-6 flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    background: isJackpot 
                      ? "linear-gradient(180deg, hsl(45 80% 45%) 0%, hsl(40 70% 35%) 100%)"
                      : "linear-gradient(180deg, hsl(40 40% 35%) 0%, hsl(35 35% 28%) 100%)",
                    color: isJackpot ? "hsl(40 20% 10%)" : "hsl(40 20% 85%)",
                    border: isJackpot ? "1px solid hsl(45 100% 55%)" : "1px solid hsl(40 45% 45%)",
                    fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)",
                    letterSpacing: "0.1em",
                  }}
                >
                  CLAIM_REWARD <ArrowRight className="w-4 h-4" />
                </motion.button>

                {/* Social Share Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="mt-5"
                >
                  {/* Share Label */}
                  <p 
                    className="font-pixel text-center mb-3 text-xs tracking-widest"
                    style={{ color: "hsl(40 30% 50%)" }}
                  >
                    SHARE ON:
                  </p>

                  {/* Share Buttons Row */}
                  <div className="flex gap-3 mb-3">
                    {/* X Profile Button */}
                    <button
                      onClick={handleShareOnX}
                      className="flex-1 font-pixel py-2.5 px-4 flex items-center justify-center transition-all duration-200 hover:bg-[rgba(255,215,0,0.2)]"
                      style={{
                        background: "transparent",
                        color: "#FFD700",
                        border: "2px solid #FFD700",
                        fontSize: "clamp(0.6rem, 2vw, 0.7rem)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      X PROFILE
                    </button>

                    {/* X Community Button */}
                    <button
                      onClick={handleShareCommunity}
                      className="flex-1 font-pixel py-2.5 px-4 flex items-center justify-center transition-all duration-200 hover:bg-[rgba(255,215,0,0.2)]"
                      style={{
                        background: "transparent",
                        color: "#FFD700",
                        border: "2px solid #FFD700",
                        fontSize: "clamp(0.6rem, 2vw, 0.7rem)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      X COMMUNITY
                    </button>
                  </div>

                  {/* Download Card Button */}
                  <button
                    onClick={handleDownloadCard}
                    className="w-full font-pixel py-2 px-4 flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[rgba(180,140,80,0.2)]"
                    style={{
                      background: "transparent",
                      color: "hsl(40 50% 60%)",
                      border: "1px solid hsl(40 40% 40%)",
                      fontSize: "clamp(0.55rem, 1.8vw, 0.65rem)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    📥 DOWNLOAD CARD
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};