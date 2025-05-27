const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ydnygntfkrleiseuciwq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkbnlnbnRma3JsZWlzZXVjaXdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTk5MjQwNiwiZXhwIjoyMDU1NTY4NDA2fQ.TwhEGW9DK4DTQQRquT6Z9UW8T8UjLX-hp9uKdRjWAhs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryAdvisors() {
  console.log('Consultando la tabla de asesores...');
  
  const { data, error } = await supabase
    .from('advisors')
    .select('*');
  
  if (error) {
    console.error('Error al consultar asesores:', error);
    return;
  }
  
  console.log('Total de asesores encontrados:', data.length);
  console.log('Lista de asesores:');
  
  data.forEach(advisor => {
    console.log();
  });
}
