-- Add tx_signature column to store Solana transaction signatures
ALTER TABLE public.wishes 
ADD COLUMN tx_signature TEXT DEFAULT NULL;

-- Add tx_signature column to admin logs as well
ALTER TABLE public.admin_wish_logs 
ADD COLUMN tx_signature TEXT DEFAULT NULL;