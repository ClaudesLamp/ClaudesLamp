-- Add IP address column for tracking cooldowns
ALTER TABLE public.wishes 
ADD COLUMN ip_address text;

-- Create index for faster IP lookups
CREATE INDEX idx_wishes_ip_address ON public.wishes(ip_address);

-- Create index for faster duplicate wish lookups
CREATE INDEX idx_wishes_wish_text_verdict ON public.wishes(wish_text, verdict);

-- Create composite index for IP + time lookups (cooldown checks)
CREATE INDEX idx_wishes_ip_created ON public.wishes(ip_address, created_at DESC);