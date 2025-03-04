-- Habilitar la extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla para simulaciones de financiamiento de productos con acceso público
DROP TABLE IF EXISTS product_financing_simulations;
CREATE TABLE product_financing_simulations (
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

-- Tabla para simulaciones de solicitud de efectivo con acceso público
DROP TABLE IF EXISTS cash_request_simulations;
CREATE TABLE cash_request_simulations (
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

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS product_financing_company_idx ON product_financing_simulations(company_code);
CREATE INDEX IF NOT EXISTS product_financing_status_idx ON product_financing_simulations(status);
CREATE INDEX IF NOT EXISTS cash_request_company_idx ON cash_request_simulations(company_code);
CREATE INDEX IF NOT EXISTS cash_request_status_idx ON cash_request_simulations(status);

-- Configurar seguridad para acceso público
ALTER TABLE product_financing_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_request_simulations ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS COMPLETAMENTE PERMISIVAS (SOLO PARA DESARROLLO)
DROP POLICY IF EXISTS "Allow full access to product simulations" ON product_financing_simulations;
CREATE POLICY "Allow full access to product simulations" 
ON product_financing_simulations
FOR ALL 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to cash simulations" ON cash_request_simulations;
CREATE POLICY "Allow full access to cash simulations" 
ON cash_request_simulations
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Verificar acceso para usuario anónimo
GRANT ALL ON product_financing_simulations TO anon;
GRANT ALL ON cash_request_simulations TO anon;

-- Para otros roles
GRANT ALL ON product_financing_simulations TO authenticated;
GRANT ALL ON cash_request_simulations TO authenticated;
GRANT ALL ON product_financing_simulations TO service_role;
GRANT ALL ON cash_request_simulations TO service_role; 