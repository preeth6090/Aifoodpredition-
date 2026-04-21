import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  DollarSign, AlertTriangle, TrendingUp, ShoppingCart, Package,
  ArrowRight, CheckCircle, Clock, Zap
} from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

const GOLD_PALETTE = ['#C9A84C', '#F0D060', '#A8882E', '#E2B254', '#84681C']

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-executive-dark text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-gold-500/30">
      <p className="font-semibold text-gold-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i}>{p.name}: <span className="text-gold-300">{prefix}{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span></p>
      ))}
    </div>
  )
}

function KPICard({ title, value, subtitle, icon: Icon, iconColor, trend, onClick }) {
  return (
    <div className={`kpi-card ${onClick ? 'cursor-pointer hover:shadow-gold transition-shadow' : ''}`} onClick={onClick}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-executive-muted uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-serif font-bold text-executive-dark mt-1">{value}</p>
          {subtitle && <p className="text-xs text-executive-muted mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
          <Icon size={20} />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
          {Math.abs(trend).toFixed(1)}% vs yesterday
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { ingredients, getDashboardStats, generatePurchaseOrder, notifications } = useInventory()
  const navigate = useNavigate()

  const stats = useMemo(() => getDashboardStats(), [getDashboardStats])

  const lowStockItems = ingredients.filter(i => i.currentStock <= i.parLevel)

  const categoryData = useMemo(() => {
    const groups = {}
    ingredients.forEach(i => {
      groups[i.category] = (groups[i.category] || 0) + i.currentStock * i.costPerUnit
    })
    return Object.entries(groups).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
  }, [ingredients])

  const recentActivity = [
    { action: 'Sale recorded', detail: 'Classic Beef Burger × 25', time: '08:30', icon: Receipt },
    { action: 'Stock updated', detail: 'Burger Bun: 150 pcs', time: '07:45', icon: Package },
    { action: 'PO Approved', detail: 'PO-2026-002 → Prime Meats', time: 'Yesterday', icon: CheckCircle },
    { action: 'Low stock alert', detail: 'Lettuce below par level', time: 'Yesterday', icon: AlertTriangle },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Stock Value"
          value={`$${stats.totalStockValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`}
          subtitle="Current inventory value"
          icon={DollarSign}
          iconColor="bg-gold-100 text-gold-700"
          trend={2.4}
          onClick={() => navigate('/ingredients')}
        />
        <KPICard
          title="Items Below Par"
          value={stats.itemsBelowPar}
          subtitle={`${lowStockItems.map(i => i.name).slice(0,2).join(', ')}${lowStockItems.length > 2 ? '…' : ''}`}
          icon={AlertTriangle}
          iconColor={stats.itemsBelowPar > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}
          onClick={() => navigate('/purchase-orders')}
        />
        <KPICard
          title="Today's Revenue"
          value={`$${stats.todayRevenue.toFixed(2)}`}
          subtitle={`Food Cost: ${stats.foodCostPct.toFixed(1)}%`}
          icon={TrendingUp}
          iconColor="bg-green-100 text-green-700"
          trend={8.1}
          onClick={() => navigate('/sales')}
        />
        <KPICard
          title="Pending POs"
          value={stats.pendingPOs}
          subtitle="Awaiting approval"
          icon={ShoppingCart}
          iconColor="bg-blue-100 text-blue-700"
          onClick={() => navigate('/purchase-orders')}
        />
      </div>

      {/* Alerts Bar */}
      {lowStockItems.length > 0 && (
        <div className="gold-card p-4 border-l-4 border-l-amber-400 bg-amber-50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">
                  {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} at or below par level
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {lowStockItems.map(i => (
                    <span key={i.id} className="badge-amber">
                      {i.name}: {i.currentStock} {i.unit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              className="btn-gold flex-shrink-0 text-xs"
              onClick={() => generatePurchaseOrder(lowStockItems.map(i => i.id))}
            >
              <Zap size={14} />
              Auto-Generate POs
            </button>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Chart */}
        <div className="lg:col-span-2 gold-card p-5">
          <div className="section-header">
            <div>
              <h2 className="font-serif font-semibold text-executive-dark">Today's Sales by Item</h2>
              <p className="text-xs text-executive-muted">Units sold per menu item</p>
            </div>
            <button onClick={() => navigate('/sales')} className="btn-ghost text-xs">
              View All <ArrowRight size={14} />
            </button>
          </div>
          {stats.salesByRecipe.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.salesByRecipe} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="qty" name="Units Sold" fill="#C9A84C" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-executive-muted text-sm">
              No sales recorded today. <button onClick={() => navigate('/sales')} className="ml-2 text-gold-600 hover:underline">Record a sale</button>
            </div>
          )}
        </div>

        {/* Category Pie */}
        <div className="gold-card p-5">
          <div className="mb-4">
            <h2 className="font-serif font-semibold text-executive-dark">Stock by Category</h2>
            <p className="text-xs text-executive-muted">Value distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={GOLD_PALETTE[i % GOLD_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {categoryData.slice(0,4).map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: GOLD_PALETTE[i % GOLD_PALETTE.length] }} />
                  <span className="text-executive-muted">{d.name}</span>
                </div>
                <span className="font-medium text-executive-dark">${d.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock Table */}
        <div className="gold-card overflow-hidden">
          <div className="section-header px-5 pt-5 pb-0">
            <h2 className="font-serif font-semibold text-executive-dark">Stock Levels</h2>
            <button onClick={() => navigate('/ingredients')} className="btn-ghost text-xs">View All <ArrowRight size={14} /></button>
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="table-gold">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Current</th>
                  <th>Par Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.slice(0, 6).map(ing => {
                  const pct = (ing.currentStock / (ing.parLevel * 2)) * 100
                  const status = ing.currentStock <= ing.parLevel
                    ? { label: 'Low',  cls: 'badge-red' }
                    : pct < 100
                    ? { label: 'OK',   cls: 'badge-amber' }
                    : { label: 'Good', cls: 'badge-green' }
                  return (
                    <tr key={ing.id}>
                      <td className="font-medium text-executive-dark">{ing.name}</td>
                      <td>{ing.currentStock} {ing.unit}</td>
                      <td className="text-executive-muted">{ing.parLevel} {ing.unit}</td>
                      <td><span className={status.cls}>{status.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="gold-card p-5">
          <div className="section-header">
            <h2 className="font-serif font-semibold text-executive-dark">Recent Activity</h2>
            <span className="badge-gold">Live</span>
          </div>
          <div className="space-y-3">
            {[...recentActivity].map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-7 h-7 rounded-lg bg-gold-50 border border-gold-200 flex items-center justify-center flex-shrink-0">
                  <a.icon size={14} className="text-gold-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-executive-dark truncate">{a.action}</p>
                  <p className="text-xs text-executive-muted truncate">{a.detail}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-executive-muted flex-shrink-0">
                  <Clock size={10} />
                  {a.time}
                </div>
              </div>
            ))}
          </div>

          {/* Food Cost Gauge */}
          <div className="mt-4 p-3 bg-executive-cream rounded-xl border border-gold-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-executive-charcoal">Food Cost %</span>
              <span className={`text-sm font-bold ${stats.foodCostPct > 35 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.foodCostPct.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${stats.foodCostPct > 35 ? 'bg-red-400' : 'bg-green-500'}`}
                style={{ width: `${Math.min(100, stats.foodCostPct)}%` }}
              />
            </div>
            <p className="text-[10px] text-executive-muted mt-1">Target: ≤30% | Warning: ≥35%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Local Receipt icon to avoid duplicate imports
function Receipt(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <polyline points="6 2 3 6 3 22 21 22 21 6 18 2"></polyline><line x1="3" y1="6" x2="21" y2="6"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="8" y1="12" x2="16" y2="12"></line><line x1="8" y1="16" x2="16" y2="16"></line>
    </svg>
  )
}
