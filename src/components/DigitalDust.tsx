import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

export const DigitalDust = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const createParticle = (): Particle => ({
      id: Date.now() + Math.random(),
      x: Math.random() * 100,
      size: Math.random() * 1.4 + 2,
      duration: Math.random() * 12 + 16,
      delay: 0,
    });

    // Initial particles - subtle amount
    const initial = Array.from({ length: 22 }, () => ({
      ...createParticle(),
      delay: Math.random() * 8,
    }));
    setParticles(initial);

    // Spawn new particles gently
    const interval = setInterval(() => {
      setParticles(prev => {
        const filtered = prev.length > 36 ? prev.slice(-28) : prev;
        return [...filtered, createParticle()];
      });
    }, 650);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[7]">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              bottom: -20,
              width: particle.size,
              height: particle.size,
            }}
            initial={{ 
              y: 0, 
              opacity: 0,
              scale: 0 
            }}
            animate={{ 
              y: "-100vh", 
              opacity: [0, 0.95, 0.75, 0.45, 0],
              scale: [0.5, 1.05, 0.9, 0.45],
              x: [0, Math.sin(particle.id) * 14, Math.cos(particle.id) * -10, 0]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: "linear",
            }}
            onAnimationComplete={() => {
              setParticles(prev => prev.filter(p => p.id !== particle.id));
            }}
          >
            <div 
              className="w-full h-full rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(var(--cream) / 0.95) 0%, hsl(var(--cream) / 0.55) 45%, transparent 70%)",
                border: "1px solid hsl(var(--foreground) / 0.18)",
                boxShadow: `0 0 ${particle.size * 6}px hsl(var(--foreground) / 0.25), 0 0 ${particle.size * 14}px hsl(var(--cream) / 0.25)`,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
