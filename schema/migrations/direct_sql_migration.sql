-- Migration to add client-related fields to Fincentiva tables
-- Date: March 18, 2025
-- This file can be executed directly in the Supabase SQL editor

-- Add client fields to product_simulations table
ALTER TABLE IF EXISTS public.product_simulations 
ADD COLUMN IF NOT EXISTS client_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);

-- Add client fields to cash_requests table
ALTER TABLE IF EXISTS public.cash_requests 
ADD COLUMN IF NOT EXISTS client_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);

-- Add client fields to selected_plans table
ALTER TABLE IF EXISTS public.selected_plans 
ADD COLUMN IF NOT EXISTS client_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);

-- Add indexes for improved querying performance
CREATE INDEX IF NOT EXISTS idx_product_simulations_client_phone ON public.product_simulations(client_phone);
CREATE INDEX IF NOT EXISTS idx_cash_requests_client_phone ON public.cash_requests(client_phone);
CREATE INDEX IF NOT EXISTS idx_selected_plans_client_phone ON public.selected_plans(client_phone); 