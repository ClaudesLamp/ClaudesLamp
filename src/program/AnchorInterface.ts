// Solana Anchor Interface Definition
export const PROGRAM_ID = "HbW...generic...key";

export interface TreasuryState {
  isInitialized: boolean;
  authority: string;
  hoardBalance: number;
  bump: number;
}

export const calculateRentExemption = (size: number): number => {
  // LAMPORTS_PER_BYTE approximation
  return size * 89784; 
};