import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel runs files in /api in production. This tiny middleware mirrors those
// read-only endpoints during `npm run dev`, so the UI works locally as well.
function localApi(mode) {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    name: 'local-supabase-api',
    configureServer(server) {
      server.middlewares.use('/api/items', async (req, res, next) => {
        try {
          const { createClient } = await import('@supabase/supabase-js')
          const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
          const match = req.url.match(/^\/(\d+)\/?(?:\?.*)?$/)
          let payload
          if (match) {
            const { data: item, error: itemError } = await db.from('items').select('id, name, url, option_axis, first_seen_at, updated_at, item_options(id, label)').eq('id', match[1]).single()
            if (itemError) throw itemError
            const ids = item.item_options.map((option) => option.id)
            const { data: history, error } = ids.length ? await db.from('price_history').select('item_option_id, price, stock, crawled_at').in('item_option_id', ids).order('crawled_at') : { data: [], error: null }
            if (error) throw error
            payload = { item, history }
          } else {
            const query = new URL(req.url, 'http://localhost').searchParams.get('q')?.trim().replace(/[,%_]/g, '') || ''
            let request = db.from('items').select('id, name, url, option_axis, updated_at, item_options(id, label)').order('updated_at', { ascending: false }).limit(40)
            if (query) request = request.ilike('name', `%${query}%`)
            const { data: items, error } = await request
            if (error) throw error
            payload = { items }
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(payload))
        } catch (error) {
          next(error)
        }
      })
    }
  }
}

export default defineConfig(({ mode }) => ({ plugins: [react(), localApi(mode)] }))
