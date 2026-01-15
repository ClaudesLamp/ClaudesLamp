-- Create private admin logging table
CREATE TABLE public.admin_wish_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  wish_text TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  ip_address TEXT,
  score INTEGER,
  verdict TEXT,
  payout_tier TEXT,
  payout_amount INTEGER,
  raw_ai_response JSONB
);

-- Enable RLS
ALTER TABLE public.admin_wish_logs ENABLE ROW LEVEL SECURITY;

-- NO public policies = only service role can access
-- This makes it completely private, viewable only in backend dashboard

-- Add index for quick lookups
CREATE INDEX idx_admin_wish_logs_created_at ON public.admin_wish_logs(created_at DESC);
CREATE INDEX idx_admin_wish_logs_wallet ON public.admin_wish_logs(wallet_address);