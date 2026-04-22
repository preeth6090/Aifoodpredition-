import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  Users, Clock, IndianRupee, X, ChefHat, CheckCircle, Eye, EyeOff,
  QrCode, Printer, Plus, Minus, Edit3, Sparkles, Loader, ToggleLeft, ToggleRight,
  ShoppingBag, AlertTriangle, Bell
} from 'lucide-react'
import { useTable } from '../context/TableContext'
import { useInventory } from '../context/InventoryContext'

// ── helpers ───────────────────────────────────────────────────────
function elapsed(startTime) {
  const mins = Math.floor((Date.now() - new Date(startTime)) / 60000)
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins/60)}h ${mins%60}m`
}
function elapsedMins(startTime) {
  return Math.floor((Date.now() - new Date(startTime)) / 60000)
}

// ── Status config ─────────────────────────────────────────────────
const TABLE_STATUS = {
  available:      { label: 'Available',    bg: '#f0fdf4', border: '#a7f3d0', dot: '#10b981', text: '#065f46' },
  occupied:       { label: 'Occupied',     bg: '#eff6ff', border: '#bfdbfe', dot: '#3b82f6', text: '#1e3a8a' },
  'bill-requested':{ label: 'Bill Req.',   bg: '#fff7ed', border: '#fed7aa', dot: '#f97316', text: '#9a3412' },
  closed:         { label: 'Closed',      bg: '#f9fafb', border: '#e5e7eb', dot: '#9ca3af', text: '#374151' },
}

// ── QR URL builder ────────────────────────────────────────────────
function menuUrl(tableId) {
  return `${window.location.origin}/menu/${tableId}`
}
function qrSrc(tableId) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl(tableId))}&bgcolor=ffffff&color=0F1629&margin=10`
}

