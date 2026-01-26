const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectData() {
  const tables = ['users', 'teams', 'team_members', 'projects', 'tasks', 'belong', 'team', 'project', 'participation', 'task'];
  
  console.log('--- Database Inspection ---');
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`[${table}]: Table does not exist or error: ${error.message}`);
    } else {
      console.log(`[${table}]: Found ${count} rows`);
    }
  }

  // Check the current user's membership
  const targetUuid = 'cfae8b08-707c-4b5b-a602-f3552a2ca5f4';
  console.log(`\n--- Memberships for UUID: ${targetUuid} ---`);
  
  const { data: pluralMemberships } = await supabase
    .from('team_members')
    .select('*')
    .eq('auth_user_id', targetUuid);
  console.log(`[team_members]: ${pluralMemberships?.length || 0} rows found`);

  // Check plural vs singular user_id linkage
  if (pluralMemberships && pluralMemberships.length > 0) {
     console.log('Sample membership:', pluralMemberships[0]);
  }
}

inspectData();
