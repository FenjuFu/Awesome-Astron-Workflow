import { createClient } from '@supabase/supabase-js';

// Load environment variables if running directly (or assume process.env is set)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkRegistrations() {
  console.log('Checking registrations with Service Role (Bypassing RLS)...');
  
  const { data, error } = await supabaseAdmin
    .from('registrations')
    .select(`
      *,
      activities (
        title
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching registrations:', error);
    return;
  }

  console.log(`Found ${data.length} registrations:`);
  data.forEach(reg => {
    console.log(`- [${reg.status}] ${reg.name} (${reg.phone}) - Activity: ${reg.activities?.title || 'Unknown'}`);
  });
  
  if (data.length > 0) {
    console.log('\nSuccess! Data exists in the database but is likely hidden by RLS policies.');
    console.log('Please run the migration "supabase/migrations/20240301_allow_anon_registrations.sql" in your Supabase SQL Editor to fix visibility.');
  } else {
    console.log('\nNo registrations found. Please try submitting again.');
  }
}

checkRegistrations();
