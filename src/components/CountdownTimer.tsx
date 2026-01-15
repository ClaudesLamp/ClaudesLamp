import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  targetTime: number;
  onComplete: () => void;
}

export const CountdownTimer = ({ targetTime, onComplete }: CountdownTimerProps) => {
  const calculateTimeLeft = (target: number) => {
    const now = Date.now();
    const difference = target - now;

    if (difference <= 0) {
      return { minutes: 0, seconds: 0 };
    }

    return {
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  // Initialize with calculated time immediately to avoid showing 00:00
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>(() => 
    calculateTimeLeft(targetTime)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetTime);
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        clearInterval(timer);
        onComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime, onComplete]);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center justify-center"
    >
      <div className="flex items-center gap-1 font-pixel text-xl md:text-2xl text-terracotta">
        <motion.span
          key={timeLeft.minutes}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-block min-w-[2ch] text-center"
        >
          {formatTime(timeLeft.minutes)}
        </motion.span>
        <span className="animate-pulse">:</span>
        <motion.span
          key={timeLeft.seconds}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-block min-w-[2ch] text-center"
        >
          {formatTime(timeLeft.seconds)}
        </motion.span>
      </div>
    </motion.div>
  );
};
