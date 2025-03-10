-- Script para añadir empresas con sus respectivos asesores
-- Con tasas de interés como números enteros (porcentajes), IVA como 16.00 y payment_day como 1

DO $$ 
DECLARE 
    alexis_id UUID;
    sofia_id UUID;
    diego_id UUID;
    edgar_id UUID;
    angelica_id UUID;
    pte_id UUID;
BEGIN
    -- Obtenemos los IDs de los asesores por su nombre
    SELECT id INTO alexis_id FROM advisors WHERE name = 'Alexis Medina';
    SELECT id INTO sofia_id FROM advisors WHERE name = 'Sofia Esparza';
    SELECT id INTO diego_id FROM advisors WHERE name = 'Diego Garza';
    SELECT id INTO edgar_id FROM advisors WHERE name = 'Edgar Benavides';
    SELECT id INTO angelica_id FROM advisors WHERE name = 'Angelica Elizondo';
    
    -- Insertamos cada empresa con su asesor correspondiente
    
    -- Factor Uno - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Factor Uno', 'FAC3705', 45, 'monthly', 1,
        50000, 5000, 16.00, 
        0, alexis_id, 'Alexis Medina'
    );
    
    -- Valle Alto - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Valle Alto', 'VAL9567', 48, 'monthly', 1,
        50000, 5000, 16.00, 
        3, alexis_id, 'Alexis Medina'
    );
    
    -- Herramental - PTE
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, "Advisor"
    ) VALUES (
        'Herramental', 'HER3120', 52, 'monthly', 1,
        50000, 5000, 16.00, 
        3, 'PTE'
    );
    
    -- Alimentarium - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Alimentarium', 'ALI7039', 52, 'monthly', 1,
        50000, 5000, 16.00, 
        0, alexis_id, 'Alexis Medina'
    );
    
    -- Fortezza - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Fortezza', 'FOR3558', 52, 'monthly', 1,
        50000, 5000, 16.00, 
        3, alexis_id, 'Alexis Medina'
    );
    
    -- IMMEX - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'IMMEX', 'IMM7336', 54, 'monthly', 1,
        50000, 5000, 16.00, 
        3, alexis_id, 'Alexis Medina'
    );
    
    -- Primo - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Primo', 'PRI1753', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, alexis_id, 'Alexis Medina'
    );
    
    -- Desarrolladora - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Desarrolladora', 'DES8426', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, alexis_id, 'Alexis Medina'
    );
    
    -- Litográfica - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Litográfica', 'LIT2870', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, alexis_id, 'Alexis Medina'
    );
    
    -- Bienes Raíces - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Bienes Raíces', 'BIE2002', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, alexis_id, 'Alexis Medina'
    );
    
    -- Logistrorage - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Logistrorage', 'LOG7082', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, alexis_id, 'Alexis Medina'
    );
    
    -- Plastypel - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Plastypel', 'PLA7171', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, alexis_id, 'Alexis Medina'
    );
    
    -- Therco - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Therco', 'THE4893', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, alexis_id, 'Alexis Medina'
    );
    
    -- Diseños Finos - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Diseños Finos', 'DIS4193', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, alexis_id, 'Alexis Medina'
    );
    
    -- Privarsa - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Privarsa', 'PRI5030', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, alexis_id, 'Alexis Medina'
    );
    
    -- Mulligans - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Mulligans', 'MUL1401', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, alexis_id, 'Alexis Medina'
    );
    
    -- Alimentos Sangar - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Alimentos Sangar', 'ALI3338', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, alexis_id, 'Alexis Medina'
    );
    
    -- Universidad Metropolitana - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Universidad Metropolitana', 'UNI6301', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, alexis_id, 'Alexis Medina'
    );
    
    -- Novo Corps - Sofia Esparza
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Novo Corps', 'NOV6987', 80, 'monthly', 1,
        50000, 5000, 16.00, 
        5, sofia_id, 'Sofia Esparza'
    );
    
    -- Leocaza - Sofia Esparza
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Leocaza', 'LEO2628', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, sofia_id, 'Sofia Esparza'
    );
    
    -- Suministros - Sofia Esparza
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Suministros', 'SUM1346', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, sofia_id, 'Sofia Esparza'
    );
    
    -- 701 Publicidad - Sofia Esparza
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        '701 Publicidad', '7017203', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, sofia_id, 'Sofia Esparza'
    );
    
    -- Surtidor Eléctrico - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Surtidor Eléctrico', 'SUR8061', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, alexis_id, 'Alexis Medina'
    );
    
    -- HSP Hospital San Pedro - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'HSP Hospital San Pedro', 'HSP1467', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, alexis_id, 'Alexis Medina'
    );
    
    -- AGC - Alexis Medina
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'AGC', 'AGC6767', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5.8, alexis_id, 'Alexis Medina'
    );
    
    -- Grupo Hower - Sofia Esparza
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Grupo Hower', 'HOW3356', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, sofia_id, 'Sofia Esparza'
    );
    
    -- Javala de México - Sofia Esparza
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Javala de México', 'JAV1655', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, sofia_id, 'Sofia Esparza'
    );
    
    -- Vertical - Sofia Esparza
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Vertical', 'VER2683', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, sofia_id, 'Sofia Esparza'
    );
    
    -- Grupo Arvent - Sofia Esparza
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Grupo Arvent', 'ARV3977', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, sofia_id, 'Sofia Esparza'
    );
    
    -- Industrias GSL - Diego Garza
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Industrias GSL', 'GSL9775', 81.28, 'monthly', 1,
        50000, 5000, 16.00, 
        5.8, diego_id, 'Diego Garza'
    );
    
    -- Cartotec - Edgar Benavides
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Cartotec', 'CAR9424', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        5, edgar_id, 'Edgar Benavides'
    );
    
    -- Transportes - Angelica Elizondo
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Transportes', 'TRA5976', 55, 'monthly', 1,
        50000, 5000, 16.00, 
        2.5, angelica_id, 'Angelica Elizondo'
    );
    
    -- Presidencia - Angelica Elizondo
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Presidencia', 'PRE2030', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        2.5, angelica_id, 'Angelica Elizondo'
    );
    
    -- Doña Raquel - Angelica Elizondo
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Doña Raquel', 'RAQ3329', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        2.5, angelica_id, 'Angelica Elizondo'
    );
    
    -- Taquería "Tía Carmen" - Angelica Elizondo
    INSERT INTO companies (
        name, employee_code, interest_rate, payment_frequency, payment_day,
        max_credit_amount, min_credit_amount, iva_rate, 
        commission_rate, advisor_id, "Advisor"
    ) VALUES (
        'Taquería "Tía Carmen"', 'CAR5799', 60, 'monthly', 1,
        50000, 5000, 16.00, 
        2.5, angelica_id, 'Angelica Elizondo'
    );
    
END $$; 