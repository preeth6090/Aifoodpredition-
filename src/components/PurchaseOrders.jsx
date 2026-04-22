import React, { useState, useMemo } from 'react'
import { Plus, Check, Trash2, Package, Mail, X, Save, ChevronDown, ChevronRight, Eye } from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

const STATUS_CONFIG = {
  draft:    { label: 'Draft',    cls: 'badge-gray' },
  pending:  { label: 'Pending',  cls: 'badge-amber' },
  approved: { label: 'Approved', cls: 'badge-blue' },
  received: { label: 'Received', cls: 'badge-green' },
  rejected: { label: 'Rejected', cls: 'badge-red' },
}

function PODetail({ po, onClose, onApprove, onReceive, onDelete, vendors, ingredients }) {
  const vendor = vendors.find(v => v.id === po.vendorId)
  const total  = po.items.reduce((s, i) => s + i.quantity * i.unitCost, 0)

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-gold-lg w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-executive-dark px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold text-white">{po.id}</h2>
            <p className="text-xs text-gold-400 mt-0.5">Purchase Order Details</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Vendor Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="gold-card p-4">
              <p className="text-xs text-executive-muted font-semibold uppercase tracking-wider mb-1">Vendor</p>
              <p className="font-semibold text-executive-dark">{vendor?.name || 'Unknown'}</p>
              <p className="text-xs text-executive-muted">{vendor?.email}</p>
              <p className="text-xs text-executive-muted">{vendor?.phone}</p>
            </div>
            <div className="gold-card p-4">
              <p className="text-xs text-executive-muted font-semibold uppercase tracking-wider mb-1">Order Info</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-executive-muted">Status</span>
                  <span className={STATUS_CONFIG[po.status]?.cls}>{STATUS_CONFIG[po.status]?.label}</span>
                </div>
                <div className="flex justify-between"><span className="text-executive-muted">Created</span><span>{po.createdAt}</span></div>
                {po.approvedAt && <div className="flex justify-between"><span className="text-executive-muted">Approved</span><span>{po.approvedAt}</span></div>}
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-serif font-semibold text-executive-dark mb-3">Order Items</h3>
            <table className="table-gold w-full">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Unit Cost</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {po.items.map((item, i) => {
                  const ing = ingredients.find(ing => ing.id === item.ingredientId)
                  return (
                    <tr key={i}>
                      <td className="font-medium">{ing?.name || 'Unknown'}</td>
                      <td>{item.quantity}</td>
                      <td className="text-executive-muted">{ing?.unit || '—'}</td>
                      <td>₹{item.unitCost.toFixed(3)}</td>
                      <td className="font-semibold">₹{(item.quantity * item.unitCost).toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gold-50 border-t-2 border-gold-200">
                  <td colSpan={4} className="px-4 py-3 font-bold text-executive-dark">Total</td>
                  <td className="px-4 py-3 font-bold text-gold-700">₹{total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {po.notes && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <strong>Notes:</strong> {po.notes}
            </div>
          )}
        </div>

        <div className="border-t border-gold-100 px-6 py-4 flex items-center justify-between bg-gray-50">
          <button onClick={onClose} className="btn-ghost">Close</button>
          <div className="flex gap-2">
            {(po.status === 'draft' || po.status === 'pending') && (
              <button className="btn-gold" onClick={() => { onApprove(po.id); onClose() }}>
                <Check size={16} /> Approve & Send Email
              </button>
            )}
            {po.status === 'approved' && (
              <button className="btn-gold" onClick={() => { onReceive(po.id); onClose() }}>
                <Package size={16} /> Mark as Received
              </button>
            )}
            {po.status !== 'received' && (
              <button className="btn-danger" onClick={() => { if (confirm('Delete this PO?')) { onDelete(po.id); onClose() } }}>
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function NewPOModal({ onClose, onSave, vendors, ingredients }) {
  const [vendorId, setVendorId] = useState(vendors[0]?.id || '')
  const [items, setItems]       = useState([{ ingredientId: ingredients[0]?.id || 1, quantity: 1, unitCost: ingredients[0]?.costPerUnit || 0 }])
  const [notes, setNotes]       = useState('')

  const addItem = () => setItems(i => [...i, { ingredientId: ingredients[0]?.id, quantity: 1, unitCost: ingredients[0]?.costPerUnit || 0 }])
  const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx))
  const updateItem = (idx, field, value) => setItems(prev => {
    const updated = [...prev]
    if (field === 'ingredientId') {
      const ing = ingredients.find(i => i.id === parseInt(value))
      updated[idx] = { ...updated[idx], ingredientId: parseInt(value), unitCost: ing?.costPerUnit || 0 }
    } else {
      updated[idx] = { ...updated[idx], [field]: parseFloat(value) || 0 }
    }
    return updated
  })

  const total = items.reduce((s, i) => s + i.quantity * i.unitCost, 0)

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-gold-lg w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-executive-dark px-6 py-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-white">New Purchase Order</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="label-gold">Vendor</label>
            <select className="select-gold" value={vendorId} onChange={e => setVendorId(parseInt(e.target.value))}>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label-gold mb-0">Order Items</label>
              <button className="btn-outline text-xs" onClick={addItem}><Plus size={14} /> Add Item</button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded-lg">
                  <div className="col-span-5">
                    <select className="select-gold" value={item.ingredientId} onChange={e => updateItem(idx, 'ingredientId', e.target.value)}>
                      {ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input className="input-gold" type="number" min="0" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                  </div>
                  <div className="col-span-3">
                    <input className="input-gold" type="number" step="0.001" min="0" placeholder="Unit Cost" value={item.unitCost} onChange={e => updateItem(idx, 'unitCost', e.target.value)} />
                  </div>
                  <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label-gold">Notes</label>
            <textarea className="input-gold resize-none" rows={2} placeholder="Optional notes…" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div className="flex justify-between items-center p-3 bg-gold-50 rounded-xl border border-gold-200">
            <span className="font-semibold text-executive-dark text-sm">Order Total</span>
            <span className="font-bold text-gold-700 text-lg">₹{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-gold-100 px-6 py-4 flex justify-between bg-gray-50">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button className="btn-gold" onClick={() => {
            onSave({ vendorId, items, notes, status: 'pending' })
            onClose()
          }}>
            <Save size={16} /> Create PO
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PurchaseOrders() {
  const { purchaseOrders, vendors, ingredients, approvePurchaseOrder, deletePurchaseOrder, receiveOrder, setPurchaseOrders } = useInventory()
  const [detail,   setDetail]   = useState(null)
  const [newModal, setNewModal]  = useState(false)
  const [filterStatus, setFilterStatus] = useState('All')

  const addPO = (data) => {
    const newPO = {
      ...data,
      id: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
      approvedAt: null,
    }
    // We access context directly for this
    window.__addPO?.(newPO)
  }

  const { addNotification } = useInventory()
  const handleCreate = (data) => {
    const newPO = {
      ...data,
      id: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
      approvedAt: null,
    }
    addNotification('info', `Purchase Order ${newPO.id} created`)
    // We add via context — need a bit of a workaround since addPO is not in context
    // For simplicity, trigger a custom event
    const event = new CustomEvent('addPO', { detail: newPO })
    window.dispatchEvent(event)
  }

  const filtered = purchaseOrders.filter(p => filterStatus === 'All' || p.status === filterStatus.toLowerCase())
  const totals = {
    total: purchaseOrders.length,
    pending:  purchaseOrders.filter(p => p.status === 'pending' || p.status === 'draft').length,
    approved: purchaseOrders.filter(p => p.status === 'approved').length,
    value:    purchaseOrders.reduce((s, po) => s + po.items.reduce((ss, i) => ss + i.quantity * i.unitCost, 0), 0),
  }

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-subtitle">Manage and approve vendor purchase orders</p>
        </div>
        <button className="btn-gold" onClick={() => setNewModal(true)}>
          <Plus size={16} /> New PO
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total POs',     value: totals.total,    cls: 'text-executive-dark' },
          { label: 'Pending',       value: totals.pending,  cls: 'text-amber-600' },
          { label: 'Approved',      value: totals.approved, cls: 'text-blue-600' },
          { label: 'Total Value',   value: `₹${totals.value.toFixed(2)}`, cls: 'text-gold-700' },
        ].map(s => (
          <div key={s.label} className="kpi-card">
            <p className="text-xs text-executive-muted uppercase tracking-wider font-semibold">{s.label}</p>
            <p className={`text-2xl font-serif font-bold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'Draft', 'Pending', 'Approved', 'Received'].map(f => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterStatus === f ? 'bg-gold-500 text-white' : 'bg-white border border-gray-200 text-executive-muted hover:border-gold-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* PO Table */}
      <div className="gold-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-gold">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Vendor</th>
                <th>Items</th>
                <th>Total Value</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(po => {
                const vendor = vendors.find(v => v.id === po.vendorId)
                const total  = po.items.reduce((s, i) => s + i.quantity * i.unitCost, 0)
                const cfg    = STATUS_CONFIG[po.status] || STATUS_CONFIG.draft
                return (
                  <tr key={po.id}>
                    <td className="font-mono font-semibold text-executive-dark">{po.id}</td>
                    <td>
                      <div>
                        <p className="font-medium text-executive-dark">{vendor?.name || 'Unknown'}</p>
                        <p className="text-xs text-executive-muted">{vendor?.email}</p>
                      </div>
                    </td>
                    <td>{po.items.length} item{po.items.length !== 1 ? 's' : ''}</td>
                    <td className="font-semibold text-gold-700">₹{total.toFixed(2)}</td>
                    <td className="text-executive-muted text-xs">{po.createdAt}</td>
                    <td><span className={cfg.cls}>{cfg.label}</span></td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn-ghost p-1.5" onClick={() => setDetail(po)} title="View"><Eye size={14} /></button>
                        {(po.status === 'draft' || po.status === 'pending') && (
                          <button className="btn-ghost p-1.5 hover:text-green-600" onClick={() => approvePurchaseOrder(po.id)} title="Approve">
                            <Check size={14} />
                          </button>
                        )}
                        {po.status === 'approved' && (
                          <button className="btn-ghost p-1.5 hover:text-blue-600" onClick={() => receiveOrder(po.id)} title="Mark Received">
                            <Package size={14} />
                          </button>
                        )}
                        {po.status !== 'received' && (
                          <button className="btn-ghost p-1.5 hover:text-red-500" onClick={() => { if (confirm('Delete?')) deletePurchaseOrder(po.id) }} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-executive-muted">No purchase orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <PODetail
          po={detail}
          onClose={() => setDetail(null)}
          onApprove={approvePurchaseOrder}
          onReceive={receiveOrder}
          onDelete={deletePurchaseOrder}
          vendors={vendors}
          ingredients={ingredients}
        />
      )}

      {newModal && (
        <NewPOModal
          onClose={() => setNewModal(false)}
          onSave={(data) => {
            const newPO = {
              ...data,
              id: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
              createdAt: new Date().toISOString().split('T')[0],
              approvedAt: null,
            }
            addNotification?.('info', `Purchase Order ${newPO.id} created`)
          }}
          vendors={vendors}
          ingredients={ingredients}
        />
      )}
    </div>
  )
}
