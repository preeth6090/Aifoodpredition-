import React, { useState, useMemo } from 'react'
import {
  Building2, Phone, Mail, MapPin, CreditCard, Truck, FileText,
  Edit3, Save, X, CheckCircle, Clock, AlertTriangle, IndianRupee, Package
} from 'lucide-react'
import { useInventory } from '../context/InventoryContext'
import { useAuth } from '../context/AuthContext'

const PAYMENT_TERMS = ['COD', 'Net 7', 'Net 15', 'Net 30', 'Advance']

function StatusBadge({ status }) {
  const cfg = {
    draft:    { cls: 'badge-gray',  label: 'Draft'    },
    pending:  { cls: 'badge-amber', label: 'Pending'  },
    approved: { cls: 'badge-blue',  label: 'Approved' },
    received: { cls: 'badge-green', label: 'Received' },
    partial:  { cls: 'badge-amber', label: 'Partial'  },
    rejected: { cls: 'badge-red',   label: 'Rejected' },
  }[status] || { cls: 'badge-gray', label: status }
  return <span className={cfg.cls}>{cfg.label}</span>
}

function ProfileTab({ vendor, onSave }) {
  const [form, setForm] = useState({ ...vendor })
  const [editing, setEditing] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    onSave(form)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-5">
      {saved && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle size={16} className="text-green-600" />
          <span className="text-sm font-semibold text-green-800">Profile updated successfully.</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-executive-dark">Business Profile</h2>
        {!editing
          ? <button className="btn-gold text-xs" onClick={() => setEditing(true)}><Edit3 size={13} /> Edit Profile</button>
          : <div className="flex gap-2">
              <button className="btn-ghost text-xs" onClick={() => { setForm({...vendor}); setEditing(false) }}><X size={13} /> Cancel</button>
              <button className="btn-gold text-xs" onClick={handleSave}><Save size={13} /> Save</button>
            </div>
        }
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Contact */}
        <div className="gold-card p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Building2 size={12} /> Business Info</p>
          {[
            { label: 'Business Name', key: 'name', icon: Building2 },
            { label: 'Contact Person', key: 'contactPerson', icon: null },
            { label: 'Phone', key: 'phone', icon: Phone },
            { label: 'Email', key: 'email', icon: Mail },
            { label: 'Address', key: 'address', icon: MapPin },
          ].map(f => (
            <div key={f.key}>
              <label className="label-gold">{f.label}</label>
              {editing
                ? <input className="input-gold" value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
                : <p className="text-sm text-executive-dark py-1">{vendor[f.key] || '—'}</p>
              }
            </div>
          ))}
        </div>

        {/* Delivery */}
        <div className="gold-card p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Truck size={12} /> Delivery Terms</p>
          {[
            { label: 'Lead Time (Days)', key: 'leadTimeDays', type: 'number' },
            { label: 'Delivery Days', key: 'deliveryDays' },
            { label: 'Delivery Slot', key: 'deliverySlot' },
            { label: 'Delivery Charge (₹)', key: 'deliveryCharge', type: 'number' },
            { label: 'Free Delivery Above (₹)', key: 'freeDeliveryAbove', type: 'number' },
            { label: 'Return Policy', key: 'returnPolicy' },
          ].map(f => (
            <div key={f.key}>
              <label className="label-gold">{f.label}</label>
              {editing
                ? <input className="input-gold" type={f.type || 'text'} value={form[f.key] || ''} onChange={e => set(f.key, f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)} />
                : <p className="text-sm text-executive-dark py-1">{vendor[f.key] ?? '—'}</p>
              }
            </div>
          ))}
        </div>

        {/* Payment & Compliance */}
        <div className="gold-card p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"><CreditCard size={12} /> Payment & Compliance</p>
          <div>
            <label className="label-gold">Payment Terms</label>
            {editing
              ? <select className="select-gold" value={form.paymentTerms || 'Net 30'} onChange={e => set('paymentTerms', e.target.value)}>
                  {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
                </select>
              : <p className="text-sm text-executive-dark py-1">{vendor.paymentTerms}</p>
            }
          </div>
          {[
            { label: 'GST Number', key: 'gstNumber' },
            { label: 'PAN Number', key: 'panNumber' },
            { label: 'FSSAI Number', key: 'fssaiNumber' },
          ].map(f => (
            <div key={f.key}>
              <label className="label-gold">{f.label}</label>
              <p className="text-sm font-mono text-executive-dark py-1">{vendor[f.key] || '—'}</p>
            </div>
          ))}
        </div>

        {/* Bank */}
        <div className="gold-card p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank Details</p>
          {[
            { label: 'Bank Name', key: 'bankName' },
            { label: 'Account Number', key: 'accountNumber' },
            { label: 'IFSC Code', key: 'ifscCode' },
            { label: 'Account Type', key: 'accountType' },
          ].map(f => (
            <div key={f.key}>
              <label className="label-gold">{f.label}</label>
              <p className="text-sm font-mono text-executive-dark py-1">{vendor[f.key] || '—'}</p>
            </div>
          ))}
          <p className="text-[10px] text-gray-400 mt-2">Bank details can only be changed by admin. Contact support.</p>
        </div>
      </div>
    </div>
  )
}

