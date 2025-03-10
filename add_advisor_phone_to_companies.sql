-- Script para añadir y mantener automáticamente el número de teléfono del asesor en la tabla companies

-- 1. Añadir la columna advisor_phone a la tabla companies
ALTER TABLE companies
ADD COLUMN advisor_phone TEXT;

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

CREATE TRIGGER trigger_update_advisor_phone
AFTER INSERT OR UPDATE OF advisor_id ON companies
FOR EACH ROW
EXECUTE FUNCTION update_advisor_phone();

-- 5. También actualizar manualmente los teléfonos para las empresas que tienen el campo Advisor pero no advisor_id
UPDATE companies c
SET advisor_phone = a.phone
FROM advisors a
WHERE c.advisor_id IS NULL 
  AND c."Advisor" IS NOT NULL 
  AND c."Advisor" ILIKE '%' || a.name || '%'
  AND c.advisor_phone IS NULL;

-- 6. Actualización específica para empresas conocidas que puedan no estar correctamente mapeadas
UPDATE companies 
SET advisor_phone = '8211110095'  -- Angelica Elizondo
WHERE employee_code = 'CAR5799' AND advisor_phone IS NULL;  -- Taquería "Tía Carmen"

UPDATE companies 
SET advisor_phone = '8113800021'  -- Alexis Medina
WHERE employee_code = 'CAD0227' AND advisor_phone IS NULL;  -- CADTONER

UPDATE companies 
SET advisor_phone = '8211110095'  -- Angelica Elizondo
WHERE employee_code IN ('TRA5976', 'PRE2030', 'RAQ3329') AND advisor_phone IS NULL;  -- Empresas de Angelica

UPDATE companies 
SET advisor_phone = '8117919076'  -- Edgar Benavides
WHERE employee_code = 'CAR9424' AND advisor_phone IS NULL;  -- Cartotec

UPDATE companies 
SET advisor_phone = '8116364522'  -- Diego Garza
WHERE employee_code = 'GSL9775' AND advisor_phone IS NULL;  -- Industrias GSL 