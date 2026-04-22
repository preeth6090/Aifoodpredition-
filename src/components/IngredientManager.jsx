import React, { useState, useMemo } from 'react'
import { Plus, Trash2, Edit3, Search, X, Save, Filter, AlertTriangle } from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

const CATEGORIES   = ['Bakery', 'Meat', 'Produce', 'Dairy', 'Beverages', 'Pantry', 'Condiments', 'Seafood', 'Other']
const UNITS        = ['pcs', 'kg', 'g', 'L', 'mL', 'cans', 'boxes', 'bottles', 'bags']

function IngredientModal({ ingredient, onClose, onSave, vendors }) {
  const [form, setForm] = useState(ingredient || {
    name: '', unit: 'pcs', currentStock: '', parLevel: '', costPerUnit: '',
    category: 'Produce', vendorId: vendors[0]?.id || '', sku: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-gold-lg w-full max-w-lg overflow-hidden">
        <div className="bg-executive-dark px-6 py-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-white">
            {ingredient ? 'Edit Ingredient' : 'New Ingredient'}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label-gold">Ingredient Name</label>
              <input className="input-gold" placeholder="e.g. Burger Bun" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="label-gold">SKU Code</label>
              <input className="input-gold" placeholder="e.g. BKR-001" value={form.sku || ''} onChange={e => set('sku', e.target.value)} />
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
              <label className="label-gold">Cost Per Unit (₹)</label>
              <input className="input-gold" type="number" step="0.001" min="0" placeholder="0.000" value={form.costPerUnit} onChange={e => set('costPerUnit', parseFloat(e.target.value) || '')} />
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

        <div className="border-t border-gold-100 px-6 py-4 flex justify-between bg-gray-50">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button className="btn-gold" onClick={() => {
            if (!form.name.trim()) return alert('Name required')
            onSave(form)
          }}>
            <Save size={16} /> Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default function IngredientManager() {
  const { ingredients, vendors, addIngredient, updateIngredient, deleteIngredient } = useInventory()
  const [modal,     setModal]     = useState(null)
  const [search,    setSearch]    = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  const filtered = useMemo(() => ingredients.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || (i.sku || '').toLowerCase().includes(search.toLowerCase())
    const matchCat    = filterCat === 'All' || i.category === filterCat
    const matchStatus = filterStatus === 'All'
      || (filterStatus === 'Low'  && i.currentStock <= i.parLevel)
      || (filterStatus === 'OK'   && i.currentStock > i.parLevel)
    return matchSearch && matchCat && matchStatus
  }), [ingredients, search, filterCat, filterStatus])

  const totalValue = useMemo(() => ingredients.reduce((s, i) => s + i.currentStock * i.costPerUnit, 0), [ingredients])
  const lowCount   = ingredients.filter(i => i.currentStock <= i.parLevel).length

  const handleSave = (form) => {
    if (modal === 'new') addIngredient(form)
    else updateIngredient(modal.id, form)
    setModal(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="page-title">Ingredient Manager</h1>
          <p className="page-subtitle">Manage your master ingredient list, par levels and costs</p>
        </div>
        <button className="btn-gold" onClick={() => setModal('new')}>
          <Plus size={16} /> New Ingredient
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="gold-card p-4 text-center">
          <p className="text-2xl font-serif font-bold text-executive-dark">{ingredients.length}</p>
          <p className="text-xs text-executive-muted mt-1">Total Ingredients</p>
        </div>
        <div className={`gold-card p-4 text-center ${lowCount > 0 ? 'border-red-200 bg-red-50' : ''}`}>
          <p className={`text-2xl font-serif font-bold ${lowCount > 0 ? 'text-red-600' : 'text-executive-dark'}`}>{lowCount}</p>
          <p className="text-xs text-executive-muted mt-1">Below Par Level</p>
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
                <th>Current Stock</th>
                <th>Par Level</th>
                <th>Cost/Unit</th>
                <th>Stock Value</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ing => {
                const vendor      = vendors.find(v => v.id === ing.vendorId)
                const stockValue  = ing.currentStock * ing.costPerUnit
                const isLow       = ing.currentStock <= ing.parLevel
                const stockPct    = Math.min(100, (ing.currentStock / (ing.parLevel * 2)) * 100)
                return (
                  <tr key={ing.id}>
                    <td className="font-mono text-xs text-executive-muted">{ing.sku || '—'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {isLow && <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />}
                        <span className="font-medium text-executive-dark">{ing.name}</span>
                      </div>
                    </td>
                    <td><span className="badge-gold">{ing.category}</span></td>
                    <td className="text-executive-muted">{ing.unit}</td>
                    <td>
                      <div>
                        <span className={`font-semibold ${isLow ? 'text-red-600' : 'text-executive-dark'}`}>
                          {ing.currentStock}
                        </span>
                        <div className="w-16 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isLow ? 'bg-red-400' : 'bg-green-400'}`}
                            style={{ width: `${stockPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-executive-muted">{ing.parLevel}</td>
                    <td>₹{ing.costPerUnit.toFixed(3)}</td>
                    <td className="font-semibold text-executive-dark">₹{stockValue.toFixed(2)}</td>
                    <td className="text-executive-muted text-xs">{vendor?.name || '—'}</td>
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
                  <td colSpan={11} className="text-center py-12 text-executive-muted">
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