// ── Invoice Print View ────────────────────────────────────────────
function InvoiceModal({ table, session, bill, onClose }) {
  const today = new Date()
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4" style={{ background: 'var(--th-bg)' }}>
          <span className="font-serif font-semibold" style={{ color: 'var(--th-text)' }}>Invoice</span>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--th-text)', opacity: 0.7 }} /></button>
        </div>
        <div className="p-6 font-mono text-sm" id="invoice-body">
          <div className="text-center mb-4">
            <p className="font-serif text-xl font-bold text-gray-900">GoldStock Restaurant</p>
            <p className="text-xs text-gray-500">FSSAI: 10019022007 | GSTIN: 29AABCG1234A1Z5</p>
            <div className="divider-themed my-3" />
          </div>
          <div className="grid grid-cols-2 text-xs text-gray-600 mb-4 gap-1">
            <span>Table: <strong>{table.number}</strong></span>
            <span className="text-right">Covers: <strong>{session?.covers}</strong></span>
            <span>Date: {today.toLocaleDateString('en-IN')}</span>
            <span className="text-right">Time: {today.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}</span>
          </div>
          <div className="border-t border-b border-gray-200 py-3 mb-3">
            <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 mb-2">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Rate</span>
              <span className="col-span-2 text-right">Amt</span>
            </div>
            {bill.lineItems.map((item, i) => (
              <div key={i} className="grid grid-cols-12 text-xs text-gray-700 py-1">
                <span className="col-span-6 truncate">{item.name}</span>
                <span className="col-span-2 text-center">{item.qty}</span>
                <span className="col-span-2 text-right">{item.price}</span>
                <span className="col-span-2 text-right font-semibold">{(item.qty * item.price).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 text-xs text-gray-600 mb-4">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{bill.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>CGST @ 2.5%</span><span>₹{bill.cgst.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>SGST @ 2.5%</span><span>₹{bill.sgst.toFixed(2)}</span></div>
            <div className="flex justify-between font-serif font-bold text-base text-gray-900 border-t border-gray-200 pt-2 mt-1">
              <span>TOTAL</span>
              <span style={{ color: 'var(--primary)' }}>₹{bill.total.toFixed(2)}</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400">Thank you for dining with us! 🙏</p>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex gap-3">
          <button className="btn-ghost flex-1 justify-center" onClick={onClose}>Close</button>
          <button className="btn-gold flex-1 justify-center" onClick={() => window.print()}>
            <Printer size={15} /> Print
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Table Detail Modal ────────────────────────────────────────────
function TableDetail({ table, onClose }) {
  const {
    getActiveSession, getTableOrders, getTableBill,
    requestBill, closeTable, updateOrderStatus, openTable,
  } = useTable()
  const { recipes } = useInventory()
  const [showInvoice,  setShowInvoice]  = useState(false)
  const [showQR,       setShowQR]       = useState(false)
  const [covers,       setCovers]       = useState(2)
  const [aiInsight,    setAiInsight]    = useState('')
  const [loadingAI,    setLoadingAI]    = useState(false)
  const [, setTick]                     = useState(0)

  const session = getActiveSession(table.id)
  const orders  = getTableOrders(table.id)
  const bill    = getTableBill(table.id)
  const mins    = session ? elapsedMins(session.startTime) : 0

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 60000)
    return () => clearInterval(t)
  }, [])

  const pendingOrders = orders.filter(o => ['pending','preparing','partially-ready','ready'].includes(o.status))

  const handleCloseTable = () => {
    closeTable(table.id)
    onClose()
  }

  const fetchAI = async () => {
    const apiKey = localStorage.getItem('groq_api_key')
    if (!apiKey) { setAiInsight('⚠ Set your Groq API key in AI Insights first.'); return }
    setLoadingAI(true)
    try {
      const orderSummary = orders.map(o =>
        `Round ${o.round}: ${o.items.map(i => `${i.qty}x ${i.name}`).join(', ')}`
      ).join(' | ')
      const prompt = `Restaurant table analysis. Table ${table.number}, ${session?.covers} guests, seated ${mins} minutes ago.\nOrders so far: ${orderSummary}\nTotal bill so far: ₹${bill.total.toFixed(0)}\n\nGive a short 3-bullet analysis:\n1. Eating pattern observation\n2. Likely next order (be specific)\n3. Estimated time until they leave and whether to start preparing dessert/drinks`

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], max_tokens: 200 })
      })
      const data = await res.json()
      setAiInsight(data.choices?.[0]?.message?.content || 'No insight available.')
    } catch {
      setAiInsight('Failed to fetch AI insight.')
    }
    setLoadingAI(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ background: 'var(--th-bg)' }}>
          <div>
            <p className="font-serif text-xl font-bold" style={{ color: 'var(--th-text)' }}>{table.number}</p>
            <p className="text-xs opacity-60" style={{ color: 'var(--th-text)' }}>
              {table.section} · {table.seats} seats
              {session ? ` · ${session.covers} covers · ${elapsed(session.startTime)} seated` : ' · Available'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowQR(v => !v)} className="p-2 rounded-xl opacity-70 hover:opacity-100 transition-opacity">
              <QrCode size={16} style={{ color: 'var(--th-text)' }} />
            </button>
            <button onClick={onClose}><X size={18} style={{ color: 'var(--th-text)', opacity: 0.7 }} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* QR Code */}
          {showQR && (
            <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <img src={qrSrc(table.id)} alt="QR Code" className="w-40 h-40 rounded-xl shadow" />
              <p className="text-xs text-gray-500 text-center">
                Customers scan to view menu & order
              </p>
              <p className="text-[10px] font-mono text-gray-400 break-all text-center">{menuUrl(table.id)}</p>
            </div>
          )}

          {/* Open table (if available) */}
          {!session && (
            <div className="rounded-2xl p-4 bg-green-50 border border-green-200 space-y-3">
              <p className="font-semibold text-green-800 text-sm">Seat guests at this table</p>
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-600 font-semibold">Covers:</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCovers(c => Math.max(1, c - 1))}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center">
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center font-bold">{covers}</span>
                  <button onClick={() => setCovers(c => Math.min(table.seats, c + 1))}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center">
                    <Plus size={12} />
                  </button>
                </div>
                <button onClick={() => openTable(table.id, covers)} className="btn-gold ml-auto">
                  <Users size={14} /> Seat Guests
                </button>
              </div>
            </div>
          )}

          {/* Session active */}
          {session && (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Time Seated', value: elapsed(session.startTime), sub: mins >= 90 ? '⚠ Long stay' : '' },
                  { label: 'Covers',      value: session.covers,             sub: `${table.seats} max` },
                  { label: 'Bill Total',  value: `₹${bill.total.toFixed(0)}`, sub: `${bill.lineItems.reduce((s,l)=>s+l.qty,0)} items` },
                ].map(k => (
                  <div key={k.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--kpi-bg)', border: '1px solid var(--kpi-border)' }}>
                    <p className="font-serif font-bold text-xl text-executive-dark">{k.value}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{k.label}</p>
                    {k.sub && <p className="text-[10px] text-amber-600 mt-0.5">{k.sub}</p>}
                  </div>
                ))}
              </div>

              {/* Active orders */}
              {pendingOrders.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Active Orders</h3>
                  <div className="space-y-2">
                    {pendingOrders.map(order => (
                      <div key={order.id} className="rounded-xl overflow-hidden border border-gray-100">
                        <div className="px-3 py-2 flex items-center justify-between bg-gray-50">
                          <span className="text-xs font-semibold text-gray-600">Round {order.round} · {order.id}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            order.status === 'pending'    ? 'bg-amber-100 text-amber-700' :
                            order.status === 'preparing'  ? 'bg-blue-100 text-blue-700' :
                            order.status === 'ready'      ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>{order.status}</span>
                        </div>
                        {order.items.map((item, i) => (
                          <div key={i} className="px-3 py-2 flex items-center justify-between border-t border-gray-50">
                            <span className="text-sm text-gray-700">{item.qty}× {item.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-900">₹{(item.qty*item.price).toFixed(0)}</span>
                              {item.status === 'ready' && (
                                <button onClick={() => {
                                  const idx = order.items.indexOf(item)
                                  // mark whole order served for simplicity
                                  updateOrderStatus(order.id, 'served')
                                }} className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                  Serve
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bill summary */}
              {bill.lineItems.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill Summary</h3>
                  <div className="rounded-xl overflow-hidden border border-gray-100">
                    {bill.lineItems.map((item, i) => (
                      <div key={i} className="px-3 py-2 flex items-center justify-between border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-700">{item.qty}× {item.name}</span>
                        <span className="text-sm font-semibold text-gray-900">₹{(item.qty*item.price).toFixed(0)}</span>
                      </div>
                    ))}
                    <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 space-y-1 text-xs text-gray-500">
                      <div className="flex justify-between"><span>Subtotal</span><span>₹{bill.subtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>CGST + SGST (5%)</span><span>₹{(bill.cgst+bill.sgst).toFixed(2)}</span></div>
                    </div>
                    <div className="px-3 py-3 flex justify-between font-serif font-bold text-base" style={{ background: 'var(--kpi-bg)', color: 'var(--primary)' }}>
                      <span>Total</span>
                      <span>₹{bill.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Insight */}
              <div className="rounded-2xl p-4" style={{ background: 'var(--kpi-bg)', border: '1px solid var(--kpi-border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                    <span className="text-xs font-semibold text-gray-700">AI Table Insight</span>
                  </div>
                  <button onClick={fetchAI} disabled={loadingAI} className="btn-gold text-xs py-1 px-3">
                    {loadingAI ? <Loader size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {loadingAI ? 'Analysing…' : 'Analyse'}
                  </button>
                </div>
                {aiInsight ? (
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{aiInsight}</p>
                ) : (
                  <p className="text-xs text-gray-400">Click "Analyse" for AI-powered dining pattern insights and next-order predictions.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        {session && (
          <div className="flex gap-2 px-5 py-4 border-t flex-shrink-0" style={{ borderColor: 'var(--card-border)' }}>
            <button onClick={() => requestBill(table.id)} className="btn-outline flex-1 justify-center text-xs">
              <Bell size={13} /> Request Bill
            </button>
            <button onClick={() => setShowInvoice(true)} className="btn-gold flex-1 justify-center text-xs">
              <Printer size={13} /> Invoice
            </button>
            <button onClick={handleCloseTable} className="btn-danger text-xs px-3">
              Close Table
            </button>
          </div>
        )}
      </div>

      {showInvoice && (
        <InvoiceModal table={table} session={session} bill={bill} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  )
}

// ── Menu Manager ──────────────────────────────────────────────────
function MenuManager({ recipes, onToggleVisible, onToggleAvailable }) {
  const categories = ['All', ...new Set(recipes.map(r => r.category))]
  const [cat, setCat] = useState('All')
  const filtered = cat === 'All' ? recipes : recipes.filter(r => r.category === cat)

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <button key={c}
            onClick={() => setCat(c)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: cat === c ? 'var(--btn-from)' : '#ffffff',
              color: cat === c ? '#ffffff' : '#6b7280',
              border: `1.5px solid ${cat === c ? 'var(--btn-from)' : '#e2e8f0'}`,
            }}>
            {c}
          </button>
        ))}
      </div>

      <div className="gold-card overflow-hidden">
        <table className="table-gold">
          <thead>
            <tr>
              <th>Menu Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Visible on Menu</th>
              <th>Available Now</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(recipe => (
              <tr key={recipe.id}>
                <td className="font-medium text-executive-dark">{recipe.name}</td>
                <td><span className="badge-gold text-[10px]">{recipe.category}</span></td>
                <td className="font-serif font-semibold" style={{ color: 'var(--primary)' }}>₹{recipe.sellingPrice}</td>
                <td>
                  <button onClick={() => onToggleVisible(recipe.id)}
                    className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                      recipe.isVisible !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {recipe.isVisible !== false
                      ? <><Eye size={13} /> Shown</>
                      : <><EyeOff size={13} /> Hidden</>
                    }
                  </button>
                </td>
                <td>
                  <button onClick={() => onToggleAvailable(recipe.id)}
                    className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                      recipe.isAvailable !== false ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {recipe.isAvailable !== false
                      ? <><CheckCircle size={13} /> Available</>
                      : <><X size={13} /> Unavailable</>
                    }
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function TableManagement() {
  const {
    tables, sessions, orders,
    getActiveSession, getTableStatus, getMinutesSeated, getTableBill, getTableOrders,
  } = useTable()
  const { recipes, updateRecipe } = useInventory()

  const [selectedTable, setSelectedTable] = useState(null)
  const [activeTab,     setActiveTab]     = useState('floor')   // floor | menu
  const [, setTick]                       = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 60000)
    return () => clearInterval(t)
  }, [])

  const toggleVisible   = (id) => updateRecipe(id, { isVisible:   recipes.find(r=>r.id===id)?.isVisible === false })
  const toggleAvailable = (id) => updateRecipe(id, { isAvailable: recipes.find(r=>r.id===id)?.isAvailable === false })

  // Floor stats
  const stats = useMemo(() => {
    const occupied     = tables.filter(t => getTableStatus(t.id) !== 'available').length
    const billPending  = tables.filter(t => getTableStatus(t.id) === 'bill-requested').length
    const kitchenBusy  = orders.filter(o => ['pending','preparing'].includes(o.status)).length
    const todayRevenue = orders
      .filter(o => o.status === 'served' && o.createdAt.startsWith(new Date().toISOString().split('T')[0]))
      .flatMap(o => o.items)
      .reduce((s, i) => s + i.qty * i.price, 0)
    return { occupied, free: tables.length - occupied, billPending, kitchenBusy, todayRevenue }
  }, [tables, orders, sessions])

  const sections = [...new Set(tables.map(t => t.section))]

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Table Management</h1>
          <p className="page-subtitle">Live floor view, guest sessions, QR ordering and menu control</p>
        </div>
        <div className="flex gap-2">
          {['floor','menu'].map(tab => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
              style={{
                background: activeTab === tab ? 'var(--btn-from)' : '#ffffff',
                color: activeTab === tab ? '#ffffff' : '#6b7280',
                border: `1.5px solid ${activeTab === tab ? 'var(--btn-from)' : '#e2e8f0'}`,
              }}>
              {tab === 'floor' ? '🏠 Floor View' : '📋 Menu Control'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Tables Occupied', value: stats.occupied,              color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Tables Free',     value: stats.free,                  color: '#10b981', bg: '#f0fdf4' },
          { label: 'Bill Pending',    value: stats.billPending,           color: '#f97316', bg: '#fff7ed' },
          { label: 'Kitchen Orders',  value: stats.kitchenBusy,           color: '#8b5cf6', bg: '#f5f3ff' },
          { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString('en-IN',{maximumFractionDigits:0})}`, color: 'var(--primary)', bg: 'var(--kpi-bg)' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-4 text-center" style={{ background: k.bg, border: `1px solid ${k.color}30` }}>
            <p className="font-serif font-bold text-2xl" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs text-gray-500 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {activeTab === 'floor' && (
        <div className="space-y-6">
          {sections.map(section => (
            <div key={section}>
              <h2 className="font-serif font-semibold text-executive-dark mb-3 flex items-center gap-2">
                <span>{section}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {tables.filter(t => t.section === section).map(table => {
                  const status  = getTableStatus(table.id)
                  const cfg     = TABLE_STATUS[status] || TABLE_STATUS.available
                  const session = getActiveSession(table.id)
                  const mins    = session ? elapsedMins(session.startTime) : 0
                  const bill    = session ? getTableBill(table.id) : null
                  const tableOrders = getTableOrders(table.id)
                  const hasReady = tableOrders.some(o => o.status === 'ready')
                  const hasPending = tableOrders.some(o => o.status === 'pending')

                  return (
                    <button key={table.id}
                      onClick={() => setSelectedTable(table)}
                      className="rounded-2xl p-4 text-left transition-all hover:scale-[1.02] hover:shadow-md relative"
                      style={{
                        background: cfg.bg,
                        border: `2px solid ${cfg.border}`,
                      }}>
                      {/* Indicators */}
                      {hasReady   && <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" title="Ready to serve" />}
                      {hasPending && !hasReady && <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" title="Order pending" />}
                      {status === 'bill-requested' && <div className="absolute top-2 right-8 w-2.5 h-2.5 rounded-full bg-orange-500" />}

                      <div className="font-serif font-bold text-xl mb-1" style={{ color: cfg.text }}>
                        {table.number}
                      </div>
                      <div className="text-[10px] text-gray-500 mb-2">
                        {table.seats} seats
                      </div>

                      {session ? (
                        <>
                          <div className="flex items-center gap-1 text-xs mb-1" style={{ color: cfg.text }}>
                            <Users size={10} />
                            <span className="font-semibold">{session.covers} guests</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock size={10} />
                            <span>{elapsed(session.startTime)}</span>
                          </div>
                          {bill && bill.total > 0 && (
                            <div className="mt-2 text-xs font-serif font-bold" style={{ color: 'var(--primary)' }}>
                              ₹{bill.total.toFixed(0)}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-xs font-semibold" style={{ color: cfg.text }}>{cfg.label}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {Object.entries(TABLE_STATUS).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-3 h-3 rounded-full" style={{ background: cfg.dot }} />
                {cfg.label}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" /> Ready to Serve
            </div>
          </div>
        </div>
      )}

      {activeTab === 'menu' && (
        <MenuManager recipes={recipes} onToggleVisible={toggleVisible} onToggleAvailable={toggleAvailable} />
      )}

      {selectedTable && (
        <TableDetail table={selectedTable} onClose={() => setSelectedTable(null)} />
      )}
    </div>
  )
}
