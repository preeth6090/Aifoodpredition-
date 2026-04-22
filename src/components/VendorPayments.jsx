import React, { useMemo, useState } from 'react'
import {
  CreditCard, CheckCircle, Clock, AlertTriangle, X, IndianRupee,
  ChevronDown, ChevronRight, Building2, Calendar, FileText, Undo2
} from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

const TERMS_DAYS = { 'COD': 0, 'Advance': -1, 'Net 7': 7, 'Net 15': 15, 'Net 30': 30 }

function addDays(dateStr, days) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function daysDiff(dateStr) {
  if (!dateStr) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const d     = new Date(dateStr); d.setHours(0,0,0,0)
  return Math.round((d - today) / 86400000)
}

function invoiceAmount(po) {
  const items = po.receivedItems || po.items.map(i => ({ ...i, receivedQty: i.quantity, itemStatus: 'received' }))
  return items.reduce((s, i) => {
    if (i.itemStatus === 'rejected') return s
    return s + (i.receivedQty || i.quantity) * (i.unitCost || 0)
  }, 0)
}

function PaymentModal({ invoice, vendor, onConfirm, onClose }) {
  const [paidBy, setPaidBy] = useState('Admin')
  const [notes,  setNotes]  = useState('')
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ background: 'var(--th-bg)' }}>
          <h2 className="font-serif font-semibold text-base" style={{ color: 'var(--th-text)' }}>
            Mark as Paid
          </h2>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--th-text)', opacity: 0.7 }} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-xl p-4" style={{ background: 'var(--kpi-bg)', border: '1px solid var(--kpi-border)' }}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Invoice</span>
              <span className="font-semibold text-gray-800">{invoice.poId}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Vendor</span>
              <span className="font-semibold text-gray-800">{vendor?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-bold text-lg font-serif" style={{ color: 'var(--primary)' }}>
                ₹{invoice.amount.toFixed(2)}
              </span>
            </div>
          </div>
          <div>
            <label className="label-gold">Paid By</label>
            <input className="input-gold" value={paidBy} onChange={e => setPaidBy(e.target.value)} />
          </div>
          <div>
            <label className="label-gold">Notes (optional)</label>
            <input className="input-gold" placeholder="e.g. NEFT ref: 123456" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
        <div className="border-t px-6 py-4 flex justify-between bg-gray-50"
          style={{ borderColor: 'var(--card-border)' }}>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button className="btn-gold" onClick={() => onConfirm(paidBy, notes)}>
            <CheckCircle size={16} /> Confirm Payment
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VendorPayments() {
  const { purchaseOrders, vendors, payments, markPaymentPaid, unmarkPaymentPaid } = useInventory()
  const [expandedVendors, setExpandedVendors] = useState({})
  const [filterStatus,    setFilterStatus]    = useState('All')
  const [payModal,        setPayModal]        = useState(null)

  const invoices = useMemo(() => {
    return purchaseOrders
      .filter(po => ['received', 'partial', 'approved'].includes(po.status))
      .map(po => {
        const vendor   = vendors.find(v => v.id === po.vendorId)
        const terms    = vendor?.paymentTerms || 'Net 30'
        const termDays = TERMS_DAYS[terms] ?? 30
        const baseDate = po.receivedAt || po.approvedAt || po.createdAt
        const dueDate  = termDays >= 0 ? addDays(baseDate, termDays) : null
        const payment  = payments.find(p => p.poId === po.id)
        const amount   = invoiceAmount(po)
        const diff     = dueDate ? daysDiff(dueDate) : null

        let status = 'pending'
        if (payment)       status = 'paid'
        else if (diff === null) status = 'na'
        else if (diff < 0)  status = 'overdue'
        else if (diff <= 3) status = 'due-soon'

        return {
          poId: po.id, vendorId: po.vendorId, vendor,
          invoiceDate: baseDate, dueDate, terms, termDays,
          amount, status, payment, daysLeft: diff,
        }
      })
  }, [purchaseOrders, vendors, payments])

  const filtered = useMemo(() => {
    if (filterStatus === 'All')     return invoices
    if (filterStatus === 'Pending') return invoices.filter(i => i.status === 'pending' || i.status === 'due-soon')
    if (filterStatus === 'Overdue') return invoices.filter(i => i.status === 'overdue')
    if (filterStatus === 'Paid')    return invoices.filter(i => i.status === 'paid')
    return invoices
  }, [invoices, filterStatus])

  const totals = useMemo(() => {
    const outstanding = invoices.filter(i => i.status !== 'paid' && i.status !== 'na')
    return {
      total:      invoices.reduce((s, i) => s + i.amount, 0),
      pending:    outstanding.reduce((s, i) => s + i.amount, 0),
      overdue:    invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0),
      paid:       invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
      overdueCount: invoices.filter(i => i.status === 'overdue').length,
    }
  }, [invoices])

  const aging = useMemo(() => {
    const unpaid = invoices.filter(i => i.status !== 'paid' && i.daysLeft !== null)
    return {
      current:  unpaid.filter(i => i.daysLeft >= 0).reduce((s, i) => s + i.amount, 0),
      d30:      unpaid.filter(i => i.daysLeft < 0 && i.daysLeft >= -30).reduce((s, i) => s + i.amount, 0),
      d60:      unpaid.filter(i => i.daysLeft < -30 && i.daysLeft >= -60).reduce((s, i) => s + i.amount, 0),
      d60plus:  unpaid.filter(i => i.daysLeft < -60).reduce((s, i) => s + i.amount, 0),
    }
  }, [invoices])

  const byVendor = useMemo(() => {
    const map = {}
    filtered.forEach(inv => {
      if (!map[inv.vendorId]) map[inv.vendorId] = { vendor: inv.vendor, invoices: [] }
      map[inv.vendorId].invoices.push(inv)
    })
    return Object.values(map).sort((a, b) => {
      const aOut = a.invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)
      const bOut = b.invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)
      return bOut - aOut
    })
  }, [filtered])

  const toggleVendor = (id) => setExpandedVendors(p => ({ ...p, [id]: !p[id] }))

  const statusBadge = (inv) => {
    if (inv.status === 'paid')     return <span className="badge-green text-[10px]">Paid</span>
    if (inv.status === 'overdue')  return <span className="badge-red text-[10px]">Overdue {Math.abs(inv.daysLeft)}d</span>
    if (inv.status === 'due-soon') return <span className="badge-amber text-[10px]">Due in {inv.daysLeft}d</span>
    if (inv.status === 'pending')  return <span className="badge-blue text-[10px]">Pending · {inv.daysLeft}d left</span>
    return <span className="badge-gray text-[10px]">COD / N/A</span>
  }

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Vendor Payments</h1>
          <p className="page-subtitle">Invoice ledger, payment status & accounts payable aging</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center gap-2">
            <IndianRupee size={15} style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Invoiced</span>
          </div>
          <p className="text-2xl font-serif font-bold text-executive-dark">₹{totals.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-gray-500">{invoices.length} invoices</p>
        </div>
        <div className="kpi-card" style={{ background: totals.overdue > 0 ? '#fff5f5' : 'var(--kpi-bg)', borderColor: totals.overdue > 0 ? '#fecaca' : 'var(--kpi-border)' }}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className={totals.overdue > 0 ? 'text-red-500' : 'text-gray-400'} />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overdue</span>
          </div>
          <p className={`text-2xl font-serif font-bold ${totals.overdue > 0 ? 'text-red-600' : 'text-executive-dark'}`}>
            ₹{totals.overdue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500">{totals.overdueCount} invoices overdue</p>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-2">
            <Clock size={15} style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Outstanding</span>
          </div>
          <p className="text-2xl font-serif font-bold text-executive-dark">₹{totals.pending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-gray-500">Unpaid invoices</p>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-green-500" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid</span>
          </div>
          <p className="text-2xl font-serif font-bold text-green-600">₹{totals.paid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-gray-500">Cleared</p>
        </div>
      </div>

      {/* Aging Report */}
      <div className="gold-card p-5">
        <h2 className="font-serif font-semibold text-executive-dark mb-4">Accounts Payable Aging</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Current (Not Yet Due)', amount: aging.current, cls: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
            { label: 'Overdue 1–30 Days',     amount: aging.d30,     cls: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
            { label: 'Overdue 31–60 Days',    amount: aging.d60,     cls: 'text-orange-700',bg: 'bg-orange-50',border: 'border-orange-200' },
            { label: 'Overdue 60+ Days',      amount: aging.d60plus, cls: 'text-red-700',   bg: 'bg-red-50',   border: 'border-red-200' },
          ].map(a => (
            <div key={a.label} className={`rounded-xl p-4 border ${a.bg} ${a.border}`}>
              <p className="text-xs text-gray-500 mb-2">{a.label}</p>
              <p className={`text-xl font-serif font-bold ${a.cls}`}>
                ₹{a.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'Pending', 'Overdue', 'Paid'].map(f => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all`}
            style={{
              background:   filterStatus === f ? 'var(--btn-from)' : '#ffffff',
              color:        filterStatus === f ? '#ffffff' : '#6b7280',
              border:       `1.5px solid ${filterStatus === f ? 'var(--btn-from)' : '#e2e8f0'}`,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Vendor Groups */}
      <div className="space-y-3">
        {byVendor.length === 0 && (
          <div className="gold-card p-12 text-center text-gray-400">
            <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-serif text-lg">No invoices found</p>
            <p className="text-sm mt-1">Received purchase orders appear here as invoices.</p>
          </div>
        )}

        {byVendor.map(({ vendor, invoices: vInvoices }) => {
          const vid        = vendor?.id ?? 0
          const isOpen     = expandedVendors[vid] !== false
          const outstanding = vInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)
          const hasOverdue  = vInvoices.some(i => i.status === 'overdue')
          const allPaid     = vInvoices.every(i => i.status === 'paid')

          return (
            <div key={vid} className="gold-card overflow-hidden">
              {/* Vendor Header */}
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => toggleVendor(vid)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: 'var(--th-bg)' }}>
                    <Building2 size={18} style={{ color: 'var(--th-text)' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-executive-dark">{vendor?.name || 'Unknown Vendor'}</p>
                    <p className="text-xs text-gray-500">{vendor?.paymentTerms} · {vendor?.contactPerson} · {vendor?.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-0.5">Outstanding</p>
                    <p className={`font-serif font-bold text-lg ${hasOverdue ? 'text-red-600' : allPaid ? 'text-green-600' : 'text-executive-dark'}`}>
                      ₹{outstanding.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {hasOverdue && <span className="badge-red text-[10px]">Has Overdue</span>}
                    {allPaid    && <span className="badge-green text-[10px]">All Cleared</span>}
                    <span className="text-xs text-gray-400">{vInvoices.length} invoice{vInvoices.length > 1 ? 's' : ''}</span>
                  </div>
                  {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                </div>
              </button>

              {/* Invoice List */}
              {isOpen && (
                <div className="border-t" style={{ borderColor: 'var(--card-border)' }}>
                  <table className="table-gold">
                    <thead>
                      <tr>
                        <th>PO / Invoice</th>
                        <th>Invoice Date</th>
                        <th>Payment Terms</th>
                        <th>Due Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Paid On</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vInvoices.map(inv => (
                        <tr key={inv.poId} className={inv.status === 'overdue' ? 'bg-red-50/50' : inv.status === 'paid' ? 'bg-green-50/30' : ''}>
                          <td>
                            <div className="flex items-center gap-2">
                              <FileText size={13} className="text-gray-400" />
                              <span className="font-mono text-xs font-semibold text-executive-dark">{inv.poId}</span>
                            </div>
                          </td>
                          <td className="text-xs text-gray-500">{inv.invoiceDate || '—'}</td>
                          <td>
                            <span className="badge-gold text-[10px]">{inv.terms}</span>
                          </td>
                          <td className="text-xs">
                            {inv.dueDate ? (
                              <span className={inv.status === 'overdue' ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                                {inv.dueDate}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="font-serif font-semibold text-executive-dark">
                            ₹{inv.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </td>
                          <td>{statusBadge(inv)}</td>
                          <td className="text-xs text-gray-500">
                            {inv.payment ? (
                              <div>
                                <p>{inv.payment.paidAt.split('T')[0]}</p>
                                {inv.payment.notes && <p className="text-[10px] text-gray-400">{inv.payment.notes}</p>}
                              </div>
                            ) : '—'}
                          </td>
                          <td>
                            {inv.status === 'paid' ? (
                              <button
                                onClick={() => unmarkPaymentPaid(inv.poId)}
                                className="btn-ghost p-1.5 text-xs flex items-center gap-1"
                                title="Unmark payment"
                              >
                                <Undo2 size={12} /> Unmark
                              </button>
                            ) : (
                              <button
                                className="btn-gold text-xs py-1 px-3"
                                onClick={() => setPayModal(inv)}
                              >
                                <CheckCircle size={12} /> Pay
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2" style={{ background: 'var(--kpi-bg)', borderColor: 'var(--kpi-border)' }}>
                        <td colSpan={4} className="px-4 py-3 font-semibold text-executive-dark text-sm">
                          Total Outstanding — {vendor?.name}
                        </td>
                        <td className="px-4 py-3 font-serif font-bold text-lg" style={{ color: hasOverdue ? '#dc2626' : 'var(--primary)' }}>
                          ₹{outstanding.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td colSpan={3} />
                      </tr>
                    </tfoot>
                  </table>

                  {/* Bank Details Strip */}
                  {vendor?.accountNumber && (
                    <div className="px-5 py-3 flex items-center gap-6 text-xs text-gray-500 flex-wrap"
                      style={{ background: 'var(--kpi-bg)', borderTop: `1px solid var(--kpi-border)` }}>
                      <span className="font-semibold text-gray-700">Bank Details:</span>
                      <span>{vendor.bankName}</span>
                      <span className="font-mono">{vendor.accountNumber}</span>
                      <span>IFSC: {vendor.ifscCode}</span>
                      <span className="badge-gray">{vendor.accountType}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {payModal && (
        <PaymentModal
          invoice={payModal}
          vendor={payModal.vendor}
          onConfirm={(paidBy, notes) => { markPaymentPaid(payModal.poId, paidBy, notes); setPayModal(null) }}
          onClose={() => setPayModal(null)}
        />
      )}
    </div>
  )
}
