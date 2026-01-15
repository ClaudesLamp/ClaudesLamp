import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import voxelLamp from "@/assets/voxel-lamp.png";
import { GoldParticles } from "./GoldParticles";
import { LampVapor } from "./LampVapor";
import { cn } from "@/lib/utils";

interface OracleLampProps {
  onClick: () => void;
  isGlowing?: boolean;
  isJudging?: boolean;
  disabled?: boolean;
}

export const OracleLamp = ({ 
  onClick, 
  isGlowing = false, 
  isJudging = false,
  disabled = false 
}: OracleLampProps) => {
  const [isShaking, setIsShaking] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const handleClick = useCallback(() => {
    if (disabled || isShaking) return;
    
    setIsShaking(true);
    setShowParticles(true);
    
    setTimeout(() => {
      setIsShaking(false);
      onClick();
    }, 600);
  }, [disabled, isShaking, onClick]);

  const handleParticlesComplete = useCallback(() => {
    setShowParticles(false);
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      {/* Breathing Radial Glow Behind Lamp */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 0.85, 0.6],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          className="w-[280px] h-[280px] md:w-[360px] md:h-[360px] lg:w-[440px] lg:h-[440px] rounded-full"
          style={{
            background: `radial-gradient(
              circle at center,
              hsl(43 90% 60% / 0.5) 0%,
              hsl(45 100% 65% / 0.4) 25%,
              hsl(43 80% 55% / 0.2) 50%,
              hsl(43 80% 55% / 0.05) 70%,
              transparent 85%
            )`,
            filter: "blur(25px)",
            boxShadow: "0 0 60px hsl(43 80% 55% / 0.3)",
          }}
        />
      </motion.div>

      {/* Secondary Pulse Glow */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{
          scale: [1.1, 1.3, 1.1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <div
          className="w-[250px] h-[250px] md:w-[350px] md:h-[350px] lg:w-[450px] lg:h-[450px] rounded-full"
          style={{
            background: `radial-gradient(
              circle at center,
              hsl(16 45% 45% / 0.3) 0%,
              hsl(43 80% 55% / 0.15) 40%,
              transparent 70%
            )`,
            filter: "blur(50px)",
          }}
        />
      </motion.div>

      {/* Particles Container */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <GoldParticles trigger={showParticles} onComplete={handleParticlesComplete} />
      </div>

      {/* Vapor/Smoke Effect - positioned at lamp spout */}
      <div className="absolute top-[-5%] left-[-8%] md:left-[-3%] z-20">
        <LampVapor isActive={isGlowing} />
      </div>

      {/* The Lamp */}
      <motion.div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
        className={cn(
          "oracle-lamp-button relative z-10",
          disabled && "cursor-not-allowed opacity-60"
        )}
        style={{ WebkitTapHighlightColor: "transparent", userSelect: "none", WebkitUserSelect: "none" }}
        animate={
          isShaking
            ? { 
                x: [0, -8, 8, -8, 8, -4, 4, 0],
                rotate: [0, -3, 3, -3, 3, -1, 1, 0]
              }
            : { y: [0, -15, 0] }
        }
        transition={
          isShaking
            ? { duration: 0.6, ease: "easeInOut" }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
        whileHover={!disabled ? { scale: 1.05 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
      >
        <motion.img
          src={voxelLamp}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          alt="Claude's Magic Lamp"
          className={cn(
            "w-64 h-auto md:w-80 lg:w-96 select-none relative",
            isGlowing && "lamp-glow",
            isJudging && "lamp-glow-intense"
          )}
          animate={
            isJudging
              ? {
                  filter: [
                    "drop-shadow(0 0 30px hsl(45 100% 70% / 0.6))",
                    "drop-shadow(0 0 60px hsl(45 100% 70% / 0.9)) drop-shadow(0 0 100px hsl(43 80% 55% / 0.5))",
                    "drop-shadow(0 0 30px hsl(45 100% 70% / 0.6))",
                  ],
                }
              : undefined
          }
          transition={
            isJudging
              ? { duration: 1, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        />
      </motion.div>
    </div>
  );
};
