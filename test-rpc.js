import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
    console.log("Testing increment_views...")
    const { data, error } = await supabase.rpc('increment_views')
    if (error) {
        console.error("Error:", error)
    } else {
        console.log("Success:", data)
    }

    console.log("Testing increment_cheer_ups...")
    const { data: d2, error: e2 } = await supabase.rpc('increment_cheer_ups')
    if (e2) {
        console.error("Error:", e2)
    } else {
        console.log("Success:", d2)
    }
}

test()
