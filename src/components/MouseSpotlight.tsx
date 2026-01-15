import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export const MouseSpotlight = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      x.set(e.clientX);
      y.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [x, y, isVisible]);

  return (
    <motion.div
      className="fixed pointer-events-none z-0"
      style={{
        x,
        y,
        width: 400,
        height: 400,
        marginLeft: -200,
        marginTop: -200,
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `radial-gradient(
            circle at center,
            hsl(43 80% 55% / 0.12) 0%,
            hsl(43 80% 55% / 0.06) 30%,
            hsl(43 80% 55% / 0.02) 50%,
            transparent 70%
          )`,
          filter: "blur(20px)",
        }}
      />
    </motion.div>
  );
};
