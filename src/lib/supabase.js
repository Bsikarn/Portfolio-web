import { createClient } from '@supabase/supabase-js'

// ⚠️ ให้เอา URL และ ANON KEY จากหน้า Settings > API ใน Supabase ของคุณมาใส่แทนนะครับ
const supabaseUrl = 'https://dcnljnbrommnewegzoie.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjbmxqbmJyb21tbmV3ZWd6b2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzIyMTIsImV4cCI6MjA4ODA0ODIxMn0.L-MePfdi4BLxYEkp2r3GszZF8zwP7NCyMpXNAnptumc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)