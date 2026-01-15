import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GoldParticle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
}

export const GoldRain = ({ active }: { active: boolean }) => {
  const [particles, setParticles] = useState<GoldParticle[]>([]);

  useEffect(() => {
    if (active) {
      const newParticles: GoldParticle[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
        size: 4 + Math.random() * 8,
        rotation: Math.random() * 360,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-[15] overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ 
                y: -20, 
                x: `${particle.x}vw`,
                opacity: 0,
                rotate: particle.rotation 
              }}
              animate={{ 
                y: "110vh", 
                opacity: [0, 1, 1, 0.5, 0],
                rotate: particle.rotation + 180
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: "linear",
              }}
              style={{
                position: "absolute",
                width: particle.size,
                height: particle.size,
                background: `linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #F3A928 100%)`,
                boxShadow: "0 0 6px rgba(255, 215, 0, 0.8), 0 0 12px rgba(255, 215, 0, 0.4)",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};
