const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://ydnygntfkrleiseuciwq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkbnlnbnRma3JsZWlzZXVjaXdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTk5MjQwNiwiZXhwIjoyMDU1NTY4NDA2fQ.TwhEGW9DK4DTQQRquT6Z9UW8T8UjLX-hp9uKdRjWAhs';

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to apply a SQL migration
async function applyMigration(filePath) {
  try {
    console.log(`Reading migration file: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log('Applying migration to Supabase...');
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      console.error('Error applying migration:', error);
      return false;
    }
    
    console.log('Migration applied successfully!');
    return true;
  } catch (err) {
    console.error('Error:', err);
    return false;
  }
}

// Path to the migration file
const migrationFilePath = path.join(__dirname, '..', 'schema', 'migrations', 'add_client_fields.sql');

// Apply the migration
applyMigration(migrationFilePath)
  .then(success => {
    if (success) {
      console.log('Migration process completed successfully.');
    } else {
      console.error('Migration process failed.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unhandled error during migration:', err);
    process.exit(1);
  }); 