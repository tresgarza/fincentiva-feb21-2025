const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ydnygntfkrleiseuciwq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkbnlnbnRma3JsZWlzZXVjaXdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTk5MjQwNiwiZXhwIjoyMDU1NTY4NDA2fQ.TwhEGW9DK4DTQQRquT6Z9UW8T8UjLX-hp9uKdRjWAhs';

const supabase = createClient(supabaseUrl, supabaseKey);

// Query to list all tables and their columns
const listTablesQuery = `
  SELECT 
    table_name,
    array_agg(column_name) as columns
  FROM 
    information_schema.columns
  WHERE 
    table_schema = 'public'
  GROUP BY 
    table_name
  ORDER BY 
    table_name;
`;

async function showTables() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: listTablesQuery });
    
    if (error) throw error;
    
    console.log('Tables and columns in the database:');
    console.log('===================================');
    
    if (data && data.length > 0) {
      data.forEach(table => {
        console.log(`\nTable: ${table.table_name}`);
        console.log('Columns:');
        if (table.columns && Array.isArray(table.columns)) {
          table.columns.forEach(column => {
            console.log(`  - ${column}`);
          });
        }
      });
    } else {
      console.log('No tables found.');
    }
  } catch (error) {
    console.error('Error fetching tables:', error);
  }
}

// Execute
showTables(); 