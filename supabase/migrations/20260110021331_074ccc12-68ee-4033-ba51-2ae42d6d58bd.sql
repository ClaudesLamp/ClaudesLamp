-- Enable REPLICA IDENTITY FULL for realtime updates to include all row data
ALTER TABLE public.public_wishes REPLICA IDENTITY FULL;