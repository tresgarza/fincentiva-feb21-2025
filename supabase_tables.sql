-- Tabla para simulaciones de financiamiento de productos
CREATE TABLE product_financing_simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_first_name TEXT NOT NULL,
  user_last_name TEXT NOT NULL,
  company_code TEXT NOT NULL,
  company_name TEXT,
  monthly_income DECIMAL NOT NULL,
  payment_frequency TEXT NOT NULL,
  product_url TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL NOT NULL,
  plan_1_details JSONB,
  plan_2_details JSONB,
  plan_3_details JSONB,
  selected_plan_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'simulated'
);

-- Tabla para simulaciones de solicitud de efectivo
CREATE TABLE cash_request_simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_first_name TEXT NOT NULL,
  user_last_name TEXT NOT NULL,
  company_code TEXT NOT NULL,
  company_name TEXT,
  monthly_income DECIMAL NOT NULL,
  payment_frequency TEXT NOT NULL,
  requested_amount DECIMAL NOT NULL,
  plan_1_details JSONB,
  plan_2_details JSONB,
  plan_3_details JSONB,
  selected_plan_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'simulated'
);

-- Índices para búsquedas comunes
CREATE INDEX product_financing_company_idx ON product_financing_simulations(company_code);
CREATE INDEX product_financing_status_idx ON product_financing_simulations(status);
CREATE INDEX cash_request_company_idx ON cash_request_simulations(company_code);
CREATE INDEX cash_request_status_idx ON cash_request_simulations(status);

-- Políticas de seguridad (ajustar según tus necesidades)
ALTER TABLE product_financing_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_request_simulations ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción desde la aplicación cliente
CREATE POLICY "Allow inserts for authenticated users" 
ON product_financing_simulations FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow inserts for authenticated users" 
ON cash_request_simulations FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Política para permitir lectura desde la aplicación cliente
CREATE POLICY "Allow reads for authenticated users" 
ON product_financing_simulations FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow reads for authenticated users" 
ON cash_request_simulations FOR SELECT 
TO authenticated 
USING (true);

-- Política para permitir actualizaciones desde la aplicación cliente
CREATE POLICY "Allow updates for authenticated users" 
ON product_financing_simulations FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow updates for authenticated users" 
ON cash_request_simulations FOR UPDATE 
TO authenticated 
USING (true); 