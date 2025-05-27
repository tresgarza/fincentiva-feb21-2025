const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ydnygntfkrleiseuciwq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkbnlnbnRma3JsZWlzZXVjaXdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTk5MjQwNiwiZXhwIjoyMDU1NTY4NDA2fQ.TwhEGW9DK4DTQQRquT6Z9UW8T8UjLX-hp9uKdRjWAhs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    const { data, error } = await supabase.from('advisors').select('*').limit(1);
    if (error) {
      console.error('Error de conexión:', error);
      return;
    }
    console.log('✅ Conexión exitosa a Supabase');
    console.log('Datos del asesor:', data[0]);
  } catch (err) {
    console.error('Error general:', err);
  }
}

main();
