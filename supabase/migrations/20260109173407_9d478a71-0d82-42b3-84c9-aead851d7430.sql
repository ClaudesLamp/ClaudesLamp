-- Add columns for high-velocity payout system
ALTER TABLE public.wishes 
ADD COLUMN IF NOT EXISTS score integer,
ADD COLUMN IF NOT EXISTS payout_amount integer,
ADD COLUMN IF NOT EXISTS payout_tier text,
ADD COLUMN IF NOT EXISTS is_jackpot boolean DEFAULT false;

-- Create index for jackpot queries
CREATE INDEX IF NOT EXISTS idx_wishes_is_jackpot ON public.wishes(is_jackpot) WHERE is_jackpot = true;

-- Create index for payout tracking (for circuit breaker)
CREATE INDEX IF NOT EXISTS idx_wishes_payout_created ON public.wishes(created_at, payout_amount) WHERE payout_amount IS NOT NULL;