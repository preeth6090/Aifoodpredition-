import React, { useState, useMemo } from 'react'
import {
  Plus, Edit3, Trash2, X, Save, Mail, Phone, MapPin, Package,
  CreditCard, Building2, Clock, Star, FileText, ChevronDown, ChevronUp,
  Shield, Truck, IndianRupee, AlertCircle, CheckCircle2, Copy
} from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

const CATEGORIES    = ['Bakery','Meat','Produce','Dairy','Beverages','Pantry','Condiments','Seafood','Other']
const PAYMENT_TERMS = ['COD','Advance','Net 7','Net 15','Net 30','Net 45','Net 60','Partial (50% Advance)']
const ACCOUNT_TYPES = ['Current','Savings','OD/CC']

const EMPTY_VENDOR = {
  name: '', contactPerson: '', phone: '', email: '', address: '', category: 'Produce',
  gstNumber: '', panNumber: '', fssaiNumber: '',
  bankName: '', accountNumber: '', ifscCode: '', accountType: 'Current',
  paymentTerms: 'Net 30', creditLimit: '', minOrderValue: '',
  deliveryCharge: '', freeDeliveryAbove: '', deliveryDays: '', deliverySlot: '',
  returnPolicy: '', leadTimeDays: 2, notes: '',
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label-gold">{label}</label>
      {children}
    </div>
  )
}

