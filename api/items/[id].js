import { supabase, sendError } from '../_supabase.js'
export default async function handler(req, res) {
  try {
    const id = Number(req.query.id)
    if (!Number.isSafeInteger(id)) return res.status(400).json({ error: 'Invalid item id.' })
    const db = supabase()
    const { data: item, error: itemError } = await db.from('items').select('id, name, url, option_axis, first_seen_at, updated_at, item_options(id, label)').eq('id', id).single()
    if (itemError) throw itemError
    const ids = item.item_options.map((option) => option.id)
    const { data: history, error } = ids.length ? await db.from('price_history').select('item_option_id, price, stock, crawled_at').in('item_option_id', ids).order('crawled_at') : { data: [], error: null }
    if (error) throw error
    res.status(200).json({ item, history })
  } catch (error) { if (error.code === 'PGRST116') return res.status(404).json({ error: 'Item not found.' }); sendError(res, error) }
}
