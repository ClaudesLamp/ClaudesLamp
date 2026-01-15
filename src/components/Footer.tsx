import { useState } from "react";
import { useTreasuryStats } from "@/hooks/useTreasuryStats";
import pumpfunLogo from "@/assets/pumpfun-logo.png";

const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const FALLBACK_CA = "7RubLampOrAc1eGn1ePumpFun5oLaNaX9TrEaSuRy";

// Truncate CA for mobile display
const truncateCA = (ca: string) => {
  if (ca.length <= 12) return ca;
  return `${ca.slice(0, 6)}...${ca.slice(-4)}`;
};

export const Footer = () => {
  const [copied, setCopied] = useState(false);
  const stats = useTreasuryStats();
  
  // Use live token mint from on-chain, fallback to placeholder
  const contractAddress = stats.tokenMint || FALLBACK_CA;

  const handleCopyCA = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[60] py-2 px-3 md:py-4 md:px-8"
      style={{
        background: "hsl(var(--terracotta-dark))",
        borderTop: "2px solid hsl(var(--gold) / 0.4)",
        boxShadow: "0 -4px 20px hsl(var(--terracotta) / 0.3)",
      }}
    >
      <div className="flex items-center justify-center gap-3 md:gap-6 max-w-full px-2 md:px-4">
        {/* CA - truncated on mobile, full on desktop */}
        <button
          onClick={handleCopyCA}
          className="font-pixel text-[8px] md:text-sm text-cream/80 tracking-wider hover:text-gold transition-colors cursor-pointer"
          title={contractAddress}
        >
          {copied ? (
            <span className="text-gold">COPIED!</span>
          ) : (
            <>
              <span className="hidden md:inline">CA: <span className="text-gold">{contractAddress}</span></span>
              <span className="md:hidden">CA: <span className="text-gold">{truncateCA(contractAddress)}</span></span>
            </>
          )}
        </button>

        {/* Social Icons */}
        <div className="flex items-center gap-2 md:gap-3">
          <a
            href="https://github.com/ClaudesLamp/ClaudesLamp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream/80 hover:text-gold transition-colors"
            aria-label="View on GitHub"
          >
            <GitHubIcon />
          </a>
          <a
            href="https://x.com/claudeslamprub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream/80 hover:text-gold transition-colors"
            aria-label="Follow on X"
          >
            <XIcon />
          </a>
          <a
            href="https://pump.fun/coin/DFyAu5TCNx4UnZpptr8SA5zfvKR28u9S7c5UNDDjpump"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream/80 hover:text-gold transition-colors"
            aria-label="View on Pump.fun"
          >
            <img src={pumpfunLogo} alt="Pump.fun" className="w-5 h-5 transition-all" style={{ filter: 'sepia(1) saturate(0) brightness(0.85)' }} onMouseEnter={(e) => e.currentTarget.style.filter = 'sepia(1) saturate(2) brightness(1.2) hue-rotate(-10deg)'} onMouseLeave={(e) => e.currentTarget.style.filter = 'sepia(1) saturate(0) brightness(0.85)'} />
          </a>
        </div>
      </div>
    </div>
  );
};
