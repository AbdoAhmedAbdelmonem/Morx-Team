const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  let log = '';
  const targetUuid = 'cfae8b08-707c-4b5b-a602-f3552a2ca5f4';
  
  log += `[CHECK] Time: ${new Date().toISOString()}\n`;
  log += `[CHECK] Target UUID: ${targetUuid}\n`;

  // 1. Table existence and counts
  const tables = ['users', 'teams', 'team_members', 'projects', 'tasks'];
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    log += `[TABLE] ${t}: ${error ? 'ERROR: ' + error.message : count + ' rows'}\n`;
  }

  // 2. User mapping
  const { data: userRow } = await supabase.from('users').select('user_id, email').eq('auth_user_id', targetUuid).single();
  log += `[USER] Mapping: ${targetUuid} -> ${userRow ? 'user_id=' + userRow.user_id + ' (' + userRow.email + ')' : 'NOT FOUND'}\n`;

  if (userRow) {
    // 3. Memberships
    const { data: mUuid } = await supabase.from('team_members').select('team_id').eq('auth_user_id', targetUuid);
    log += `[MEMBERSHIPS] By UUID: ${mUuid?.length || 0} teams\n`;

    const { data: mLegacy } = await supabase.from('team_members').select('team_id').eq('user_id', userRow.user_id);
    log += `[MEMBERSHIPS] By Legacy user_id: ${mLegacy?.length || 0} teams\n`;
    
    if (mLegacy && mLegacy.length > 0 && (!mUuid || mUuid.length === 0)) {
       log += `[ALERT] Data found in legacy column but NOT in auth_user_id column. Re-sync required.\n`;
    }
  }

  fs.writeFileSync('data-check-results.txt', log);
  console.log('Results written to data-check-results.txt');
}

check();
