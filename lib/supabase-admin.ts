import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// Create a dedicated admin client that bypasses RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  // This ensures we use the service role key for all operations
  global: {
    headers: {
      apikey: supabaseServiceKey,
      authorization: `Bearer ${supabaseServiceKey}`,
    },
  },
})

// Test connection function
export async function testConnection() {
  try {
    const { data, error } = await supabaseAdmin.from("bookings").select("count(*)", { count: "exact", head: true })

    if (error) {
      console.error("Connection test failed:", error)
      return false
    }

    console.log("Supabase admin connection successful")
    return true
  } catch (error) {
    console.error("Connection test error:", error)
    return false
  }
}
