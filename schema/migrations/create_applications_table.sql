-- Create the unified applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    status text NOT NULL,
    client_name text,
    client_email text,
    client_phone text,
    simulation_id uuid,
    simulation_type text NOT NULL,
    company_id uuid,
    company_name text,
    selected_plan_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add index for improved query performance
CREATE INDEX IF NOT EXISTS idx_applications_phone ON public.applications(client_phone);
CREATE INDEX IF NOT EXISTS idx_applications_company_id ON public.applications(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_simulation_id ON public.applications(simulation_id);

-- Add comments for documentation
COMMENT ON TABLE public.applications IS 'Unified table containing all applications, simulations, and requests';
COMMENT ON COLUMN public.applications.status IS 'Current status of the application';
COMMENT ON COLUMN public.applications.client_name IS 'Full name of the client';
COMMENT ON COLUMN public.applications.client_email IS 'Email of the client';
COMMENT ON COLUMN public.applications.client_phone IS 'Phone number of the client';
COMMENT ON COLUMN public.applications.simulation_id IS 'Reference to the original simulation/request ID';
COMMENT ON COLUMN public.applications.simulation_type IS 'Type of simulation: product or cash';
COMMENT ON COLUMN public.applications.company_id IS 'ID of the company';
COMMENT ON COLUMN public.applications.company_name IS 'Name of the company';
COMMENT ON COLUMN public.applications.selected_plan_id IS 'Reference to the selected plan if applicable';
COMMENT ON COLUMN public.applications.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN public.applications.updated_at IS 'Timestamp when the record was last updated'; 