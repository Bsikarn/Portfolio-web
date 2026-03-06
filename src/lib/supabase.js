import { createClient } from '@supabase/supabase-js'

// Initialize Supabase variables from environment variables (using Vite's import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Export the singleton Supabase client for use throughout the application
export const supabase = createClient(supabaseUrl, supabaseAnonKey)