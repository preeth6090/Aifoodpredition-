import React, { useState, useMemo } from 'react'
import {
  Plus, Check, Trash2, Package, Mail, X, Save, Eye,
  AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronUp, Info
} from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

const STATUS_CONFIG = {
  draft:    { label: 'Draft',     cls: 'badge-gray'  },
  pending:  { label: 'Pending',   cls: 'badge-amber' },
  approved: { label: 'Approved',  cls: 'badge-blue'  },
  received: { label: 'Received',  cls: 'badge-green' },
  partial:  { label: 'Partial',   cls: 'badge-amber' },
  rejected: { label: 'Rejected',  cls: 'badge-red'   },
}

const PACK_TYPES = ['Bag','Box','Bottle','Pouch','Can','Sachet','Drum','Carton','Jar','Tray','Tin','Packet']

// ─── Receive Items Modal ──────────────────────────────────────────────────────
function ReceiveModal({ po, onClose, onReceive, vendors, ingredients }) {
  const vendor = vendors.find(v => v.id === po.vendorId)

  const [rows, setRows] = useState(() =>
    po.items.map(item => {
      const ing = ingredients.find(i => i.id === item.ingredientId)
      return {
        ingredientId: item.ingredientId,
        orderedQty:   item.quantity,
        receivedQty:  item.quantity,
        unitCost:     item.unitCost,
        packType:     ing?.packType   || 'Bag',
        packSize:     ing?.packSize   || 1,
        packUnit:     ing?.packUnit   || ing?.unit || 'kg',
        packPrice:    (item.unitCost || 0) * (ing?.packSize || 1),
        mfgDate:      ing?.mfgDate    || '',
        expiryDate:   ing?.expiryDate || '',
        batchNo:      ing?.batchNo    || '',
        fssaiNo:      ing?.fssaiNo    || vendor?.fssaiNumber || '',
        itemStatus:   'received',   // received | partial | rejected
        tolerance:    ing?.tolerance ?? 3,
      }
    })
  )

  const setRow = (idx, key, val) => setRows(prev => {
    const next = [...prev]
    next[idx] = { ...next[idx], [key]: val }

    // auto-calc unit cost from pack price
    if (key === 'packPrice' || key === 'packSize') {
      const ps = key === 'packSize'  ? parseFloat(val) || 1 : next[idx].packSize
      const pp = key === 'packPrice' ? parseFloat(val) || 0 : next[idx].packPrice
      next[idx].unitCost = ps > 0 ? parseFloat((pp / ps).toFixed(4)) : 0
    }
    return next
  })

  const getVariancePct = (row) => {
    if (!row.orderedQty) return 0
    return ((row.receivedQty - row.orderedQty) / row.orderedQty) * 100
  }

  const getVarianceStatus = (row) => {
    const pct = Math.abs(getVariancePct(row))
    const tol = row.tolerance ?? 3
    if (row.receivedQty === 0 || row.itemStatus === 'rejected') return 'rejected'
    if (pct <= tol) return 'ok'
    if (row.receivedQty < row.orderedQty) return 'short'
    return 'excess'
  }

  const varBadge = { ok: 'text-green-600', short: 'text-amber-600', excess: 'text-blue-600', rejected: 'text-red-600' }
  const varLabel = { ok: 'Within tolerance', short: 'Short delivery', excess: 'Excess delivery', rejected: 'Rejected' }

  const [expandedRows, setExpandedRows] = useState({})

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-gold-lg w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-executive-dark px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-serif text-lg font-semibold text-white">Receive Order — {po.id}</h2>
            <p className="text-xs text-gold-400 mt-0.5">{vendor?.name} · Enter actual quantities received</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-3 bg-blue-50 border-b border-blue-200 flex items-center gap-2 text-xs text-blue-800 flex-shrink-0">
          <Info size={14} className="flex-shrink-0" />
          Enter the <strong>actual quantity received</strong>. Tolerance per item is pre-set (±2–5%). Items within tolerance are auto-approved. Enter pack price to auto-calculate unit cost.
        </div>

        {/* Rows */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
          {rows.map((row, idx) => {
            const ing    = ingredients.find(i => i.id === row.ingredientId)
            const vPct   = getVariancePct(row)
            const vState = getVarianceStatus(row)
            const expanded = expandedRows[idx]

            return (
              <div key={idx} className={`p-4 ${row.itemStatus === 'rejected' ? 'bg-red-50' : vState === 'short' ? 'bg-amber-50' : 'bg-white'}`}>
                {/* Main row */}
                <div className="grid grid-cols-12 gap-3 items-center">
                  {/* Ingredient name */}
                  <div className="col-span-3">
                    <p className="font-semibold text-executive-dark text-sm">{ing?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-executive-muted">{ing?.sku} · {ing?.category}</p>
                  </div>

                  {/* Ordered */}
                  <div className="col-span-1 text-center">
                    <p className="text-[10px] text-executive-muted uppercase tracking-wide">Ordered</p>
                    <p className="font-semibold text-executive-dark">{row.orderedQty} <span className="text-xs font-normal">{ing?.unit}</span></p>
                  </div>

                  {/* Received qty input */}
                  <div className="col-span-2">
                    <p className="text-[10px] text-executive-muted uppercase tracking-wide mb-1">Received Qty *</p>
                    <input
                      className="input-gold text-sm py-1"
                      type="number" step="0.001" min="0"
                      value={row.receivedQty}
                      disabled={row.itemStatus === 'rejected'}
                      onChange={e => setRow(idx, 'receivedQty', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  {/* Variance */}
                  <div className="col-span-2 text-center">
                    <p className="text-[10px] text-executive-muted uppercase tracking-wide">Variance</p>
                    <p className={`font-bold text-sm ${varBadge[vState]}`}>
                      {vPct > 0 ? '+' : ''}{vPct.toFixed(1)}%
                    </p>
                    <p className={`text-[10px] ${varBadge[vState]}`}>{varLabel[vState]}</p>
                    <p className="text-[10px] text-executive-muted">Tolerance: ±{row.tolerance}%</p>
                  </div>

                  {/* Status buttons */}
                  <div className="col-span-2">
                    <p className="text-[10px] text-executive-muted uppercase tracking-wide mb-1">Status</p>
                    <div className="flex gap-1">
                      {['received','rejected'].map(s => (
                        <button key={s} onClick={() => setRow(idx, 'itemStatus', s)}
                          className={`flex-1 text-[10px] py-1 rounded-lg border font-medium transition-all ${
                            row.itemStatus === s
                              ? s === 'received' ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500'
                              : 'border-gray-200 text-executive-muted hover:border-gold-300'
                          }`}>
                          {s === 'received' ? '✓ Accept' : '✗ Reject'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expand toggle */}
                  <div className="col-span-2 flex justify-end">
                    <button onClick={() => setExpandedRows(x => ({ ...x, [idx]: !x[idx] }))}
                      className="btn-ghost text-xs flex items-center gap-1">
                      {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      {expanded ? 'Less' : 'Details'}
                    </button>
                  </div>
                </div>

                {/* Expanded: pack details + dates + FSSAI */}
                {expanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Pack type */}
                    <div>
                      <label className="label-gold text-[10px]">Pack Type</label>
                      <select className="select-gold py-1 text-xs" value={row.packType} onChange={e => setRow(idx, 'packType', e.target.value)}>
                        {PACK_TYPES.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    {/* Pack size */}
                    <div>
                      <label className="label-gold text-[10px]">Pack Size ({row.packUnit})</label>
                      <input className="input-gold py-1 text-xs" type="number" step="0.001" min="0"
                        value={row.packSize} onChange={e => setRow(idx, 'packSize', parseFloat(e.target.value) || 1)} />
                    </div>
                    {/* Pack price */}
                    <div>
                      <label className="label-gold text-[10px]">Pack Price (₹)</label>
                      <input className="input-gold py-1 text-xs" type="number" step="0.01" min="0"
                        value={row.packPrice} onChange={e => setRow(idx, 'packPrice', parseFloat(e.target.value) || 0)} />
                    </div>
                    {/* Auto-calculated unit cost */}
                    <div>
                      <label className="label-gold text-[10px]">Unit Cost (₹/{ing?.unit})</label>
                      <div className="input-gold py-1 text-xs bg-gold-50 flex items-center justify-between">
                        <span className="font-bold text-gold-700">₹{(row.unitCost || 0).toFixed(3)}</span>
                        <span className="text-[9px] text-executive-muted">Auto-calc</span>
                      </div>
                    </div>
                    {/* Mfg date */}
                    <div>
                      <label className="label-gold text-[10px]">Manufacture Date</label>
                      <input className="input-gold py-1 text-xs" type="date" value={row.mfgDate}
                        onChange={e => setRow(idx, 'mfgDate', e.target.value)} />
                    </div>
                    {/* Expiry date */}
                    <div>
                      <label className="label-gold text-[10px]">Expiry Date</label>
                      <input className="input-gold py-1 text-xs" type="date" value={row.expiryDate}
                        onChange={e => setRow(idx, 'expiryDate', e.target.value)} />
                    </div>
                    {/* Batch No */}
                    <div>
                      <label className="label-gold text-[10px]">Batch / Lot No.</label>
                      <input className="input-gold py-1 text-xs font-mono" placeholder="e.g. BKR-2604-A"
                        value={row.batchNo} onChange={e => setRow(idx, 'batchNo', e.target.value)} />
                    </div>
                    {/* FSSAI */}
                    <div>
                      <label className="label-gold text-[10px]">Product FSSAI No.</label>
                      <input className="input-gold py-1 text-xs font-mono" placeholder="14-digit FSSAI"
                        value={row.fssaiNo} onChange={e => setRow(idx, 'fssaiNo', e.target.value)} />
                    </div>
                    {/* Tolerance */}
                    <div>
                      <label className="label-gold text-[10px]">Allowed Tolerance (%)</label>
                      <input className="input-gold py-1 text-xs" type="number" min="0" max="10" step="0.5"
                        value={row.tolerance} onChange={e => setRow(idx, 'tolerance', parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary footer */}
        <div className="border-t border-gold-200 bg-gray-50 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={13} /> {rows.filter(r => r.itemStatus === 'received').length} Accepted</span>
              <span className="flex items-center gap-1 text-red-600"><XCircle size={13} /> {rows.filter(r => r.itemStatus === 'rejected').length} Rejected</span>
              <span className="flex items-center gap-1 text-amber-600"><AlertTriangle size={13} /> {rows.filter(r => getVarianceStatus(r) === 'short').length} Short delivery</span>
            </div>
            <div className="text-xs text-executive-muted">
              Total received value: <span className="font-bold text-gold-700">
                ₹{rows.filter(r => r.itemStatus !== 'rejected').reduce((s, r) => s + r.receivedQty * r.unitCost, 0).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={onClose} className="btn-ghost">Cancel</button>
            <button className="btn-gold" onClick={() => { onReceive(po.id, rows); onClose() }}>
              <Package size={16} /> Confirm Receipt & Update Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PO Detail Modal ──────────────────────────────────────────────────────────
function PODetail({ po, onClose, onApprove, onStartReceive, onDelete, vendors, ingredients }) {
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
          <div className="grid grid-cols-2 gap-4">
            <div className="gold-card p-4">
              <p className="text-xs text-executive-muted font-semibold uppercase tracking-wider mb-2">Vendor</p>
              <p className="font-semibold text-executive-dark">{vendor?.name || 'Unknown'}</p>
              <p className="text-xs text-executive-muted">{vendor?.email}</p>
              <p className="text-xs text-executive-muted">{vendor?.phone}</p>
              {vendor?.gstNumber && <p className="text-xs font-mono text-executive-muted mt-1">GST: {vendor.gstNumber}</p>}
            </div>
            <div className="gold-card p-4">
              <p className="text-xs text-executive-muted font-semibold uppercase tracking-wider mb-2">Order Info</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-executive-muted">Status</span>
                  <span className={STATUS_CONFIG[po.status]?.cls}>{STATUS_CONFIG[po.status]?.label}</span>
                </div>
                <div className="flex justify-between"><span className="text-executive-muted">Created</span><span>{po.createdAt}</span></div>
                {po.approvedAt && <div className="flex justify-between"><span className="text-executive-muted">Approved</span><span>{po.approvedAt}</span></div>}
                {po.receivedAt && <div className="flex justify-between"><span className="text-executive-muted">Received</span><span>{po.receivedAt}</span></div>}
                <div className="flex justify-between"><span className="text-executive-muted">Payment Terms</span><span className="font-medium">{vendor?.paymentTerms || '—'}</span></div>
                <div className="flex justify-between"><span className="text-executive-muted">Delivery Days</span><span>{vendor?.leadTimeDays}d</span></div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-executive-dark mb-3">Order Items</h3>
            <table className="table-gold w-full">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Ordered Qty</th>
                  <th>Received Qty</th>
                  <th>Unit</th>
                  <th>Unit Cost (₹)</th>
                  <th>Subtotal (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {po.items.map((item, i) => {
                  const ing      = ingredients.find(ing => ing.id === item.ingredientId)
                  const received = po.receivedItems?.find(r => r.ingredientId === item.ingredientId)
                  const vPct     = received ? ((received.receivedQty - item.quantity) / item.quantity * 100) : null
                  return (
                    <tr key={i}>
                      <td className="font-medium">{ing?.name || 'Unknown'}</td>
                      <td>{item.quantity} {ing?.unit}</td>
                      <td className="font-semibold">
                        {received ? (
                          <span className={received.itemStatus === 'rejected' ? 'text-red-600' : Math.abs(vPct) > (ing?.tolerance ?? 3) ? 'text-amber-600' : 'text-green-600'}>
                            {received.receivedQty} {ing?.unit}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="text-executive-muted">{ing?.unit}</td>
                      <td>₹{(received?.unitCost || item.unitCost).toFixed(3)}</td>
                      <td className="font-semibold">₹{((received?.receivedQty ?? item.quantity) * (received?.unitCost || item.unitCost)).toFixed(2)}</td>
                      <td>
                        {received ? (
                          <span className={received.itemStatus === 'rejected' ? 'badge-red' : Math.abs(vPct) > (ing?.tolerance ?? 3) ? 'badge-amber' : 'badge-green'}>
                            {received.itemStatus === 'rejected' ? 'Rejected' : vPct !== null ? `${vPct > 0 ? '+' : ''}${vPct.toFixed(1)}%` : 'OK'}
                          </span>
                        ) : <span className="badge-gray">Pending</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gold-50 border-t-2 border-gold-200">
                  <td colSpan={5} className="px-4 py-3 font-bold text-executive-dark">Order Total</td>
                  <td className="px-4 py-3 font-bold text-gold-700">₹{total.toFixed(2)}</td>
                  <td />
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
              <button className="btn-gold" onClick={() => { onClose(); onStartReceive(po) }}>
                <Package size={16} /> Receive Items
              </button>
            )}
            {(po.status === 'received' || po.status === 'partial') && (
              <button className="btn-outline text-xs" onClick={() => { onClose(); onStartReceive(po) }}>
                <Package size={14} /> Amend Receipt
              </button>
            )}
            {po.status !== 'received' && po.status !== 'partial' && (
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

// ─── New PO Modal ─────────────────────────────────────────────────────────────
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
            <div className="flex items-center justify-between mb-2">
              <label className="label-gold mb-0">Order Items</label>
              <button className="btn-outline text-xs" onClick={addItem}><Plus size={14} /> Add Item</button>
            </div>
            <div className="grid grid-cols-12 gap-1 px-2 mb-1 text-[10px] font-semibold text-executive-muted uppercase tracking-wide">
              <span className="col-span-5">Ingredient</span>
              <span className="col-span-2">Qty</span>
              <span className="col-span-2">Unit</span>
              <span className="col-span-2">Unit Cost (₹)</span>
              <span className="col-span-1" />
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => {
                const ing = ingredients.find(i => i.id === item.ingredientId)
                return (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded-lg">
                    <div className="col-span-5">
                      <select className="select-gold" value={item.ingredientId} onChange={e => updateItem(idx, 'ingredientId', e.target.value)}>
                        {ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input className="input-gold" type="number" min="0" placeholder="Qty"
                        value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                    </div>
                    <div className="col-span-2 text-xs text-executive-muted font-medium pl-1">{ing?.unit || '—'}</div>
                    <div className="col-span-2">
                      <input className="input-gold" type="number" step="0.001" min="0"
                        value={item.unitCost} onChange={e => updateItem(idx, 'unitCost', e.target.value)} />
                    </div>
                    <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <label className="label-gold">Notes</label>
            <textarea className="input-gold resize-none" rows={2} placeholder="Optional notes…"
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div className="flex justify-between items-center p-3 bg-gold-50 rounded-xl border border-gold-200">
            <span className="font-semibold text-executive-dark text-sm">Order Total</span>
            <span className="font-bold text-gold-700 text-lg">₹{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-gold-100 px-6 py-4 flex justify-between bg-gray-50">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button className="btn-gold" onClick={() => { onSave({ vendorId, items, notes, status: 'pending' }); onClose() }}>
            <Save size={16} /> Create PO
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PurchaseOrders() {
  const {
    purchaseOrders, vendors, ingredients,
    approvePurchaseOrder, deletePurchaseOrder, receiveOrder,
    addNotification,
  } = useInventory()

  const [detail,      setDetail]      = useState(null)
  const [receiveModal,setReceiveModal] = useState(null)
  const [newModal,    setNewModal]    = useState(false)
  const [filterStatus,setFilterStatus]= useState('All')
  const [localPOs,    setLocalPOs]    = useState([])

  const allPOs = useMemo(() => [...purchaseOrders, ...localPOs], [purchaseOrders, localPOs])

  const handleCreate = (data) => {
    const newPO = {
      ...data,
      id: `PO-${new Date().getFullYear()}-${String(allPOs.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
      approvedAt: null,
    }
    setLocalPOs(prev => [newPO, ...prev])
    addNotification('info', `Purchase Order ${newPO.id} created`)
  }

  const filtered = allPOs.filter(p => filterStatus === 'All' || p.status === filterStatus.toLowerCase())

  const totals = {
    total:    allPOs.length,
    pending:  allPOs.filter(p => p.status === 'pending' || p.status === 'draft').length,
    approved: allPOs.filter(p => p.status === 'approved').length,
    value:    allPOs.reduce((s, po) => s + po.items.reduce((ss, i) => ss + i.quantity * i.unitCost, 0), 0),
  }

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-subtitle">Manage indents — approve, partially receive, track variance & FSSAI compliance</p>
        </div>
        <button className="btn-gold" onClick={() => setNewModal(true)}>
          <Plus size={16} /> New PO
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total POs',   value: totals.total,                                     cls: 'text-executive-dark' },
          { label: 'Pending',     value: totals.pending,                                   cls: 'text-amber-600'      },
          { label: 'Approved',    value: totals.approved,                                  cls: 'text-blue-600'       },
          { label: 'Total Value', value: `₹${totals.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, cls: 'text-gold-700' },
        ].map(s => (
          <div key={s.label} className="kpi-card">
            <p className="text-xs text-executive-muted uppercase tracking-wider font-semibold">{s.label}</p>
            <p className={`text-2xl font-serif font-bold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['All','Draft','Pending','Approved','Received','Partial','Rejected'].map(f => (
          <button key={f} onClick={() => setFilterStatus(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterStatus === f ? 'bg-gold-500 text-white' : 'bg-white border border-gray-200 text-executive-muted hover:border-gold-300'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="gold-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-gold">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Vendor</th>
                <th>Items</th>
                <th>Total Value (₹)</th>
                <th>Created</th>
                <th>Payment Terms</th>
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
                    <td className="font-semibold text-gold-700">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="text-executive-muted text-xs">{po.createdAt}</td>
                    <td className="text-xs">{vendor?.paymentTerms || '—'}</td>
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
                          <button className="btn-ghost p-1.5 hover:text-blue-600" onClick={() => setReceiveModal(po)} title="Receive Items">
                            <Package size={14} />
                          </button>
                        )}
                        {po.status !== 'received' && po.status !== 'partial' && (
                          <button className="btn-ghost p-1.5 hover:text-red-500"
                            onClick={() => { if (confirm('Delete?')) deletePurchaseOrder(po.id) }} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-executive-muted">No purchase orders found.</td></tr>
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
          onStartReceive={(po) => setReceiveModal(po)}
          onDelete={deletePurchaseOrder}
          vendors={vendors}
          ingredients={ingredients}
        />
      )}

      {receiveModal && (
        <ReceiveModal
          po={receiveModal}
          onClose={() => setReceiveModal(null)}
          onReceive={receiveOrder}
          vendors={vendors}
          ingredients={ingredients}
        />
      )}

      {newModal && (
        <NewPOModal
          onClose={() => setNewModal(false)}
          onSave={handleCreate}
          vendors={vendors}
          ingredients={ingredients}
        />
      )}
    </div>
  )
}
