// SOLANA INTERFACE DEFINITION
// On-Chain Settlement Layer

pub struct HoardState {
    pub is_initialized: bool,
    pub authority: Pubkey, 
    pub total_payouts: u64,
}

pub enum OracleInstruction {
    GrantWish { amount: u64, score: u8 },
    RefillLamp { amount: u64 },
}