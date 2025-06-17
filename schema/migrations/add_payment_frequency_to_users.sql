-- Migration: Add payment_frequency field to users table
-- This field stores the user's personal income payment frequency (weekly, biweekly, monthly, etc.)

ALTER TABLE public.users 
ADD COLUMN payment_frequency VARCHAR(20) NOT NULL DEFAULT 'monthly';

-- Add check constraint to ensure valid payment frequency values
ALTER TABLE public.users 
ADD CONSTRAINT check_payment_frequency 
CHECK (payment_frequency IN ('weekly', 'biweekly', 'fortnightly', 'decenal', 'monthly'));

-- Add index for better performance on payment_frequency queries
CREATE INDEX idx_users_payment_frequency ON public.users(payment_frequency);

-- Add comment for documentation
COMMENT ON COLUMN public.users.payment_frequency IS 'User personal income payment frequency: weekly, biweekly, fortnightly, decenal, or monthly'; 