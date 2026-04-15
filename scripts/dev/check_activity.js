import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://abpmxbibuuwcqbhhsjlo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicG14YmlidXV3Y3FiaGhzamxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNTI5NTQsImV4cCI6MjA4NzgyODk1NH0.kqPGLAwsdHO3ISiNeMk9_xFHNPstUg4FHmmmeCWhSns';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkActivities() {
  console.log('Fetching activities...');
  const { data, error } = await supabase
    .from('activities')
    .select('id, title, link_slug, additional_fields, status');

  if (error) {
    console.error('Error fetching activities:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No activities found.');
    return;
  }

  console.log(`Found ${data.length} activities:`);
  data.forEach(activity => {
    console.log(`---`);
    console.log(`ID: ${activity.id}`);
    console.log(`Title: ${activity.title}`);
    console.log(`Link Slug: ${activity.link_slug}`);
    console.log(`Additional Fields:`, JSON.stringify(activity.additional_fields));
    console.log(`Status: ${activity.status}`);
  });

  const targetSlug = 'astron-industrial-intelligence-hackathon';
  console.log(`\nSearching for slug: "${targetSlug}"`);
  
  const found = data.find(a => 
    a.link_slug === targetSlug || 
    (a.additional_fields && a.additional_fields.link_slug === targetSlug)
  );

  if (found) {
    console.log(`Target activity found! ID: ${found.id}`);
  } else {
    console.log(`Target activity "${targetSlug}" NOT found.`);
  }
}

checkActivities();
