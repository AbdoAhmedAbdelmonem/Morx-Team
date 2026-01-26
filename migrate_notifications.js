const { createClient } = require('@supabase/supabase-js');

async function runMigration() {
  const supabaseUrl = 'https://odpxzdubukzhrtjaxiry.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcHh6ZHVidWt6aHJ0amF4aXJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODUxMDAwNywiZXhwIjoyMDg0MDg2MDA3fQ.1SnsHnhV-7IU-CAUUX7EyFCDJdwGacGFXpvRAlJa9zQ';

  const supabase = createClient(supabaseUrl, supabaseKey);

  const migration = `
    -- Rename column if it exists
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'create_at') THEN
        ALTER TABLE notifications RENAME COLUMN create_at TO created_at;
      END IF;
    END $$;

    -- Add type column if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'type') THEN
        ALTER TABLE notifications ADD COLUMN type VARCHAR(50) DEFAULT 'task_due';
      END IF;
    END $$;

    -- Make task_id nullable
    ALTER TABLE notifications ALTER COLUMN task_id DROP NOT NULL;
  `;

  try {
    const { data, error } = await supabase.rpc('raw_sql', { query_text: migration });
    if (error) {
      console.error('Migration Error:', JSON.stringify(error, null, 2));
      process.exit(1);
    } else {
      console.log('Migration successful');
    }
  } catch (e) {
    console.error('Script Error:', e);
    process.exit(1);
  }
}

runMigration();
