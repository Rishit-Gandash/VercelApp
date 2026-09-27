import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'

function LineChart({ points, color }) {
  const priced = points.filter((point) => point.price != null)
  if (!priced.length) return <div className="empty-chart">No price samples yet</div>
  const values = priced.map((point) => Number(point.price)), min = Math.min(...values), max = Math.max(...values), span = max - min || 1
  const path = priced.map((point, index) => {
    const x = priced.length === 1 ? 50 : index / (priced.length - 1) * 100
    const y = 86 - (Number(point.price) - min) / span * 70
    return `${index ? 'L' : 'M'} ${x} ${y}`
  }).join(' ')
  return <div className="chart-wrap"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Price history chart"><path className="grid" d="M0 16H100M0 51H100M0 86H100" /><path className="line" d={path} style={{ stroke: color }} /></svg><div className="chart-labels"><span>{formatDate(priced[0].crawled_at)}</span><span>{formatDate(priced.at(-1).crawled_at)}</span></div></div>
}

function App() {
  const [query, setQuery] = useState(''), [items, setItems] = useState([]), [selected, setSelected] = useState(null), [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true), [detailLoading, setDetailLoading] = useState(false), [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true); setError('')
      try { const response = await fetch(`/api/items?q=${encodeURIComponent(query)}`, { signal: controller.signal }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setItems(body.items) }
      catch (err) { if (err.name !== 'AbortError') setError(err.message || 'Could not load items.') } finally { setLoading(false) }
    }, 180)
    return () => { controller.abort(); clearTimeout(timer) }
  }, [query])
  async function choose(item) {
    setSelected(item); setHistory([]); setDetailLoading(true); setError('')
    try { const response = await fetch(`/api/items/${item.id}`); const body = await response.json(); if (!response.ok) throw new Error(body.error); setSelected(body.item); setHistory(body.history) }
    catch (err) { setError(err.message || 'Could not load item.') } finally { setDetailLoading(false) }
  }
  const histories = useMemo(() => Object.groupBy(history, ({ item_option_id }) => item_option_id), [history])
  const options = selected?.item_options || []
  return <main><header><a className="brand" href="#" onClick={(e) => { e.preventDefault(); setSelected(null) }}>PRICE <i>ATLAS</i></a><span className="live"><b /> LIVE TRACKING</span></header>
    <section className={`hero ${selected ? 'compact' : ''}`}><p className="eyebrow">PRODUCT PRICE INTELLIGENCE</p><h1>{selected ? selected.name : 'Know the price.\nMake the move.'}</h1>{!selected && <p className="lede">Search your tracked catalog and compare every option's price movement over time.</p>}</section>
    {!selected ? <section className="browse"><label className="search"><span>⌕</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search items by name..." /></label><div className="section-top"><span>{loading ? 'Searching catalog...' : `${items.length} item${items.length === 1 ? '' : 's'} found`}</span><span>UPDATED RECENTLY</span></div>{error ? <p className="notice">{error}</p> : <div className="item-list">{items.map((item) => <button className="item-row" key={item.id} onClick={() => choose(item)}><span className="item-mark">{item.name?.slice(0, 1)}</span><span className="item-name">{item.name}<small>{item.option_axis || 'Option'} · {item.item_options?.length || 0} choices</small></span><span className="arrow">→</span></button>)}{!loading && !items.length && <p className="notice">No matching items found.</p>}</div>}</section> : <section className="detail"><button className="back" onClick={() => setSelected(null)}>← All items</button><div className="detail-heading"><div><p className="eyebrow">{selected.option_axis || 'OPTIONS'} · {options.length} VARIANTS</p><h2>{selected.name}</h2><a href={selected.url} target="_blank" rel="noreferrer">View product ↗</a></div><span>Last synced {formatDate(selected.updated_at)}</span></div>{error ? <p className="notice">{error}</p> : detailLoading ? <p className="notice">Loading price history…</p> : <div className="option-grid">{options.map((option, index) => { const points = histories[option.id] || [], latest = points.at(-1), prior = points.at(-2), delta = latest?.price != null && prior?.price != null ? Number(latest.price) - Number(prior.price) : null, colors = ['#d7ff56', '#75a7ff', '#ff9a67', '#d598ff']; return <article className="option-card" key={option.id}><div className="card-head"><span>{option.label}</span><b style={{ color: colors[index % colors.length] }}>●</b></div><strong>{latest?.price != null ? money.format(latest.price) : '—'}</strong><span className={delta > 0 ? 'up change' : 'change'}>{delta == null ? 'Awaiting samples' : `${delta > 0 ? '↑' : '↓'} ${money.format(Math.abs(delta))} from previous`}</span><LineChart points={points} color={colors[index % colors.length]} /><footer>{latest?.stock != null ? `${latest.stock} in stock` : 'Stock unavailable'}<span>{points.length} samples</span></footer></article>})}</div>}</section>}</main>
}
createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
