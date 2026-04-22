import React, { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'
import { TrendingDown, TrendingUp, AlertTriangle, Filter } from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-executive-dark text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-gold-500/30">
      <p className="font-semibold text-gold-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i}>{p.name}: <span className="text-gold-300">{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span></p>
      ))}
    </div>
  )
}

export default function StockVariance() {
  const { getVarianceData, ingredients } = useInventory()
  const [filterType, setFilterType] = useState('All')
  const [sortBy,     setSortBy]     = useState('varianceCost')

  const varianceData = useMemo(() => getVarianceData(), [getVarianceData])

  const filtered = useMemo(() => {
    let data = [...varianceData]
    if (filterType === 'Surplus')   data = data.filter(d => d.variance < 0)
    if (filterType === 'Shortage')  data = data.filter(d => d.variance > 0)
    if (filterType === 'OK')        data = data.filter(d => Math.abs(d.variancePct) < 2)
    data.sort((a, b) => Math.abs(b[sortBy]) - Math.abs(a[sortBy]))
    return data
  }, [varianceData, filterType, sortBy])

  const totals = useMemo(() => ({
    totalShortage:    varianceData.filter(d => d.variance > 0).reduce((s, d) => s + d.varianceCost, 0),
    totalSurplus:     varianceData.filter(d => d.variance < 0).reduce((s, d) => s + d.varianceCost, 0),
    weightedVariance: varianceData.reduce((s, d) => s + Math.abs(d.variancePct), 0) / (varianceData.length || 1),
    highRiskCount:    varianceData.filter(d => Math.abs(d.variancePct) > 10).length,
  }), [varianceData])

  const chartData = filtered.slice(0, 10).map(d => ({
    name: d.name.length > 12 ? d.name.slice(0, 12) + '…' : d.name,
    theoretical: d.theoretical,
    physical:    d.physical,
    variance:    d.variance,
    pct:         d.variancePct,
  }))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="page-title">Variance Analysis</h1>
          <p className="page-subtitle">Theoretical vs Physical stock — detecting wastage and discrepancies</p>
        </div>
        <div className="text-xs text-executive-muted bg-white border border-gold-200 rounded-lg px-3 py-2">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card border-l-4 border-l-red-400">
          <div className="flex items-center gap-2">
            <TrendingDown size={16} className="text-red-500" />
            <span className="text-xs font-semibold text-executive-muted uppercase tracking-wider">Total Shortage</span>
          </div>
          <p className="text-2xl font-serif font-bold text-red-600">₹{totals.totalShortage.toFixed(2)}</p>
          <p className="text-xs text-executive-muted">Theoretical &gt; Physical (Loss)</p>
        </div>
        <div className="kpi-card border-l-4 border-l-blue-400">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            <span className="text-xs font-semibold text-executive-muted uppercase tracking-wider">Total Surplus</span>
          </div>
          <p className="text-2xl font-serif font-bold text-blue-600">₹{totals.totalSurplus.toFixed(2)}</p>
          <p className="text-xs text-executive-muted">Physical &gt; Theoretical (Over-count)</p>
        </div>
        <div className="kpi-card border-l-4 border-l-amber-400">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-xs font-semibold text-executive-muted uppercase tracking-wider">Avg Variance</span>
          </div>
          <p className="text-2xl font-serif font-bold text-amber-600">{totals.weightedVariance.toFixed(1)}%</p>
          <p className="text-xs text-executive-muted">Across all ingredients</p>
        </div>
        <div className="kpi-card border-l-4 border-l-red-600">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600" />
            <span className="text-xs font-semibold text-executive-muted uppercase tracking-wider">High Risk Items</span>
          </div>
          <p className="text-2xl font-serif font-bold text-red-600">{totals.highRiskCount}</p>
          <p className="text-xs text-executive-muted">Variance &gt; 10%</p>
        </div>
      </div>

      {/* Variance Explanation */}
      <div className="gold-card p-4 bg-gold-50 border-gold-300">
        <h3 className="font-serif font-semibold text-executive-dark text-sm mb-2">How Variance is Calculated</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-executive-muted">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-executive-dark">Theoretical Stock</span>
            <span>= Last Physical Count − (All Sales-Driven Depletions since last count)</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-executive-dark">Variance</span>
            <span>= Theoretical − Physical. Positive = shortage (wastage/theft). Negative = surplus (over-count).</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-executive-dark">Variance Cost</span>
            <span>= |Variance| × Cost Per Unit. Represents money lost or unaccounted for.</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="gold-card p-5">
        <div className="section-header">
          <h2 className="font-serif font-semibold text-executive-dark">Theoretical vs Physical Stock (Top 10)</h2>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} />
            <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="theoretical" name="Theoretical" fill="#C9A84C" radius={[3,3,0,0]} />
            <Bar dataKey="physical"    name="Physical"    fill="#1A2540"   radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Variance % Chart */}
      <div className="gold-card p-5">
        <div className="section-header">
          <h2 className="font-serif font-semibold text-executive-dark">Variance % by Ingredient</h2>
          <p className="text-xs text-executive-muted">Red = shortage, Blue = surplus</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} />
            <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="4 4" />
            <Bar dataKey="pct" name="Variance %" radius={[3,3,0,0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.pct > 0 ? '#EF4444' : d.pct < 0 ? '#3B82F6' : '#10B981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {['All', 'Shortage', 'Surplus', 'OK'].map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === f ? 'bg-gold-500 text-white' : 'bg-white border border-gray-200 text-executive-muted hover:border-gold-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <select className="select-gold w-auto ml-auto" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="varianceCost">Sort by Cost</option>
          <option value="variancePct">Sort by %</option>
          <option value="variance">Sort by Quantity</option>
        </select>
      </div>

      {/* Detail Table */}
      <div className="gold-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-gold">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Unit</th>
                <th>Theoretical</th>
                <th>Physical (Actual)</th>
                <th>Variance (Qty)</th>
                <th>Variance (%)</th>
                <th>Cost Impact</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const risk = Math.abs(d.variancePct) > 15 ? 'High'
                           : Math.abs(d.variancePct) > 5  ? 'Medium' : 'Low'
                const riskCls = risk === 'High' ? 'badge-red' : risk === 'Medium' ? 'badge-amber' : 'badge-green'
                return (
                  <tr key={d.id}>
                    <td className="font-medium text-executive-dark">{d.name}</td>
                    <td className="text-executive-muted">{d.unit}</td>
                    <td className="font-mono">{d.theoretical.toFixed(2)}</td>
                    <td className="font-mono">{d.physical.toFixed(2)}</td>
                    <td className={`font-mono font-semibold ${d.variance > 0 ? 'text-red-600' : d.variance < 0 ? 'text-blue-600' : 'text-green-600'}`}>
                      {d.variance > 0 ? '+' : ''}{d.variance.toFixed(3)}
                    </td>
                    <td>
                      <span className={`font-semibold ${Math.abs(d.variancePct) > 10 ? 'text-red-600' : 'text-executive-dark'}`}>
                        {d.variancePct > 0 ? '+' : ''}{d.variancePct.toFixed(1)}%
                      </span>
                    </td>
                    <td className={`font-semibold ${d.variance > 0 ? 'text-red-600' : 'text-executive-dark'}`}>
                      ₹{d.varianceCost.toFixed(2)}
                    </td>
                    <td><span className={riskCls}>{risk}</span></td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gold-50 border-t-2 border-gold-200">
                <td colSpan={6} className="px-4 py-3 font-semibold text-executive-dark">Total Variance Cost</td>
                <td className="px-4 py-3 font-bold text-red-600">
                  ₹{filtered.filter(d => d.variance > 0).reduce((s, d) => s + d.varianceCost, 0).toFixed(2)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
