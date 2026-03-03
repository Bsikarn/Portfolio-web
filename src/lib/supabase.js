import { createClient } from '@supabase/supabase-js'

// เรียกใช้ตัวแปรจาก .env ผ่าน import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)