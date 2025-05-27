-- SQL query to find tables that might be the "unified table" containing application data
-- Tables with "application" in their name
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%application%';

-- Also show all table names to get a comprehensive view
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name; 