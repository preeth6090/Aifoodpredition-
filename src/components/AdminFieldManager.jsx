import React, { useState } from 'react'
import { Plus, Trash2, Edit3, X, Save, ToggleLeft, ToggleRight, Settings, Eye, EyeOff } from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

const FIELD_TYPES = ['text', 'number', 'select', 'date', 'boolean', 'textarea']
const TABLES      = ['ingredients', 'recipes', 'vendors', 'purchase_orders']

function FieldModal({ field, onClose, onSave }) {
  const [form, setForm] = useState(field || {
    tableName: 'ingredients', fieldName: '', label: '', fieldType: 'text', isMandatory: false, isVisible: true
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-gold-lg w-full max-w-md overflow-hidden">
        <div className="bg-executive-dark px-6 py-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-white">
            {field ? 'Edit Custom Field' : 'New Custom Field'}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="label-gold">Target Table</label>
            <select className="select-gold" value={form.tableName} onChange={e => set('tableName', e.target.value)}>
              {TABLES.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div>
            <label className="label-gold">Field Label (Display Name)</label>
            <input className="input-gold" placeholder="e.g. Allergen Info" value={form.label} onChange={e => {
              const label = e.target.value
              const fieldName = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
              set('label', label)
              if (!field) set('fieldName', fieldName)
            }} />
          </div>
          <div>
            <label className="label-gold">Field Key (auto-generated)</label>
            <input className="input-gold bg-gray-50 text-executive-muted font-mono text-xs" value={form.fieldName} onChange={e => set('fieldName', e.target.value)} />
          </div>
          <div>
            <label className="label-gold">Field Type</label>
            <select className="select-gold" value={form.fieldType} onChange={e => set('fieldType', e.target.value)}>
              {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => set('isMandatory', !form.isMandatory)}
                className={`w-10 h-6 rounded-full transition-colors ${form.isMandatory ? 'bg-gold-500' : 'bg-gray-200'} relative`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isMandatory ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm text-executive-charcoal font-medium">Mandatory</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => set('isVisible', !form.isVisible)}
                className={`w-10 h-6 rounded-full transition-colors ${form.isVisible ? 'bg-blue-500' : 'bg-gray-200'} relative`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isVisible ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm text-executive-charcoal font-medium">Visible</span>
            </label>
          </div>
        </div>

        <div className="border-t border-gold-100 px-6 py-4 flex justify-between bg-gray-50">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button className="btn-gold" onClick={() => {
            if (!form.label.trim() || !form.fieldName.trim()) return alert('Label and key are required')
            onSave(form)
          }}>
            <Save size={16} /> Save Field
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminFieldManager() {
  const { customFields, addCustomField, updateCustomField, deleteCustomField } = useInventory()
  const [modal,       setModal]     = useState(null)
  const [filterTable, setFilterTable] = useState('All')

  const handleSave = (form) => {
    if (modal === 'new') addCustomField(form)
    else updateCustomField(modal.id, form)
    setModal(null)
  }

  const filtered = customFields.filter(f => filterTable === 'All' || f.tableName === filterTable)

  const groupedByTable = TABLES.reduce((acc, t) => {
    acc[t] = customFields.filter(f => f.tableName === t)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Admin Field Manager</h1>
          <p className="page-subtitle">Add custom columns to any table and control mandatory status</p>
        </div>
        <button className="btn-gold" onClick={() => setModal('new')}>
          <Plus size={16} /> Add Custom Field
        </button>
      </div>

      {/* Warning */}
      <div className="gold-card p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <Settings size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <p className="font-semibold mb-1">How Custom Fields Work</p>
            <p>Fields marked <strong>Mandatory</strong> will be required when adding/editing records. Fields marked <strong>Visible</strong> appear in the UI. In the full deployment, these map to actual PostgreSQL columns via the Admin API.</p>
          </div>
        </div>
      </div>

      {/* Table filter */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...TABLES].map(t => (
          <button
            key={t}
            onClick={() => setFilterTable(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterTable === t ? 'bg-gold-500 text-white' : 'bg-white border border-gray-200 text-executive-muted hover:border-gold-300'
            }`}
          >
            {t === 'All' ? 'All Tables' : t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Fields Table */}
      <div className="gold-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-gold">
            <thead>
              <tr>
                <th>Table</th>
                <th>Label</th>
                <th>Field Key</th>
                <th>Type</th>
                <th>Mandatory</th>
                <th>Visible</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(field => (
                <tr key={field.id}>
                  <td>
                    <span className="badge-blue text-[10px]">
                      {field.tableName.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="font-medium text-executive-dark">{field.label}</td>
                  <td className="font-mono text-xs text-executive-muted">{field.fieldName}</td>
                  <td><span className="badge-gray">{field.fieldType}</span></td>
                  <td>
                    <button
                      onClick={() => updateCustomField(field.id, { isMandatory: !field.isMandatory })}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${field.isMandatory ? 'text-red-600' : 'text-gray-400'}`}
                    >
                      {field.isMandatory ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      {field.isMandatory ? 'Required' : 'Optional'}
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => updateCustomField(field.id, { isVisible: !field.isVisible })}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${field.isVisible ? 'text-blue-600' : 'text-gray-400'}`}
                    >
                      {field.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                      {field.isVisible ? 'Shown' : 'Hidden'}
                    </button>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setModal(field)} className="btn-ghost p-1.5"><Edit3 size={14} /></button>
                      <button onClick={() => { if (confirm('Delete this field?')) deleteCustomField(field.id) }} className="btn-ghost p-1.5 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-executive-muted">No custom fields yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-Table Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {TABLES.map(t => (
          <div key={t} className="gold-card p-4">
            <p className="text-xs font-semibold text-executive-muted uppercase tracking-wider mb-2">
              {t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </p>
            <p className="text-2xl font-serif font-bold text-executive-dark">{groupedByTable[t].length}</p>
            <p className="text-xs text-executive-muted mt-1">
              {groupedByTable[t].filter(f => f.isMandatory).length} mandatory,{' '}
              {groupedByTable[t].filter(f => !f.isVisible).length} hidden
            </p>
          </div>
        ))}
      </div>

      {modal && (
        <FieldModal
          field={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
