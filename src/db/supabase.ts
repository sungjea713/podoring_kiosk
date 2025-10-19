import { createClient } from '@supabase/supabase-js'

const supabaseUrl = Bun.env.SUPABASE_URL
const supabaseAnonKey = Bun.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('✅ Supabase connected')
