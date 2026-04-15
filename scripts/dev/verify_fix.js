import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://abpmxbibuuwcqbhhsjlo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicG14YmlidXV3Y3FiaGhzamxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNTI5NTQsImV4cCI6MjA4NzgyODk1NH0.kqPGLAwsdHO3ISiNeMk9_xFHNPstUg4FHmmmeCWhSns';

const supabase = createClient(supabaseUrl, supabaseKey);

// Copied from src/utils/activityRoute.ts with the fix applied
const isMissingLinkSlugColumnError = (error) =>
  Boolean(error) &&
  (error?.code === 'PGRST204' || 
   error?.code === '42703' ||
   error?.message?.includes("Could not find the 'link_slug' column of 'activities' in the schema cache") ||
   error?.message?.includes('column "link_slug" does not exist') ||
   error?.message?.includes('column activities.link_slug does not exist'));

async function simulateActivityFetch(key) {
  console.log(`Fetching activity with key: ${key}`);

  // 1. Try fetching by link_slug (expected to fail if column missing)
  console.log('1. Trying link_slug column...');
  const { data, error } = await supabase.from('activities').select('*').eq('link_slug', key).maybeSingle();

  if (!error && data) {
    console.log('Success with link_slug column!');
    return data;
  }

  if (error) {
    console.log('Error encountered:', error.message, 'Code:', error.code);
    if (isMissingLinkSlugColumnError(error)) {
      console.log('Confirmed: Error identifies as missing link_slug column. Proceeding to fallback...');
    } else {
      console.error('FAILED: Error was NOT identified as missing column error. Script would stop here.');
      return null;
    }
  }

  // 2. Fallback to additional_fields
  console.log('2. Trying additional_fields...');
  const fallbackQuery = supabase.from('activities').select('*').contains('additional_fields', { link_slug: key });
  const { data: fallbackData, error: fallbackError } = await fallbackQuery.maybeSingle();

  if (!fallbackError && fallbackData) {
    console.log('Success with additional_fields!');
    console.log('Activity ID:', fallbackData.id);
    return fallbackData;
  }

  if (fallbackError) {
    console.error('Error with fallback query:', fallbackError);
  } else {
    console.log('No data found in fallback query.');
  }

  return null;
}

simulateActivityFetch('astron-industrial-intelligence-hackathon');
