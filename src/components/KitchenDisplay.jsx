import React, { useState, useEffect } from 'react'
import { Clock, ChefHat, CheckCircle, AlertTriangle, Bell } from 'lucide-react'
import { useTable } from '../context/TableContext'

function elapsed(createdAt) {
  const mins = Math.floor((Date.now() - new Date(createdAt)) / 60000)
  return mins < 60 ? `${mins}m` : `${Math.floor(mins/60)}h ${mins%60}m`
}

function elapsedMins(createdAt) {
  return Math.floor((Date.now() - new Date(createdAt)) / 60000)
}

const STATUS_COLS = [
  { key: 'pending',    label: 'New Orders',    color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', icon: Bell },
  { key: 'preparing',  label: 'Preparing',     color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd', icon: ChefHat },
  { key: 'ready',      label: 'Ready to Serve',color: '#10b981', bg: '#f0fdf4', border: '#6ee7b7', icon: CheckCircle },
]

function KDSCard({ order, onAccept, onMarkReady, onMarkServed }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const mins    = elapsedMins(order.createdAt)
  const isUrgent = mins >= 15

  return (
    <div className={`rounded-2xl overflow-hidden shadow-sm transition-all ${isUrgent && order.status === 'pending' ? 'ring-2 ring-red-400' : ''}`}
      style={{ background: '#ffffff', border: '1px solid #f0f0f0' }}>
      {/* Card Header */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ background: isUrgent && order.status !== 'ready' ? '#fef2f2' : 'var(--th-bg, linear-gradient(135deg,#1A2540,#0F1629))' }}>
        <div>
          <span className="font-serif font-bold text-lg" style={{ color: isUrgent && order.status !== 'ready' ? '#dc2626' : 'var(--th-text, #E2B254)' }}>
            {order.tableId}
          </span>
          <span className="ml-2 text-xs opacity-70" style={{ color: isUrgent && order.status !== 'ready' ? '#dc2626' : 'var(--th-text, #E2B254)' }}>
            Round {order.round}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${isUrgent && order.status !== 'ready' ? 'bg-red-100 text-red-700' : 'bg-white/15 text-white'}`}>
          <Clock size={11} />
          {elapsed(order.createdAt)}
          {isUrgent && order.status !== 'ready' && ' ⚠'}
        </div>
      </div>

      {/* Items */}
      <div className="p-3 space-y-1.5">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              item.status === 'served' ? 'bg-gray-300' :
              item.status === 'ready'  ? 'bg-green-500' :
              item.status === 'preparing' ? 'bg-blue-500 animate-pulse' : 'bg-amber-400'
            }`} />
            <span className={`flex-1 text-sm font-medium ${item.status === 'served' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {item.qty}× {item.name}
            </span>
            {item.notes && <span className="text-xs italic text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{item.notes}</span>}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="px-3 pb-3 pt-1">
        {order.status === 'pending' && (
          <button onClick={() => onAccept(order.id)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            Accept & Start Preparing
          </button>
        )}
        {(order.status === 'preparing' || order.status === 'partially-ready') && (
          <button onClick={() => onMarkReady(order.id)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #10b981, #047857)' }}>
            Mark All Ready
          </button>
        )}
        {order.status === 'ready' && (
          <button onClick={() => onMarkServed(order.id)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6b7280, #374151)' }}>
            Served ✓
          </button>
        )}
      </div>
    </div>
  )
}

export default function KitchenDisplay() {
  const { kitchenOrders, orders, updateOrderStatus } = useTable()
  const [, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const recentServed = orders.filter(o => {
    if (o.status !== 'served') return false
    const mins = elapsedMins(o.createdAt)
    return mins < 60
  })

  const byStatus = (status) => {
    if (status === 'pending')   return kitchenOrders.filter(o => o.status === 'pending')
    if (status === 'preparing') return kitchenOrders.filter(o => o.status === 'preparing' || o.status === 'partially-ready')
    if (status === 'ready')     return kitchenOrders.filter(o => o.status === 'ready')
    return []
  }

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Kitchen Display</h1>
          <p className="page-subtitle">Live order queue — accept, prepare, and mark ready</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 px-3 py-2 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Kitchen Live
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'New',       count: byStatus('pending').length,   color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Preparing', count: byStatus('preparing').length, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Ready',     count: byStatus('ready').length,     color: '#10b981', bg: '#f0fdf4' },
          { label: 'Served Today', count: recentServed.length,       color: '#6b7280', bg: '#f9fafb' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: s.bg, border: `1px solid ${s.color}30` }}>
            <p className="text-3xl font-serif font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* KDS Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {STATUS_COLS.map(col => {
          const colOrders = byStatus(col.key)
          const ColIcon   = col.icon
          return (
            <div key={col.key}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: col.bg, border: `1.5px solid ${col.border}` }}>
                  <ColIcon size={15} style={{ color: col.color }} />
                </div>
                <h2 className="font-serif font-semibold text-executive-dark">{col.label}</h2>
                {colOrders.length > 0 && (
                  <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: col.bg, color: col.color, border: `1px solid ${col.border}` }}>
                    {colOrders.length}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {colOrders.length === 0 && (
                  <div className="rounded-2xl p-8 text-center text-gray-300 border-2 border-dashed border-gray-200">
                    <ColIcon size={24} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs">No orders here</p>
                  </div>
                )}
                {colOrders.map(order => (
                  <KDSCard
                    key={order.id}
                    order={order}
                    onAccept={(id)     => updateOrderStatus(id, 'preparing')}
                    onMarkReady={(id)  => updateOrderStatus(id, 'ready')}
                    onMarkServed={(id) => updateOrderStatus(id, 'served')}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
