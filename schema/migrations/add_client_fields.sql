-- Migration to add client-related fields to Fincentiva tables
-- Date: March 18, 2025

-- Add client fields to product_simulations table
ALTER TABLE public.product_simulations 
ADD COLUMN IF NOT EXISTS client_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);

-- Add client fields to cash_requests table
ALTER TABLE public.cash_requests 
ADD COLUMN IF NOT EXISTS client_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);

-- Add client fields to selected_plans table
ALTER TABLE public.selected_plans 
ADD COLUMN IF NOT EXISTS client_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);

-- Add indexes for improved querying performance
CREATE INDEX IF NOT EXISTS idx_product_simulations_client_phone ON public.product_simulations(client_phone);
CREATE INDEX IF NOT EXISTS idx_cash_requests_client_phone ON public.cash_requests(client_phone);
CREATE INDEX IF NOT EXISTS idx_selected_plans_client_phone ON public.selected_plans(client_phone);

-- Add comments for documentation
COMMENT ON COLUMN public.product_simulations.client_name IS 'Full name of the client';
COMMENT ON COLUMN public.product_simulations.client_email IS 'Email address of the client';
COMMENT ON COLUMN public.product_simulations.client_phone IS 'Phone number of the client';

COMMENT ON COLUMN public.cash_requests.client_name IS 'Full name of the client';
COMMENT ON COLUMN public.cash_requests.client_email IS 'Email address of the client';
COMMENT ON COLUMN public.cash_requests.client_phone IS 'Phone number of the client';

COMMENT ON COLUMN public.selected_plans.client_name IS 'Full name of the client';
COMMENT ON COLUMN public.selected_plans.client_email IS 'Email address of the client';
COMMENT ON COLUMN public.selected_plans.client_phone IS 'Phone number of the client'; 