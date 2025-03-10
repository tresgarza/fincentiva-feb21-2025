-- Script para añadir y mantener automáticamente el número de teléfono del asesor en la tabla companies

-- 1. Añadir la columna advisor_phone a la tabla companies
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS advisor_phone TEXT;

-- 2. Actualizar la columna advisor_phone con los teléfonos de los asesores asignados
UPDATE companies c
SET advisor_phone = a.phone
FROM advisors a
WHERE c.advisor_id = a.id;

-- 3. Añadir comentario descriptivo a la columna
COMMENT ON COLUMN companies.advisor_phone IS 'Número de teléfono del asesor asignado a la empresa';

-- 4. Crear un trigger para mantener actualizado el campo advisor_phone cuando cambie el advisor_id
CREATE OR REPLACE FUNCTION update_advisor_phone()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.advisor_id IS NOT NULL THEN
        -- Actualizar el advisor_phone cuando se asigna o cambia el advisor_id
        UPDATE companies
        SET advisor_phone = (SELECT phone FROM advisors WHERE id = NEW.advisor_id)
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_advisor_phone
AFTER INSERT OR UPDATE OF advisor_id ON companies
FOR EACH ROW
EXECUTE FUNCTION update_advisor_phone();

-- 5. Actualizaciones específicas para empresas que necesitan mapeos manuales

-- Taquería "Tía Carmen"
UPDATE companies 
SET advisor_phone = '8211110095'  -- Angelica Elizondo
WHERE (employee_code = 'CAR5799' OR name LIKE '%Carmen%') AND advisor_phone IS NULL;

-- CADTONER
UPDATE companies 
SET advisor_phone = '8113800021'  -- Alexis Medina
WHERE (employee_code = 'CAD0227' OR name LIKE '%CADTONER%') AND advisor_phone IS NULL;

-- Grupo Hower
UPDATE companies 
SET advisor_phone = '8120007707'  -- Sofía Esparza
WHERE (employee_code = 'HOW1234' OR name LIKE '%Hower%') AND advisor_phone IS NULL;

-- Cartotec
UPDATE companies 
SET advisor_phone = '8117919076'  -- Edgar Benavides
WHERE (employee_code = 'CAR9424' OR name LIKE '%Cartotec%') AND advisor_phone IS NULL;

-- Industrias GSL
UPDATE companies 
SET advisor_phone = '8116364522'  -- Diego Garza
WHERE (employee_code = 'GSL9775' OR name LIKE '%GSL%') AND advisor_phone IS NULL;

-- 6. Actualizar usando la columna Advisor para cualquier registro que siga sin teléfono

-- Sofía Esparza
UPDATE companies
SET advisor_phone = '8120007707'
WHERE (Advisor LIKE '%Sofia%' OR Advisor LIKE '%Esparza%') AND advisor_phone IS NULL;

-- Angelica Elizondo
UPDATE companies
SET advisor_phone = '8211110095'
WHERE (Advisor LIKE '%Angelica%' OR Advisor LIKE '%Elizondo%') AND advisor_phone IS NULL;

-- Alexis Medina
UPDATE companies
SET advisor_phone = '8113800021'
WHERE (Advisor LIKE '%Alexis%' OR Advisor LIKE '%Medina%') AND advisor_phone IS NULL;

-- Edgar Benavides
UPDATE companies
SET advisor_phone = '8117919076'
WHERE (Advisor LIKE '%Edgar%' OR Advisor LIKE '%Benavides%') AND advisor_phone IS NULL;

-- Diego Garza 
UPDATE companies
SET advisor_phone = '8116364522'
WHERE (Advisor LIKE '%Diego%' OR Advisor LIKE '%Garza%') AND advisor_phone IS NULL;

-- 7. Asegurarse de que todos los teléfonos que se guarden tengan 10 dígitos, sin el prefijo 52 o formato internacional
UPDATE companies 
SET advisor_phone = REGEXP_REPLACE(advisor_phone, '[^0-9]', '', 'g')
WHERE advisor_phone IS NOT NULL;

UPDATE companies 
SET advisor_phone = RIGHT(advisor_phone, 10)
WHERE LENGTH(advisor_phone) > 10 AND advisor_phone IS NOT NULL; 