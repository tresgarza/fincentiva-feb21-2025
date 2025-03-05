-- Añadir campo de teléfono a la tabla product_simulations
ALTER TABLE product_simulations
ADD COLUMN IF NOT EXISTS user_phone TEXT;

-- Añadir campo de teléfono a la tabla cash_requests
ALTER TABLE cash_requests
ADD COLUMN IF NOT EXISTS user_phone TEXT;

-- Añadir campo de teléfono a la tabla selected_plans
ALTER TABLE selected_plans
ADD COLUMN IF NOT EXISTS user_phone TEXT;

-- Añadir comentarios a las columnas para documentación
COMMENT ON COLUMN product_simulations.user_phone IS 'Número de teléfono del usuario que realizó la simulación';
COMMENT ON COLUMN cash_requests.user_phone IS 'Número de teléfono del usuario que solicitó el crédito en efectivo';
COMMENT ON COLUMN selected_plans.user_phone IS 'Número de teléfono del usuario que seleccionó el plan'; 