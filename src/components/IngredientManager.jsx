import React, { useState, useMemo } from 'react'
import { Plus, Trash2, Edit3, Search, X, Save, AlertTriangle, CalendarClock, Package2 } from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

const CATEGORIES = ['Bakery', 'Meat', 'Produce', 'Dairy', 'Beverages', 'Pantry', 'Condiments', 'Seafood', 'Other']
const UNITS      = ['pcs', 'kg', 'g', 'L', 'mL', 'cans', 'boxes', 'bottles', 'bags']
const PACK_TYPES = ['bag', 'box', 'pouch', 'packet', 'bottle', 'can', 'tin', 'carton', 'sack', 'bundle']

function IngredientModal({ ingredient, onClose, onSave, vendors }) {
  const [form, setForm] = useState(ingredient || {
    name: '', unit: 'kg', currentStock: '', parLevel: '', costPerUnit: '',
    category: 'Produce', vendorId: vendors[0]?.id || '', sku: '',
    packType: 'bag', packSize: '', packUnit: 'kg', packPrice: '',
    mfgDate: '', expiryDate: '', batchNo: '', fssaiNo: '', tolerance: 3
  })

  const set = (k, v) => {
    setForm(f => {
      const next = { ...f, [k]: v }
      if (k === 'packPrice' || k === 'packSize') {
        const ps = parseFloat(k === 'packSize'  ? v : next.packSize)  || 0
        const pp = parseFloat(k === 'packPrice' ? v : next.packPrice) || 0
        if (ps > 0) next.costPerUnit = parseFloat((pp / ps).toFixed(4))
      }
      return next
    })
  }

  const today = new Date().toISOString().split('T')[0]

  const expiryStatus = () => {
    if (!form.expiryDate) return null
    const diff = Math.round((new Date(form.expiryDate) - new Date(today)) / 86400000)
    if (diff < 0)  return { label: 'Expired',        cls: 'bg-red-100 text-red-700 border border-red-300' }
    if (diff <= 7) return { label: `Expires in ${diff}d`, cls: 'bg-red-100 text-red-700 border border-red-300' }
    if (diff <= 30) return { label: `Expires in ${diff}d`, cls: 'bg-amber-100 text-amber-700 border border-amber-300' }
    return { label: `Expires in ${diff}d`, cls: 'bg-green-100 text-green-700 border border-green-300' }
  }
  const expStatus = expiryStatus()

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-gold-lg w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="bg-executive-dark px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="font-serif text-lg font-semibold text-white">
            {ingredient ? 'Edit Ingredient' : 'New Ingredient'}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Basic Info */}
          <div>
            <p className="text-xs font-semibold text-executive-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Package2 size={13} /> Basic Details
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label-gold">Ingredient Name</label>
                <input className="input-gold" placeholder="e.g. Basmati Rice" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                <label className="label-gold">SKU Code</label>
                <input className="input-gold" placeholder="e.g. RCE-001" value={form.sku || ''} onChange={e => set('sku', e.target.value)} />
              </div>
              <div>
                <label className="label-gold">Category</label>
                <select className="select-gold" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label-gold">Unit of Measure</label>
                <select className="select-gold" value={form.unit} onChange={e => set('unit', e.target.value)}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="label-gold">Tolerance (%)</label>
                <input className="input-gold" type="number" min="0" max="20" step="0.5" value={form.tolerance ?? 3} onChange={e => set('tolerance', parseFloat(e.target.value) || 3)} />
              </div>
              <div>
                <label className="label-gold">Current Stock</label>
                <input className="input-gold" type="number" step="0.001" min="0" placeholder="0" value={form.currentStock} onChange={e => set('currentStock', parseFloat(e.target.value) || '')} />
              </div>
              <div>
                <label className="label-gold">Par Level (Min Stock)</label>
                <input className="input-gold" type="number" step="0.001" min="0" placeholder="0" value={form.parLevel} onChange={e => set('parLevel', parseFloat(e.target.value) || '')} />
              </div>
              <div className="col-span-2">
                <label className="label-gold">Preferred Vendor</label>
                <select className="select-gold" value={form.vendorId} onChange={e => set('vendorId', parseInt(e.target.value))}>
                  <option value="">— Select Vendor —</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Pack Details */}
          <div className="border-t border-gold-100 pt-5">
            <p className="text-xs font-semibold text-executive-muted uppercase tracking-wider mb-3">Standard Pack Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-gold">Pack Type</label>
                <select className="select-gold" value={form.packType || 'bag'} onChange={e => set('packType', e.target.value)}>
                  {PACK_TYPES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label-gold">Pack Unit</label>
                <select className="select-gold" value={form.packUnit || 'kg'} onChange={e => set('packUnit', e.target.value)}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="label-gold">Standard Pack Size</label>
                <input className="input-gold" type="number" step="0.001" min="0" placeholder="e.g. 25 (kg per bag)" value={form.packSize || ''} onChange={e => set('packSize', e.target.value)} />
              </div>
              <div>
                <label className="label-gold">Pack Price (₹)</label>
                <input className="input-gold" type="number" step="0.01" min="0" placeholder="e.g. 1250" value={form.packPrice || ''} onChange={e => set('packPrice', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="label-gold">Cost Per Unit (₹) — auto-calculated</label>
                <div className="relative">
                  <input
                    className="input-gold bg-gold-50 font-semibold text-gold-800"
                    type="number" step="0.0001" min="0"
                    placeholder="Auto from pack size ÷ pack price"
                    value={form.costPerUnit || ''}
                    onChange={e => set('costPerUnit', parseFloat(e.target.value) || '')}
                  />
                  {form.packSize && form.packPrice && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gold-600">
                      ₹{form.packPrice} ÷ {form.packSize}{form.packUnit}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* FSSAI & Lot Details */}
          <div className="border-t border-gold-100 pt-5">
            <p className="text-xs font-semibold text-executive-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <CalendarClock size={13} /> FSSAI & Lot Details
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-gold">Batch / Lot Number</label>
                <input className="input-gold" placeholder="e.g. LOT-2024-001" value={form.batchNo || ''} onChange={e => set('batchNo', e.target.value)} />
              </div>
              <div>
                <label className="label-gold">FSSAI Number</label>
                <input className="input-gold" placeholder="14-digit FSSAI number" maxLength={14} value={form.fssaiNo || ''} onChange={e => set('fssaiNo', e.target.value)} />
              </div>
              <div>
                <label className="label-gold">Manufacturing Date</label>
                <input className="input-gold" type="date" value={form.mfgDate || ''} onChange={e => set('mfgDate', e.target.value)} />
              </div>
              <div>
                <label className="label-gold">Expiry Date</label>
                <input className="input-gold" type="date" value={form.expiryDate || ''} onChange={e => set('expiryDate', e.target.value)} />
              </div>
              {expStatus && (
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${expStatus.cls}`}>
                    <CalendarClock size={12} /> {expStatus.label}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gold-100 px-6 py-4 flex justify-between bg-gray-50 flex-shrink-0">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button className="btn-gold" onClick={() => {
            if (!form.name.trim()) return alert('Name required')
            onSave(form)
          }}>
            <Save size={16} /> Save Ingredient
          </button>
        </div>
      </div>
    </div>
  )
}

function expiryBadge(expiryDate) {
  if (!expiryDate) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const exp   = new Date(expiryDate); exp.setHours(0,0,0,0)
  const diff  = Math.round((exp - today) / 86400000)
  if (diff < 0)   return <span className="badge-red text-[10px]">Expired</span>
  if (diff <= 7)  return <span className="badge-red text-[10px]">{diff}d left</span>
  if (diff <= 30) return <span className="badge-amber text-[10px]">{diff}d left</span>
  return null
}

export default function IngredientManager() {
  const { ingredients, vendors, addIngredient, updateIngredient, deleteIngredient } = useInventory()
  const [modal,        setModal]        = useState(null)
  const [search,       setSearch]       = useState('')
  const [filterCat,    setFilterCat]    = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  const today = new Date(); today.setHours(0,0,0,0)

  const filtered = useMemo(() => ingredients.filter(i => {
    const matchSearch  = i.name.toLowerCase().includes(search.toLowerCase()) || (i.sku || '').toLowerCase().includes(search.toLowerCase())
    const matchCat     = filterCat === 'All' || i.category === filterCat
    const expDiff      = i.expiryDate ? Math.round((new Date(i.expiryDate) - today) / 86400000) : Infinity
    const matchStatus  = filterStatus === 'All'
      || (filterStatus === 'Low'     && i.currentStock <= i.parLevel)
      || (filterStatus === 'OK'      && i.currentStock > i.parLevel)
      || (filterStatus === 'Expiring' && expDiff <= 30)
    return matchSearch && matchCat && matchStatus
  }), [ingredients, search, filterCat, filterStatus])

  const totalValue  = useMemo(() => ingredients.reduce((s, i) => s + i.currentStock * i.costPerUnit, 0), [ingredients])
  const lowCount    = ingredients.filter(i => i.currentStock <= i.parLevel).length
  const expiringCnt = ingredients.filter(i => {
    if (!i.expiryDate) return false
    const diff = Math.round((new Date(i.expiryDate) - today) / 86400000)
    return diff <= 30
  }).length

  const handleSave = (form) => {
    if (modal === 'new') addIngredient(form)
    else updateIngredient(modal.id, form)
    setModal(null)
  }

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Ingredient Manager</h1>
          <p className="page-subtitle">Manage ingredients, pack details, FSSAI compliance and expiry tracking</p>
        </div>
        <button className="btn-gold" onClick={() => setModal('new')}>
          <Plus size={16} /> New Ingredient
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-4 gap-4">
        <div className="gold-card p-4 text-center">
          <p className="text-2xl font-serif font-bold text-executive-dark">{ingredients.length}</p>
          <p className="text-xs text-executive-muted mt-1">Total Ingredients</p>
        </div>
        <div className={`gold-card p-4 text-center ${lowCount > 0 ? 'border-red-200 bg-red-50' : ''}`}>
          <p className={`text-2xl font-serif font-bold ${lowCount > 0 ? 'text-red-600' : 'text-executive-dark'}`}>{lowCount}</p>
          <p className="text-xs text-executive-muted mt-1">Below Par Level</p>
        </div>
        <div className={`gold-card p-4 text-center ${expiringCnt > 0 ? 'border-amber-200 bg-amber-50' : ''}`}>
          <p className={`text-2xl font-serif font-bold ${expiringCnt > 0 ? 'text-amber-600' : 'text-executive-dark'}`}>{expiringCnt}</p>
          <p className="text-xs text-executive-muted mt-1">Expiring ≤30 days</p>
        </div>
        <div className="gold-card p-4 text-center">
          <p className="text-2xl font-serif font-bold text-executive-dark">₹{totalValue.toFixed(0)}</p>
          <p className="text-xs text-executive-muted mt-1">Total Stock Value</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-gold pl-9" placeholder="Search name or SKU…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select-gold w-auto" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option>All</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="select-gold w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>All</option>
          <option>Low</option>
          <option>OK</option>
          <option>Expiring</option>
        </select>
      </div>

      {/* Table */}
      <div className="gold-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-gold">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Pack Info</th>
                <th>Cost/Unit</th>
                <th>Current Stock</th>
                <th>Par Level</th>
                <th>Stock Value</th>
                <th>Vendor</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ing => {
                const vendor     = vendors.find(v => v.id === ing.vendorId)
                const stockValue = ing.currentStock * ing.costPerUnit
                const isLow      = ing.currentStock <= ing.parLevel
                const stockPct   = Math.min(100, (ing.currentStock / (ing.parLevel * 2 || 1)) * 100)
                const expBadge   = expiryBadge(ing.expiryDate)
                return (
                  <tr key={ing.id}>
                    <td className="font-mono text-xs text-executive-muted">{ing.sku || '—'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {isLow && <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />}
                        <span className="font-medium text-executive-dark">{ing.name}</span>
                      </div>
                    </td>
                    <td><span className="badge-gold">{ing.category}</span></td>
                    <td className="text-executive-muted">{ing.unit}</td>
                    <td className="text-xs text-executive-muted">
                      {ing.packSize ? (
                        <span>{ing.packSize}{ing.packUnit} {ing.packType}<br/>
                          <span className="text-gold-700 font-semibold">₹{ing.packPrice || '—'}/pack</span>
                        </span>
                      ) : '—'}
                    </td>
                    <td>₹{(ing.costPerUnit || 0).toFixed(3)}</td>
                    <td>
                      <div>
                        <span className={`font-semibold ${isLow ? 'text-red-600' : 'text-executive-dark'}`}>
                          {ing.currentStock}
                        </span>
                        <div className="w-16 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full rounded-full ${isLow ? 'bg-red-400' : 'bg-green-400'}`} style={{ width: `${stockPct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="text-executive-muted">{ing.parLevel}</td>
                    <td className="font-semibold text-executive-dark">₹{stockValue.toFixed(2)}</td>
                    <td className="text-executive-muted text-xs">{vendor?.name || '—'}</td>
                    <td>
                      <div className="flex flex-col gap-0.5">
                        {expBadge || <span className="text-xs text-executive-muted">{ing.expiryDate || '—'}</span>}
                        {ing.batchNo && <span className="text-[10px] text-executive-muted">{ing.batchNo}</span>}
                      </div>
                    </td>
                    <td>
                      <span className={isLow ? 'badge-red' : 'badge-green'}>
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => setModal(ing)} className="btn-ghost p-1.5" title="Edit">
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete ingredient?')) deleteIngredient(ing.id) }}
                          className="btn-ghost p-1.5 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={13} className="text-center py-12 text-executive-muted">
                    No ingredients match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <IngredientModal
          ingredient={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          vendors={vendors}
        />
      )}
    </div>
  )
}
