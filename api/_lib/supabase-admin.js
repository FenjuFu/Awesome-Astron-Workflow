import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = (!supabaseUrl || !supabaseServiceKey)
  ? new Proxy({}, {
      get() {
        throw new Error('Missing Supabase URL or Service Role Key');
      }
    })
  : createClient(supabaseUrl, supabaseServiceKey);
