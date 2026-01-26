-- Create device fingerprints table for coupon restrictions
CREATE TABLE IF NOT EXISTS public.device_fingerprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  user_id UUID,
  guest_telegram TEXT,
  used_coupons TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;

-- Policies for device fingerprints
CREATE POLICY "Anyone can insert device fingerprint"
ON public.device_fingerprints FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all device fingerprints"
ON public.device_fingerprints FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can update device fingerprints"
ON public.device_fingerprints FOR UPDATE
USING (true);

-- Add unique constraint on fingerprint
ALTER TABLE public.device_fingerprints ADD CONSTRAINT device_fingerprints_fingerprint_unique UNIQUE (fingerprint);

-- Add trigger for updated_at
CREATE TRIGGER update_device_fingerprints_updated_at
BEFORE UPDATE ON public.device_fingerprints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();