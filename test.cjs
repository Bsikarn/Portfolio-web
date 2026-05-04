const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].replace(/['"]/g, '').trim(), keyMatch[1].replace(/['"]/g, '').trim());
  const checkTable = async (name) => {
    const { data, error } = await supabase.from(name).select('*').limit(1);
    console.log(`Table ${name}:`, error ? error.message : 'EXISTS (data length: ' + data.length + ')');
  };
  (async () => {
    await Promise.all([
      checkTable('settings'),
      checkTable('profile'),
      checkTable('personal_info'),
      checkTable('about_me'),
      checkTable('contact'),
      checkTable('site_settings'),
      checkTable('projects')
    ]);
  })();
}
