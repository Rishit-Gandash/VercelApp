import { supabase, sendError } from './_supabase.js'
export default async function handler(req, res) {
  try {
    const query = String(req.query.q || '').trim().replace(/[,%_]/g, '')
    let request = supabase().from('items').select('id, name, url, option_axis, updated_at, item_options(id, label)').order('updated_at', { ascending: false }).limit(40)
    if (query) request = request.ilike('name', `%${query}%`)
    const { data, error } = await request
    if (error) throw error
    res.status(200).json({ items: data })
  } catch (error) { sendError(res, error) }
}
