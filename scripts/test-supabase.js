
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  console.log('Testing Supabase connection...');
  
  // Test 1: Get buckets
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error('Error listing buckets:', bucketError);
  } else {
    console.log('Buckets:', buckets.map(b => b.name));
  }

  // Test 2: Try to get 'activity-images' bucket
  const { data: bucket, error: getBucketError } = await supabase.storage.getBucket('activity-images');
  if (getBucketError) {
    console.log('activity-images bucket not found or error:', getBucketError.message);
  } else {
    console.log('activity-images bucket exists:', bucket);
  }

  // Test 3: Try to create 'activity-images' bucket if it doesn't exist
  if (getBucketError && getBucketError.message.includes('not found')) {
    console.log('Attempting to create activity-images bucket...');
    const { data: newBucket, error: createError } = await supabase.storage.createBucket('activity-images', {
      public: true
    });
    if (createError) {
      console.error('Error creating bucket:', createError);
    } else {
      console.log('Bucket created successfully');
    }
  }
}

test();
