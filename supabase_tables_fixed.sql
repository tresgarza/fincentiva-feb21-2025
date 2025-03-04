-- Habilitar la extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla para simulaciones de financiamiento de productos
CREATE TABLE IF NOT EXISTS product_financing_simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_first_name TEXT,
  user_last_name TEXT,
  company_code TEXT,
  company_name TEXT,
  monthly_income DECIMAL,
  payment_frequency TEXT,
  product_url TEXT,
  product_name TEXT,
  product_price DECIMAL,
  plan_1_details JSONB,
  plan_2_details JSONB,
  plan_3_details JSONB,
  selected_plan_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'simulated'
);

-- Tabla para simulaciones de solicitud de efectivo
CREATE TABLE IF NOT EXISTS cash_request_simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_first_name TEXT,
  user_last_name TEXT,
  company_code TEXT,
  company_name TEXT,
  monthly_income DECIMAL,
  payment_frequency TEXT,
  requested_amount DECIMAL,
  plan_1_details JSONB,
  plan_2_details JSONB,
  plan_3_details JSONB,
  selected_plan_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'simulated'
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS product_financing_company_idx ON product_financing_simulations(company_code);
CREATE INDEX IF NOT EXISTS product_financing_status_idx ON product_financing_simulations(status);
CREATE INDEX IF NOT EXISTS cash_request_company_idx ON cash_request_simulations(company_code);
CREATE INDEX IF NOT EXISTS cash_request_status_idx ON cash_request_simulations(status);

-- Habilitar RLS (Row Level Security)
ALTER TABLE product_financing_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_request_simulations ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir todas las operaciones para usuarios autenticados
CREATE POLICY "Allow all operations for authenticated users on product simulations"
ON product_financing_simulations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on cash simulations"
ON cash_request_simulations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Agregar políticas que permiten a usuarios anónimos (no autenticados) insertar datos
CREATE POLICY "Allow inserts for anon users on product simulations"
ON product_financing_simulations
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow select for anon users on product simulations"
ON product_financing_simulations
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow update for anon users on product simulations"
ON product_financing_simulations
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow inserts for anon users on cash simulations"
ON cash_request_simulations
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow select for anon users on cash simulations"
ON cash_request_simulations
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow update for anon users on cash simulations"
ON cash_request_simulations
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true); 