import React, { useState } from 'react'
import { Plus, Edit3, Trash2, X, Save, Mail, Phone, MapPin, Package } from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

const CATEGORIES = ['Bakery', 'Meat', 'Produce', 'Dairy', 'Beverages', 'Pantry', 'Condiments', 'Seafood', 'Other']

function VendorModal({ vendor, onClose, onSave }) {
  const [form, setForm] = useState(vendor || {
    name: '', email: '', phone: '', address: '', category: 'Produce', leadTimeDays: 2
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-gold-lg w-full max-w-lg overflow-hidden">
        <div className="bg-executive-dark px-6 py-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-white">{vendor ? 'Edit Vendor' : 'New Vendor'}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="label-gold">Company Name</label>
            <input className="input-gold" placeholder="e.g. Prime Meats Ltd." value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-gold">Email Address</label>
              <input className="input-gold" type="email" placeholder="orders@vendor.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="label-gold">Phone</label>
              <input className="input-gold" placeholder="+1-555-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label-gold">Address</label>
            <input className="input-gold" placeholder="123 Vendor St, City" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-gold">Category</label>
              <select className="select-gold" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-gold">Lead Time (Days)</label>
              <input className="input-gold" type="number" min="1" value={form.leadTimeDays} onChange={e => set('leadTimeDays', parseInt(e.target.value) || 1)} />
            </div>
          </div>
        </div>
        <div className="border-t border-gold-100 px-6 py-4 flex justify-between bg-gray-50">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button className="btn-gold" onClick={() => { if (!form.name.trim()) return alert('Name required'); onSave(form) }}>
            <Save size={16} /> Save Vendor
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VendorManager() {
  const { vendors, ingredients, addVendor, updateVendor, deleteVendor } = useInventory()
  const [modal, setModal] = useState(null)

  const handleSave = (form) => {
    if (modal === 'new') addVendor(form)
    else updateVendor(modal.id, form)
    setModal(null)
  }

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Vendor Manager</h1>
          <p className="page-subtitle">Manage supplier contacts for automated Purchase Order emails</p>
        </div>
        <button className="btn-gold" onClick={() => setModal('new')}>
          <Plus size={16} /> New Vendor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {vendors.map(vendor => {
          const suppliedItems = ingredients.filter(i => i.vendorId === vendor.id)
          return (
            <div key={vendor.id} className="gold-card-hover p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-executive-navy flex items-center justify-center mb-3">
                    <span className="text-gold-400 font-bold text-sm">{vendor.name.charAt(0)}</span>
                  </div>
                  <h3 className="font-serif font-semibold text-executive-dark leading-tight">{vendor.name}</h3>
                  <span className="badge-gold text-[10px] mt-1">{vendor.category}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal(vendor)} className="btn-ghost p-1.5"><Edit3 size={14} /></button>
                  <button onClick={() => { if (confirm('Delete vendor?')) deleteVendor(vendor.id) }} className="btn-ghost p-1.5 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="divider-gold" />

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-executive-muted">
                  <Mail size={13} className="text-gold-500 flex-shrink-0" />
                  <span className="truncate">{vendor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-executive-muted">
                  <Phone size={13} className="text-gold-500 flex-shrink-0" />
                  <span>{vendor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-executive-muted">
                  <MapPin size={13} className="text-gold-500 flex-shrink-0" />
                  <span className="truncate">{vendor.address}</span>
                </div>
                <div className="flex items-center gap-2 text-executive-muted">
                  <Package size={13} className="text-gold-500 flex-shrink-0" />
                  <span>{suppliedItems.length} item{suppliedItems.length !== 1 ? 's' : ''} supplied</span>
                  <span className="text-gold-500">| Lead: {vendor.leadTimeDays}d</span>
                </div>
              </div>

              {suppliedItems.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {suppliedItems.slice(0, 4).map(i => (
                    <span key={i.id} className="text-[10px] bg-gold-50 border border-gold-200 text-gold-700 px-2 py-0.5 rounded-full">{i.name}</span>
                  ))}
                  {suppliedItems.length > 4 && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">+{suppliedItems.length - 4} more</span>
                  )}
                </div>
              )}

              <button
                className="btn-outline text-xs w-full justify-center"
                onClick={() => alert(`Email drafted to ${vendor.email}.\n\nIn production, this triggers a PO email via nodemailer.`)}
              >
                <Mail size={14} /> Send Test Email
              </button>
            </div>
          )
        })}

        <button
          onClick={() => setModal('new')}
          className="gold-card border-2 border-dashed border-gold-200 p-5 flex flex-col items-center justify-center gap-3 min-h-[280px] hover:border-gold-400 hover:bg-gold-50 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center group-hover:bg-gold-200 transition-colors">
            <Plus size={22} className="text-gold-600" />
          </div>
          <p className="text-sm font-medium text-gold-600">Add New Vendor</p>
        </button>
      </div>

      {modal && (
        <VendorModal
          vendor={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