function POTab({ vendorId, purchaseOrders, ingredients }) {
  const myPOs = purchaseOrders.filter(p => p.vendorId === vendorId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-lg font-semibold text-executive-dark">Purchase Orders</h2>
      {myPOs.length === 0 && (
        <div className="gold-card p-12 text-center text-gray-400">
          <FileText size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-serif text-lg">No orders yet</p>
        </div>
      )}
      {myPOs.map(po => {
        const total = po.items.reduce((s, i) => s + i.quantity * i.unitCost, 0)
        return (
          <div key={po.id} className="gold-card overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: 'var(--th-bg)' }}>
              <div>
                <span className="font-serif font-bold" style={{ color: 'var(--th-text)' }}>{po.id}</span>
                <span className="ml-3 text-xs opacity-60" style={{ color: 'var(--th-text)' }}>{po.createdAt}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-serif font-bold text-lg" style={{ color: 'var(--th-text)' }}>₹{total.toLocaleString('en-IN')}</span>
                <StatusBadge status={po.status} />
              </div>
            </div>
            <table className="table-gold">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Ordered Qty</th>
                  <th>Unit Cost</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {po.items.map((item, i) => {
                  const ing = ingredients.find(g => g.id === item.ingredientId)
                  const received = po.receivedItems?.find(r => r.ingredientId === item.ingredientId)
                  return (
                    <tr key={i}>
                      <td className="font-medium text-executive-dark">{ing?.name || 'Unknown'}</td>
                      <td>{item.quantity} {ing?.unit}</td>
                      <td>₹{item.unitCost}</td>
                      <td className="font-semibold">₹{(item.quantity * item.unitCost).toFixed(2)}</td>
                      <td>
                        {received ? (
                          <span className={received.itemStatus === 'rejected' ? 'badge-red' : received.itemStatus === 'received' ? 'badge-green' : 'badge-amber'}>
                            {received.itemStatus} ({received.receivedQty} {ing?.unit})
                          </span>
                        ) : <span className="badge-gray">{po.status}</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {po.notes && <div className="px-5 py-3 text-xs text-gray-500 bg-gray-50 border-t">{po.notes}</div>}
          </div>
        )
      })}
    </div>
  )
}

function PriceListTab({ vendorId, vendorPrices, ingredients, upsertVendorPrice, deleteVendorPrice }) {
  const myPrices = vendorPrices.filter(p => p.vendorId === vendorId)
  const [editId,  setEditId]  = useState(null)
  const [editForm, setEditForm] = useState({})

  const startEdit = (p) => { setEditId(`${p.vendorId}-${p.ingredientId}`); setEditForm({ ...p }) }
  const cancelEdit = () => { setEditId(null); setEditForm({}) }
  const saveEdit = () => {
    upsertVendorPrice({ ...editForm, vendorId })
    cancelEdit()
  }

  const myIngredients = ingredients.filter(ing =>
    !myPrices.find(p => p.ingredientId === ing.id)
  )

  return (
    <div className="space-y-4">
      <div className="section-header">
        <h2 className="font-serif text-lg font-semibold text-executive-dark">My Price List</h2>
        <p className="text-xs text-gray-500">Your quoted prices visible to the restaurant</p>
      </div>

      <div className="gold-card overflow-hidden">
        <table className="table-gold">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Price/Unit (₹)</th>
              <th>Min Order Qty</th>
              <th>Lead Time</th>
              <th>Valid Until</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {myPrices.map(p => {
              const ing  = ingredients.find(i => i.id === p.ingredientId)
              const isEd = editId === `${p.vendorId}-${p.ingredientId}`
              const set  = (k, v) => setEditForm(f => ({ ...f, [k]: v }))
              return (
                <tr key={`${p.vendorId}-${p.ingredientId}`}>
                  <td className="font-medium text-executive-dark">{ing?.name} <span className="text-gray-400 text-xs">/{ing?.unit}</span></td>
                  <td>
                    {isEd ? <input className="input-gold w-24" type="number" value={editForm.pricePerUnit} onChange={e => set('pricePerUnit', parseFloat(e.target.value))} />
                          : <span className="font-serif font-bold" style={{ color: 'var(--primary)' }}>₹{p.pricePerUnit}</span>}
                  </td>
                  <td>
                    {isEd ? <input className="input-gold w-20" type="number" value={editForm.minOrderQty} onChange={e => set('minOrderQty', parseFloat(e.target.value))} />
                          : p.minOrderQty}
                  </td>
                  <td>
                    {isEd ? <input className="input-gold w-20" type="number" value={editForm.leadTimeDays} onChange={e => set('leadTimeDays', parseFloat(e.target.value))} />
                          : `${p.leadTimeDays}d`}
                  </td>
                  <td>
                    {isEd ? <input className="input-gold w-32" type="date" value={editForm.validUntil} onChange={e => set('validUntil', e.target.value)} />
                          : p.validUntil}
                  </td>
                  <td>
                    {isEd ? <input className="input-gold w-32" value={editForm.notes || ''} onChange={e => set('notes', e.target.value)} />
                          : <span className="text-xs text-gray-500">{p.notes || '—'}</span>}
                  </td>
                  <td>
                    {isEd
                      ? <div className="flex gap-1">
                          <button onClick={saveEdit}   className="btn-gold text-xs py-1 px-2"><Save size={12} /></button>
                          <button onClick={cancelEdit} className="btn-ghost text-xs py-1 px-2"><X size={12} /></button>
                        </div>
                      : <button onClick={() => startEdit(p)} className="btn-ghost text-xs py-1 px-2"><Edit3 size={13} /></button>
                    }
                  </td>
                </tr>
              )
            })}
            {myPrices.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No prices listed yet. Add items below.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add new price */}
      {myIngredients.length > 0 && (
        <div className="gold-card p-5">
          <p className="text-sm font-semibold text-executive-dark mb-3">Add Item to Price List</p>
          <AddPriceRow vendorId={vendorId} ingredients={myIngredients} onAdd={upsertVendorPrice} />
        </div>
      )}
    </div>
  )
}

function AddPriceRow({ vendorId, ingredients, onAdd }) {
  const [form, setForm] = useState({ ingredientId: '', pricePerUnit: '', minOrderQty: 1, leadTimeDays: 2, validUntil: '', notes: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleAdd = () => {
    if (!form.ingredientId || !form.pricePerUnit) return
    onAdd({ ...form, vendorId, ingredientId: parseInt(form.ingredientId), pricePerUnit: parseFloat(form.pricePerUnit) })
    setForm({ ingredientId: '', pricePerUnit: '', minOrderQty: 1, leadTimeDays: 2, validUntil: '', notes: '' })
  }
  return (
    <div className="flex gap-3 flex-wrap items-end">
      <div>
        <label className="label-gold">Ingredient</label>
        <select className="select-gold" value={form.ingredientId} onChange={e => set('ingredientId', e.target.value)}>
          <option value="">— Select —</option>
          {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
        </select>
      </div>
      <div><label className="label-gold">Price/Unit (₹)</label><input className="input-gold w-28" type="number" placeholder="0.00" value={form.pricePerUnit} onChange={e => set('pricePerUnit', e.target.value)} /></div>
      <div><label className="label-gold">Min Qty</label><input className="input-gold w-20" type="number" value={form.minOrderQty} onChange={e => set('minOrderQty', parseFloat(e.target.value))} /></div>
      <div><label className="label-gold">Lead Days</label><input className="input-gold w-20" type="number" value={form.leadTimeDays} onChange={e => set('leadTimeDays', parseFloat(e.target.value))} /></div>
      <div><label className="label-gold">Valid Until</label><input className="input-gold w-36" type="date" value={form.validUntil} onChange={e => set('validUntil', e.target.value)} /></div>
      <button onClick={handleAdd} className="btn-gold">Add to List</button>
    </div>
  )
}

export default function VendorPortal() {
  const { user } = useAuth()
  const { vendors, purchaseOrders, ingredients, vendorPrices, upsertVendorPrice, deleteVendorPrice, updateVendor } = useInventory()
  const [tab, setTab] = useState('profile')

  const vendor = vendors.find(v => v.id === user?.vendorId)
  if (!vendor) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center text-gray-400">
        <Building2 size={40} className="mx-auto mb-3 opacity-30" />
        <p className="font-serif text-xl">Vendor profile not found</p>
        <p className="text-sm mt-1">Contact admin to set up your profile.</p>
      </div>
    </div>
  )

  const myPOs    = purchaseOrders.filter(p => p.vendorId === vendor.id)
  const myPrices = vendorPrices.filter(p => p.vendorId === vendor.id)
  const pendingPOs = myPOs.filter(p => ['pending','approved'].includes(p.status)).length

  const TABS = [
    { key: 'profile',    label: 'My Profile',      badge: null },
    { key: 'pos',        label: 'Purchase Orders',  badge: pendingPOs || null },
    { key: 'pricelist',  label: 'My Price List',    badge: null },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-header">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--primary)' }}>Vendor Portal</p>
          <h1 className="page-title">{vendor.name}</h1>
          <p className="page-subtitle">{vendor.category} · GSTIN: {vendor.gstNumber}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="badge-green text-xs">Portal Active</span>
          <span className="text-xs text-gray-400">{myPOs.length} total orders · {myPrices.length} listed items</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t.key}
            onClick={() => setTab(t.key)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === t.key ? 'var(--btn-from)' : '#ffffff',
              color: tab === t.key ? '#ffffff' : '#6b7280',
              border: `1.5px solid ${tab === t.key ? 'var(--btn-from)' : '#e2e8f0'}`,
            }}>
            {t.label}
            {t.badge && <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">{t.badge}</span>}
          </button>
        ))}
      </div>

      {tab === 'profile'   && <ProfileTab vendor={vendor} onSave={data => updateVendor(vendor.id, data)} />}
      {tab === 'pos'       && <POTab vendorId={vendor.id} purchaseOrders={purchaseOrders} ingredients={ingredients} />}
      {tab === 'pricelist' && <PriceListTab vendorId={vendor.id} vendorPrices={vendorPrices} ingredients={ingredients} upsertVendorPrice={upsertVendorPrice} deleteVendorPrice={deleteVendorPrice} />}
    </div>
  )
}
