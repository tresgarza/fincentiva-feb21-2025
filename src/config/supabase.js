import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './api';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { supabase }; 