function VendorModal({ vendor, onClose, onSave }) {
  const [form, setForm] = useState(vendor ? { ...EMPTY_VENDOR, ...vendor } : EMPTY_VENDOR)
  const [tab,  setTab]  = useState('basic')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const tabs = [
    { id: 'basic',    label: 'Basic Info'   },
    { id: 'business', label: 'GST & Compliance' },
    { id: 'bank',     label: 'Bank & Payment' },
    { id: 'delivery', label: 'Delivery Terms' },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-gold-lg w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-executive-dark px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-serif text-lg font-semibold text-white">{vendor ? 'Edit Vendor' : 'New Vendor'}</h2>
            <p className="text-xs text-gold-400 mt-0.5">Complete supplier profile for PO & compliance</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-gold-200 bg-gray-50 flex-shrink-0">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-xs font-medium transition-all ${tab === t.id ? 'bg-white border-b-2 border-gold-500 text-executive-dark' : 'text-executive-muted hover:text-executive-dark'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {/* ── Basic Info ── */}
          {tab === 'basic' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Company / Firm Name *">
                  <input className="input-gold" placeholder="e.g. Prime Meats Ltd." value={form.name} onChange={e => set('name', e.target.value)} />
                </Field>
              </div>
              <Field label="Contact Person *">
                <input className="input-gold" placeholder="e.g. Ravi Kumar" value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
              </Field>
              <Field label="Mobile / WhatsApp *">
                <input className="input-gold" placeholder="9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </Field>
              <Field label="Email Address *">
                <input className="input-gold" type="email" placeholder="orders@vendor.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </Field>
              <Field label="Supply Category">
                <select className="select-gold" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <div className="col-span-2">
                <Field label="Business Address">
                  <textarea className="input-gold resize-none h-16" placeholder="Full address with pincode" value={form.address} onChange={e => set('address', e.target.value)} />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Notes / Special Instructions">
                  <textarea className="input-gold resize-none h-16" placeholder="e.g. WhatsApp order accepted, Halal certified, organic..." value={form.notes} onChange={e => set('notes', e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          {/* ── Business / Compliance ── */}
          {tab === 'business' && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="GST Number">
                <input className="input-gold font-mono uppercase" placeholder="29AABCP1234A1Z5" maxLength={15} value={form.gstNumber} onChange={e => set('gstNumber', e.target.value.toUpperCase())} />
              </Field>
              <Field label="PAN Number">
                <input className="input-gold font-mono uppercase" placeholder="AABCP1234A" maxLength={10} value={form.panNumber} onChange={e => set('panNumber', e.target.value.toUpperCase())} />
              </Field>
              <Field label="FSSAI License Number">
                <input className="input-gold font-mono" placeholder="10019011001234" maxLength={14} value={form.fssaiNumber} onChange={e => set('fssaiNumber', e.target.value)} />
              </Field>
              <div className="p-4 bg-gold-50 border border-gold-200 rounded-xl col-span-2">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {[
                    { label: 'GST', value: form.gstNumber, ok: form.gstNumber.length === 15 },
                    { label: 'PAN', value: form.panNumber, ok: form.panNumber.length === 10 },
                    { label: 'FSSAI', value: form.fssaiNumber, ok: form.fssaiNumber.length === 14 },
                  ].map(({ label, ok }) => (
                    <div key={label} className="flex items-center gap-2">
                      {ok ? <CheckCircle2 size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-amber-400" />}
                      <span className={ok ? 'text-green-700 font-medium' : 'text-amber-700'}>{label} {ok ? '✓ Valid length' : '— Enter to verify'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                In production, GST verification integrates with the GST portal API. PAN links to Income Tax e-filing. FSSAI validates against the Food Safety portal.
              </div>
            </div>
          )}

          {/* ── Bank & Payment ── */}
          {tab === 'bank' && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Bank Name">
                <input className="input-gold" placeholder="e.g. HDFC Bank" value={form.bankName} onChange={e => set('bankName', e.target.value)} />
              </Field>
              <Field label="Account Type">
                <select className="select-gold" value={form.accountType} onChange={e => set('accountType', e.target.value)}>
                  {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Account Number">
                <input className="input-gold font-mono" placeholder="123456789012" value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} />
              </Field>
              <Field label="IFSC Code">
                <input className="input-gold font-mono uppercase" placeholder="HDFC0001234" maxLength={11} value={form.ifscCode} onChange={e => set('ifscCode', e.target.value.toUpperCase())} />
              </Field>
              <Field label="Payment Terms *">
                <select className="select-gold" value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)}>
                  {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Credit Limit (₹)">
                <input className="input-gold" type="number" min="0" placeholder="50000" value={form.creditLimit} onChange={e => set('creditLimit', parseFloat(e.target.value) || '')} />
              </Field>
              <Field label="Minimum Order Value (₹)">
                <input className="input-gold" type="number" min="0" placeholder="1000" value={form.minOrderValue} onChange={e => set('minOrderValue', parseFloat(e.target.value) || '')} />
              </Field>
              <div className="col-span-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <strong>Payment Terms Guide:</strong> COD = Pay on delivery · Net 7/15/30 = Pay within days of invoice · Advance = Pay before delivery · Partial = 50% advance + 50% on delivery
              </div>
            </div>
          )}

          {/* ── Delivery Terms ── */}
          {tab === 'delivery' && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Lead Time (Days)">
                <input className="input-gold" type="number" min="0" placeholder="2" value={form.leadTimeDays} onChange={e => set('leadTimeDays', parseInt(e.target.value) || 1)} />
              </Field>
              <Field label="Delivery Days / Schedule">
                <input className="input-gold" placeholder="e.g. Mon–Sat, 2 business days" value={form.deliveryDays} onChange={e => set('deliveryDays', e.target.value)} />
              </Field>
              <Field label="Delivery Time Slot">
                <input className="input-gold" placeholder="e.g. Morning (6–10 AM)" value={form.deliverySlot} onChange={e => set('deliverySlot', e.target.value)} />
              </Field>
              <Field label="Flat Delivery Charge (₹)">
                <input className="input-gold" type="number" min="0" placeholder="150" value={form.deliveryCharge} onChange={e => set('deliveryCharge', parseFloat(e.target.value) ?? '')} />
              </Field>
              <Field label="Free Delivery Above (₹)">
                <input className="input-gold" type="number" min="0" placeholder="5000  (0 = always free)" value={form.freeDeliveryAbove} onChange={e => set('freeDeliveryAbove', parseFloat(e.target.value) ?? '')} />
              </Field>
              <Field label="Return / Rejection Policy">
                <input className="input-gold" placeholder="e.g. Replace within 24 hrs if stale" value={form.returnPolicy} onChange={e => set('returnPolicy', e.target.value)} />
              </Field>
              <div className="col-span-2 p-3 bg-gold-50 border border-gold-200 rounded-xl text-xs text-gold-800">
                <strong>Note:</strong> Per-item delivery charges are set in the <strong>Vendor Price List</strong> page and override the vendor-level delivery charge for individual ingredients.
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gold-100 px-6 py-4 flex justify-between bg-gray-50 flex-shrink-0">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button className="btn-gold" onClick={() => {
            if (!form.name.trim()) return alert('Company name required')
            if (!form.email.trim()) return alert('Email required')
            onSave(form)
          }}>
            <Save size={16} /> Save Vendor
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Vendor Card ───────────────────────────────────────────────────────────────

function VendorCard({ vendor, suppliedCount, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const paymentBadge = {
    'COD': 'bg-green-100 text-green-700',
    'Advance': 'bg-red-100 text-red-700',
    'Net 7': 'bg-blue-100 text-blue-700',
    'Net 15': 'bg-blue-100 text-blue-700',
    'Net 30': 'bg-amber-100 text-amber-700',
    'Net 45': 'bg-amber-100 text-amber-700',
    'Net 60': 'bg-orange-100 text-orange-700',
  }[vendor.paymentTerms] || 'bg-gray-100 text-gray-600'

  const copy = (text) => { navigator.clipboard?.writeText(text); }

  return (
    <div className="gold-card overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-executive-navy flex items-center justify-center flex-shrink-0">
              <span className="text-gold-400 font-bold text-lg">{vendor.name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-serif font-semibold text-executive-dark leading-tight">{vendor.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="badge-gold text-[10px]">{vendor.category}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${paymentBadge}`}>{vendor.paymentTerms}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={onEdit} className="btn-ghost p-1.5" title="Edit"><Edit3 size={14} /></button>
            <button onClick={onDelete} className="btn-ghost p-1.5 hover:text-red-500" title="Delete"><Trash2 size={14} /></button>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-executive-muted">
            <Phone size={12} className="text-gold-500 flex-shrink-0" />
            <span className="font-medium text-executive-dark">{vendor.contactPerson}</span>
            <span>·</span><span>{vendor.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-executive-muted">
            <Mail size={12} className="text-gold-500 flex-shrink-0" />
            <span className="truncate">{vendor.email}</span>
          </div>
          <div className="flex items-center gap-2 text-executive-muted">
            <MapPin size={12} className="text-gold-500 flex-shrink-0" />
            <span className="truncate">{vendor.address}</span>
          </div>
        </div>

        {/* Key metrics strip */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="text-center p-2 bg-gold-50 rounded-lg">
            <p className="text-[10px] text-executive-muted">Lead Time</p>
            <p className="text-xs font-bold text-executive-dark">{vendor.leadTimeDays}d</p>
          </div>
          <div className="text-center p-2 bg-gold-50 rounded-lg">
            <p className="text-[10px] text-executive-muted">Min Order</p>
            <p className="text-xs font-bold text-executive-dark">₹{vendor.minOrderValue?.toLocaleString('en-IN') || '—'}</p>
          </div>
          <div className="text-center p-2 bg-gold-50 rounded-lg">
            <p className="text-[10px] text-executive-muted">Items</p>
            <p className="text-xs font-bold text-executive-dark">{suppliedCount}</p>
          </div>
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpanded(x => !x)}
          className="w-full mt-3 flex items-center justify-center gap-1 text-xs text-gold-600 hover:text-gold-800 transition-colors">
          {expanded ? <><ChevronUp size={14} /> Hide Details</> : <><ChevronDown size={14} /> View Full Details</>}
        </button>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-gold-100 p-5 bg-gray-50 space-y-4">
          {/* Compliance */}
          <div>
            <p className="text-[10px] font-semibold text-executive-muted uppercase tracking-wider mb-2 flex items-center gap-1"><Shield size={11} /> Compliance</p>
            <div className="space-y-1.5">
              {[
                { label: 'GST',   value: vendor.gstNumber,   ok: vendor.gstNumber?.length === 15 },
                { label: 'PAN',   value: vendor.panNumber,   ok: vendor.panNumber?.length === 10 },
                { label: 'FSSAI', value: vendor.fssaiNumber, ok: vendor.fssaiNumber?.length === 14 },
              ].map(({ label, value, ok }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-executive-muted w-14">{label}</span>
                  <span className="font-mono text-executive-dark flex-1">{value || '—'}</span>
                  {value && (
                    <button onClick={() => copy(value)} className="text-gold-500 hover:text-gold-700 ml-1"><Copy size={10} /></button>
                  )}
                  {value && (ok
                    ? <span className="text-green-500 ml-2">✓</span>
                    : <span className="text-amber-500 ml-2">!</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bank */}
          <div>
            <p className="text-[10px] font-semibold text-executive-muted uppercase tracking-wider mb-2 flex items-center gap-1"><Building2 size={11} /> Bank Details</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-executive-muted">Bank</span><span className="font-medium">{vendor.bankName || '—'}</span></div>
              <div className="flex justify-between"><span className="text-executive-muted">Account</span>
                <span className="font-mono flex items-center gap-1">{vendor.accountNumber || '—'}
                  {vendor.accountNumber && <button onClick={() => copy(vendor.accountNumber)} className="text-gold-500"><Copy size={10} /></button>}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-executive-muted">IFSC</span>
                <span className="font-mono flex items-center gap-1">{vendor.ifscCode || '—'}
                  {vendor.ifscCode && <button onClick={() => copy(vendor.ifscCode)} className="text-gold-500"><Copy size={10} /></button>}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-executive-muted">Type</span><span className="font-medium">{vendor.accountType || '—'}</span></div>
              <div className="flex justify-between"><span className="text-executive-muted">Credit Limit</span><span className="font-semibold text-gold-700">₹{vendor.creditLimit?.toLocaleString('en-IN') || '—'}</span></div>
            </div>
          </div>

          {/* Delivery */}
          <div>
            <p className="text-[10px] font-semibold text-executive-muted uppercase tracking-wider mb-2 flex items-center gap-1"><Truck size={11} /> Delivery Terms</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-executive-muted">Schedule</span><span className="font-medium">{vendor.deliveryDays || '—'}</span></div>
              <div className="flex justify-between"><span className="text-executive-muted">Time Slot</span><span className="font-medium">{vendor.deliverySlot || '—'}</span></div>
              <div className="flex justify-between"><span className="text-executive-muted">Delivery Charge</span>
                <span className="font-semibold">{vendor.deliveryCharge ? `₹${vendor.deliveryCharge}` : 'Free'}</span>
              </div>
              <div className="flex justify-between"><span className="text-executive-muted">Free Above</span>
                <span className="font-medium">{vendor.freeDeliveryAbove ? `₹${Number(vendor.freeDeliveryAbove).toLocaleString('en-IN')}` : '—'}</span>
              </div>
              <div className="flex justify-between"><span className="text-executive-muted">Returns</span><span className="text-right max-w-[60%]">{vendor.returnPolicy || '—'}</span></div>
            </div>
          </div>

          {vendor.notes && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              <strong>Notes:</strong> {vendor.notes}
            </div>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="border-t border-gold-100 px-5 py-3 flex gap-2 bg-white">
        <button className="btn-outline text-xs flex-1 justify-center"
          onClick={() => alert(`Draft PO email to:\n${vendor.email}\n\nIn production this triggers nodemailer.`)}>
          <Mail size={13} /> Email PO
        </button>
        <button className="btn-ghost text-xs flex-1 justify-center"
          onClick={() => window.open(`tel:${vendor.phone}`)}>
          <Phone size={13} /> Call
        </button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function VendorManager() {
  const { vendors, ingredients, addVendor, updateVendor, deleteVendor, vendorPrices } = useInventory()
  const [modal,  setModal]  = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')

  const filtered = useMemo(() => vendors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      (v.contactPerson || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.gstNumber || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'All' || v.category === filterCat
    return matchSearch && matchCat
  }), [vendors, search, filterCat])

  const handleSave = (form) => {
    if (modal === 'new') addVendor(form)
    else updateVendor(modal.id, form)
    setModal(null)
  }

  const priceListCount = (vendorId) => vendorPrices.filter(p => p.vendorId === vendorId).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="page-title">Vendor Manager</h1>
          <p className="page-subtitle">Full supplier profiles — GST, bank details, payment & delivery terms</p>
        </div>
        <button className="btn-gold" onClick={() => setModal('new')}>
          <Plus size={16} /> New Vendor
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Vendors',   value: vendors.length, sub: 'registered suppliers' },
          { label: 'GST Verified',    value: vendors.filter(v => v.gstNumber?.length === 15).length, sub: 'complete GST' },
          { label: 'FSSAI Licensed',  value: vendors.filter(v => v.fssaiNumber?.length === 14).length, sub: 'food safety' },
          { label: 'Price Lists',     value: vendorPrices.length, sub: 'active quotes' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="gold-card p-4">
            <p className="text-2xl font-serif font-bold text-executive-dark">{value}</p>
            <p className="text-xs font-semibold text-executive-dark mt-0.5">{label}</p>
            <p className="text-[10px] text-executive-muted">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input className="input-gold flex-1 min-w-48" placeholder="Search by name, contact, GST…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select-gold w-auto" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option>All</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(vendor => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            suppliedCount={ingredients.filter(i => i.vendorId === vendor.id).length}
            priceListCount={priceListCount(vendor.id)}
            onEdit={() => setModal(vendor)}
            onDelete={() => { if (confirm(`Delete ${vendor.name}?`)) deleteVendor(vendor.id) }}
          />
        ))}

        <button onClick={() => setModal('new')}
          className="gold-card border-2 border-dashed border-gold-200 p-5 flex flex-col items-center justify-center gap-3 min-h-[300px] hover:border-gold-400 hover:bg-gold-50 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center group-hover:bg-gold-200 transition-colors">
            <Plus size={22} className="text-gold-600" />
          </div>
          <p className="text-sm font-medium text-gold-600">Add New Vendor</p>
        </button>
      </div>

      {modal && <VendorModal vendor={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  )
}
