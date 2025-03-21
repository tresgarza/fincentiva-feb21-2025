-- Create users table
CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    paternal_surname VARCHAR(100) NOT NULL,
    maternal_surname VARCHAR(100),
    birth_date DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company_id uuid NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Add constraint for unique phone number per company
    CONSTRAINT unique_phone_per_company UNIQUE (phone, company_id),
    
    -- Add constraint for unique email per company
    CONSTRAINT unique_email_per_company UNIQUE (email, company_id),
    
    -- Add foreign key constraint to companies table
    CONSTRAINT fk_company
        FOREIGN KEY (company_id)
        REFERENCES public.companies(id)
        ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_users_company_id ON public.users(company_id);
CREATE INDEX idx_users_phone ON public.users(phone);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to select users data
CREATE POLICY users_select_policy
    ON public.users
    FOR SELECT
    USING (true);

-- Only allow users to update their own data
CREATE POLICY users_update_policy
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Allow insert for authenticated users (for registration)
CREATE POLICY users_insert_policy
    ON public.users
    FOR INSERT
    WITH CHECK (true);

-- Comments for better documentation
COMMENT ON TABLE public.users IS 'Table storing all registered users for the Fincentiva platform';
COMMENT ON COLUMN public.users.first_name IS 'User first name';
COMMENT ON COLUMN public.users.paternal_surname IS 'User paternal surname';
COMMENT ON COLUMN public.users.maternal_surname IS 'User maternal surname (optional)';
COMMENT ON COLUMN public.users.birth_date IS 'User birth date';
COMMENT ON COLUMN public.users.phone IS 'User phone number - must be unique per company';
COMMENT ON COLUMN public.users.email IS 'User email address - must be unique per company';
COMMENT ON COLUMN public.users.company_id IS 'Reference to the company where the user works';
COMMENT ON COLUMN public.users.created_at IS 'Timestamp when the user record was created';
COMMENT ON COLUMN public.users.last_login IS 'Timestamp of the user\'s last successful login'; 