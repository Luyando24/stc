const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const index = trimmed.indexOf('=');
  if (index === -1) return;
  env[trimmed.substring(0, index).trim()] = trimmed.substring(index + 1).trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error(error);
    return;
  }

  data.users.forEach(u => {
    console.log(`Email: ${u.email}`);
    console.log(`  Created: ${u.created_at}`);
    console.log(`  Last Sign In: ${u.last_sign_in_at}`);
  });
}

run();
