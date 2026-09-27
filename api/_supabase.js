import { createClient } from '@supabase/supabase-js'
export function supabase() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase environment variables')
  return createClient(url, key, { auth: { persistSession: false } })
}
export function sendError(res, error) { console.error(error); res.status(500).json({ error: 'Unable to load price data.' }) }
