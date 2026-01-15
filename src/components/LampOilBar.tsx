import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/core/tooltip";
import { useTreasuryStats, formatNumber, getOilColor } from "@/hooks/useTreasuryStats";

export const LampOilBar = () => {
  const stats = useTreasuryStats();
  const colorScheme = getOilColor(stats.percentage);
  const isCritical = stats.percentage < 20;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full cursor-pointer">
            {/* Container */}
            <div 
              className="relative h-8 rounded-sm overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #2A1810 0%, #1A0F0A 100%)',
                border: '4px solid hsl(var(--terracotta))',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)'
              }}
            >
              {/* Fill Bar */}
              <motion.div
                className="absolute inset-0 origin-left"
                initial={false}
                animate={{ 
                  scaleX: stats.isLoading ? 1 : stats.percentage / 100,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  background: `linear-gradient(180deg, 
                    ${colorScheme.main} 0%, 
                    ${colorScheme.main}CC 30%,
                    ${colorScheme.main}99 50%,
                    ${colorScheme.main}CC 70%,
                    ${colorScheme.main} 100%
                  )`,
                  boxShadow: `0 0 20px ${colorScheme.glow}`,
                }}
              >
                {/* Liquid Shine Effect */}
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    background: `linear-gradient(
                      90deg, 
                      transparent 0%, 
                      rgba(255,255,255,0.3) 45%,
                      rgba(255,255,255,0.5) 50%,
                      rgba(255,255,255,0.3) 55%,
                      transparent 100%
                    )`,
                    animation: 'shine 3s ease-in-out infinite',
                  }}
                />
                
                {/* Bubble Effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div 
                    className="absolute w-1 h-1 rounded-full bg-white/40"
                    style={{ 
                      left: '20%', 
                      bottom: '20%',
                      animation: 'bubble 4s ease-in-out infinite'
                    }}
                  />
                  <div 
                    className="absolute w-1.5 h-1.5 rounded-full bg-white/30"
                    style={{ 
                      left: '60%', 
                      bottom: '30%',
                      animation: 'bubble 5s ease-in-out infinite 1s'
                    }}
                  />
                  <div 
                    className="absolute w-0.5 h-0.5 rounded-full bg-white/50"
                    style={{ 
                      left: '80%', 
                      bottom: '15%',
                      animation: 'bubble 3s ease-in-out infinite 0.5s'
                    }}
                  />
                </div>
              </motion.div>

              {/* Critical Pulsing Overlay */}
              {isCritical && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    background: `linear-gradient(90deg, ${colorScheme.main}40 0%, transparent 50%)`,
                  }}
                />
              )}

              {/* Text Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span 
                  className="font-pixel text-[10px] md:text-xs tracking-wider z-10"
                  style={{
                    color: '#FFF5E6',
                    textShadow: '0 0 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)',
                    letterSpacing: '0.1em'
                  }}
                >
                  {stats.isLoading ? (
                    'LOADING...'
                  ) : (
                    <>LAMP OIL: {stats.percentage.toFixed(1)}%</>
                  )}
                </span>
              </div>

              {/* Pixel Border Effect - Top Highlight */}
              <div 
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>
        </TooltipTrigger>
        
        <TooltipContent 
          className="font-pixel text-[10px] bg-background border-2 border-terracotta px-3 py-2"
          style={{
            background: 'linear-gradient(180deg, #2A1810 0%, #1A0F0A 100%)',
          }}
        >
          <p className="text-cream">
            Current Reserves: <span className="text-gold">{formatNumber(stats.treasuryBalance)}</span> Tokens
          </p>
          {!stats.isLive && (
            <p className="text-cream/50 text-[8px] mt-1">
              (Fallback data - configure token addresses)
            </p>
          )}
        </TooltipContent>
      </Tooltip>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes bubble {
          0%, 100% { 
            transform: translateY(0) scale(1); 
            opacity: 0.4;
          }
          50% { 
            transform: translateY(-4px) scale(1.2); 
            opacity: 0.7;
          }
        }
      `}</style>
    </TooltipProvider>
  );
};
