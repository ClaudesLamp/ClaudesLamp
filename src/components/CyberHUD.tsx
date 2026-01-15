export const CyberHUD = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[8]">
      {/* Vertical Rulers - Left (hidden on mobile) */}
      <div 
        className="absolute left-8 top-0 bottom-0 w-px hidden md:block"
        style={{
          background: "repeating-linear-gradient(to bottom, hsl(var(--terracotta) / 0.2) 0px, hsl(var(--terracotta) / 0.2) 8px, transparent 8px, transparent 16px)",
        }}
      />
      <div 
        className="absolute left-12 top-0 bottom-0 w-px hidden md:block"
        style={{
          background: "repeating-linear-gradient(to bottom, hsl(var(--terracotta) / 0.1) 0px, hsl(var(--terracotta) / 0.1) 4px, transparent 4px, transparent 12px)",
        }}
      />

      {/* Vertical Rulers - Right (hidden on mobile) */}
      <div 
        className="absolute right-8 top-0 bottom-0 w-px hidden md:block"
        style={{
          background: "repeating-linear-gradient(to bottom, hsl(var(--terracotta) / 0.2) 0px, hsl(var(--terracotta) / 0.2) 8px, transparent 8px, transparent 16px)",
        }}
      />
      <div 
        className="absolute right-12 top-0 bottom-0 w-px hidden md:block"
        style={{
          background: "repeating-linear-gradient(to bottom, hsl(var(--terracotta) / 0.1) 0px, hsl(var(--terracotta) / 0.1) 4px, transparent 4px, transparent 12px)",
        }}
      />

      {/* Corner Data - Top Left (hidden on mobile) */}
      <div className="hidden md:block absolute top-16 left-16 font-pixel text-[8px] md:text-[10px] text-terracotta/50">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          NET_STATUS: ONLINE
        </div>
      </div>

      {/* Corner Data - Top Right (hidden on mobile) */}
      <div className="hidden md:block absolute top-16 right-16 font-pixel text-[8px] md:text-[10px] text-terracotta/50 text-right">
        <div className="flex items-center gap-2">
          SECURE_CONNECTION: TRUE
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
        </div>
      </div>

      {/* Corner Data - Bottom Right (hidden on mobile) */}
      <div className="hidden md:block absolute bottom-20 right-16 font-pixel text-[8px] md:text-[10px] text-terracotta/40">
        V.3.0.1 OPUS
      </div>

      {/* Horizontal scan lines at corners */}
      <div 
        className="absolute top-20 left-16 w-16 h-px hidden md:block"
        style={{ background: "linear-gradient(to right, hsl(var(--terracotta) / 0.3), transparent)" }}
      />
      <div 
        className="absolute top-20 right-16 w-16 h-px hidden md:block"
        style={{ background: "linear-gradient(to left, hsl(var(--terracotta) / 0.3), transparent)" }}
      />
    </div>
  );
};
