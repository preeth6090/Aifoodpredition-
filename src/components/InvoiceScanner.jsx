import React, { useState, useRef, useCallback } from 'react'
import { Upload, ScanLine, FileText, Check, Trash2, Eye, X, Download, Tag } from 'lucide-react'

const MOCK_SCANNED = [
  { id: 1, fileName: 'invoice_prime_meats_apr19.pdf', vendor: 'Prime Meats Ltd.', date: '2026-04-19', total: '$318.50', items: 4, status: 'processed', confidence: 97 },
  { id: 2, fileName: 'golden_bakery_weekly.jpg',      vendor: 'Golden Bakery Co.',  date: '2026-04-18', total: '$142.00', items: 2, status: 'processed', confidence: 93 },
  { id: 3, fileName: 'produce_fresh_farm_apr17.pdf',  vendor: 'Fresh Farm Produce', date: '2026-04-17', total: '$89.60',  items: 6, status: 'review',    confidence: 78 },
]

function ScannedInvoiceModal({ invoice, onClose }) {
  const mockLineItems = [
    { description: 'Burger Bun × 200',   qty: 200, unit: 'pcs', unitPrice: 0.50, total: 100.00 },
    { description: 'Beef Patty × 50',    qty: 50,  unit: 'pcs', unitPrice: 2.50, total: 125.00 },
    { description: 'Lettuce 10kg',        qty: 10,  unit: 'kg',  unitPrice: 1.20, total: 12.00  },
    { description: 'Delivery Charge',     qty: 1,   unit: '-',   unitPrice: 8.50, total: 8.50   },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-gold-lg w-full max-w-xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="bg-executive-dark px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold text-white">Invoice Preview</h2>
            <p className="text-xs text-gold-400 mt-0.5">{invoice.fileName}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="gold-card p-3">
              <p className="text-[10px] text-executive-muted uppercase tracking-wider">Vendor</p>
              <p className="text-sm font-semibold text-executive-dark mt-1">{invoice.vendor}</p>
            </div>
            <div className="gold-card p-3">
              <p className="text-[10px] text-executive-muted uppercase tracking-wider">Date</p>
              <p className="text-sm font-semibold text-executive-dark mt-1">{invoice.date}</p>
            </div>
            <div className="gold-card p-3">
              <p className="text-[10px] text-executive-muted uppercase tracking-wider">OCR Confidence</p>
              <p className={`text-sm font-semibold mt-1 ${invoice.confidence > 90 ? 'text-green-600' : 'text-amber-600'}`}>
                {invoice.confidence}%
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-executive-dark text-sm mb-3">Extracted Line Items</h3>
            <table className="table-gold">
              <thead>
                <tr><th>Description</th><th>Qty</th><th>Unit</th><th>Unit Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                {mockLineItems.map((item, i) => (
                  <tr key={i}>
                    <td className="font-medium">{item.description}</td>
                    <td>{item.qty}</td>
                    <td className="text-executive-muted">{item.unit}</td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td className="font-semibold">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gold-50 border-t-2 border-gold-200">
                  <td colSpan={4} className="px-4 py-3 font-bold text-executive-dark">Total</td>
                  <td className="px-4 py-3 font-bold text-gold-700">{invoice.total}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
            <strong>Match to PO:</strong> In production, this would auto-match line items to open Purchase Orders and flag discrepancies for review.
          </div>
        </div>

        <div className="border-t border-gold-100 px-6 py-4 flex justify-between bg-gray-50">
          <button onClick={onClose} className="btn-ghost">Close</button>
          <div className="flex gap-2">
            <button className="btn-outline text-xs">
              <Download size={14} /> Export
            </button>
            <button className="btn-gold text-xs">
              <Check size={14} /> Match to PO
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InvoiceScanner() {
  const [isDragging, setIsDragging]   = useState(false)
  const [scanned,    setScanned]      = useState(MOCK_SCANNED)
  const [scanning,   setScanning]     = useState(false)
  const [viewDetail, setViewDetail]   = useState(null)
  const [progress,   setProgress]     = useState(0)
  const fileInputRef = useRef(null)

  const processFile = useCallback((file) => {
    if (!file) return
    setScanning(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100 }
        return p + Math.random() * 15
      })
    }, 150)

    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      const newInvoice = {
        id: Date.now(),
        fileName: file.name,
        vendor: 'Auto-Detected Vendor',
        date: new Date().toISOString().split('T')[0],
        total: `$${(Math.random() * 500 + 50).toFixed(2)}`,
        items: Math.floor(Math.random() * 8) + 2,
        status: 'review',
        confidence: Math.floor(Math.random() * 20) + 75,
      }
      setScanned(prev => [newInvoice, ...prev])
      setScanning(false)
      setProgress(0)
    }, 2500)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) processFile(file)
  }

  const removeInvoice = (id) => setScanned(prev => prev.filter(i => i.id !== id))

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Invoice Scanner</h1>
          <p className="page-subtitle">Drag & drop invoices for automatic OCR extraction and PO matching</p>
        </div>
        <span className="badge-amber">UI Preview</span>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !scanning && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-gold-500 bg-gold-50 scale-[1.01]'
            : 'border-gold-300 bg-white hover:border-gold-400 hover:bg-gold-50'
        }`}
      >
        <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileInput} />

        {scanning ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-gold-500 border-t-transparent animate-spin mx-auto" />
            <div>
              <p className="font-semibold text-executive-dark">Scanning Invoice…</p>
              <p className="text-sm text-executive-muted mt-1">Extracting line items with OCR</p>
            </div>
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
              <div
                className="h-full bg-gradient-to-r from-gold-500 to-gold-300 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
            <p className="text-xs text-gold-600 font-medium">{Math.min(100, Math.round(progress))}%</p>
          </div>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${isDragging ? 'bg-gold-200' : 'bg-gold-100'}`}>
              <ScanLine size={28} className="text-gold-600" />
            </div>
            <p className="text-lg font-serif font-semibold text-executive-dark">
              {isDragging ? 'Release to Upload' : 'Drop Invoice Here'}
            </p>
            <p className="text-sm text-executive-muted mt-2">Supports PDF, JPG, PNG — drag & drop or click to browse</p>
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-executive-muted">
              <span className="flex items-center gap-1.5"><Check size={12} className="text-green-500" /> Auto-vendor detection</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-green-500" /> OCR line item extraction</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-green-500" /> PO matching</span>
            </div>
          </>
        )}
      </div>

      {/* Scanned Invoices Table */}
      <div className="gold-card overflow-hidden">
        <div className="section-header px-5 pt-5 pb-3">
          <h2 className="font-serif font-semibold text-executive-dark">Scanned Invoices</h2>
          <span className="badge-gold">{scanned.length} invoices</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-gold">
            <thead>
              <tr>
                <th>File</th>
                <th>Vendor (Detected)</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scanned.map(inv => (
                <tr key={inv.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-gold-500 flex-shrink-0" />
                      <span className="text-xs truncate max-w-[160px]" title={inv.fileName}>{inv.fileName}</span>
                    </div>
                  </td>
                  <td className="font-medium text-executive-dark">{inv.vendor}</td>
                  <td className="text-executive-muted">{inv.date}</td>
                  <td>{inv.items}</td>
                  <td className="font-semibold text-gold-700">{inv.total}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${inv.confidence > 90 ? 'bg-green-500' : inv.confidence > 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${inv.confidence}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${inv.confidence > 90 ? 'text-green-600' : inv.confidence > 75 ? 'text-amber-600' : 'text-red-600'}`}>
                        {inv.confidence}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={inv.status === 'processed' ? 'badge-green' : 'badge-amber'}>
                      {inv.status === 'processed' ? 'Processed' : 'Needs Review'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn-ghost p-1.5" onClick={() => setViewDetail(inv)} title="View"><Eye size={14} /></button>
                      <button className="btn-ghost p-1.5 hover:text-red-500" onClick={() => removeInvoice(inv.id)} title="Remove">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {scanned.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-executive-muted">No invoices scanned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewDetail && <ScannedInvoiceModal invoice={viewDetail} onClose={() => setViewDetail(null)} />}
    </div>
  )
}
