import { motion } from "framer-motion";

interface LampVaporProps {
  isActive?: boolean;
}

export const LampVapor = ({ isActive = true }: LampVaporProps) => {
  if (!isActive) return null;

  return (
    <div className="vapor">
      {Array.from({ length: 20 }, (_, i) => (
        <span
          key={i}
          style={{ "--i": i + 1 } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
