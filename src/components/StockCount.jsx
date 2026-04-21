import React, { useState, useRef, useEffect } from 'react'
import { ClipboardList, Pen, RotateCcw, Check, Save, AlertTriangle, Calendar } from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

const STAFF_LIST = ['Maria G.', 'James R.', 'Sarah L.', 'Tom B.', 'Anna K.', 'John Smith']

function SignaturePad({ onSave, onClear }) {
  const canvasRef = useRef(null)
  const drawing   = useRef(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas  = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#1A2540'
    ctx.lineWidth   = 2
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      return { x: clientX - rect.left, y: clientY - rect.top }
    }

    const start = (e) => {
      e.preventDefault()
      drawing.current = true
      const { x, y } = getPos(e)
      ctx.beginPath()
      ctx.moveTo(x, y)
    }

    const move = (e) => {
      e.preventDefault()
      if (!drawing.current) return
      const { x, y } = getPos(e)
      ctx.lineTo(x, y)
      ctx.stroke()
      setHasSignature(true)
    }

    const end = (e) => {
      e.preventDefault()
      drawing.current = false
      if (hasSignature || canvas.toDataURL() !== blankCanvas(canvas)) {
        onSave(canvas.toDataURL())
      }
    }

    canvas.addEventListener('mousedown',  start)
    canvas.addEventListener('mousemove',  move)
    canvas.addEventListener('mouseup',    end)
    canvas.addEventListener('mouseleave', end)
    canvas.addEventListener('touchstart', start, { passive: false })
    canvas.addEventListener('touchmove',  move,  { passive: false })
    canvas.addEventListener('touchend',   end)

    return () => {
      canvas.removeEventListener('mousedown',  start)
      canvas.removeEventListener('mousemove',  move)
      canvas.removeEventListener('mouseup',    end)
      canvas.removeEventListener('mouseleave', end)
      canvas.removeEventListener('touchstart', start)
      canvas.removeEventListener('touchmove',  move)
      canvas.removeEventListener('touchend',   end)
    }
  }, [onSave, hasSignature])

  const blankCanvas = (canvas) => {
    const tmp = document.createElement('canvas')
    tmp.width  = canvas.width
    tmp.height = canvas.height
    return tmp.toDataURL()
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    onClear()
  }

  return (
    <div className="border-2 border-dashed border-gold-300 rounded-xl overflow-hidden bg-white relative">
      <canvas
        ref={canvasRef}
        width={440}
        height={120}
        className="w-full cursor-crosshair touch-none block"
        style={{ height: '120px' }}
      />
      <div className="absolute bottom-2 left-3 text-[10px] text-executive-muted pointer-events-none select-none">
        Sign above to confirm stock count
      </div>
      <button
        onClick={clear}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-white border border-gray-200 text-executive-muted hover:text-red-500 hover:border-red-200 transition-colors"
        title="Clear signature"
      >
        <RotateCcw size={13} />
      </button>
      {hasSignature && (
        <div className="absolute top-2 left-2 p-1.5 rounded-lg bg-green-100 border border-green-200">
          <Check size={13} className="text-green-600" />
        </div>
      )}
    </div>
  )
}

export default function StockCount() {
  const { ingredients, stockCounts, submitStockCount, getVarianceData } = useInventory()
  const [staff,     setStaff]     = useState(STAFF_LIST[0])
  const [counts,    setCounts]    = useState({})
  const [signature, setSignature] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [filterCat, setFilterCat] = useState('All')

  const categories = ['All', ...new Set(ingredients.map(i => i.category))]
  const filtered   = ingredients.filter(i => filterCat === 'All' || i.category === filterCat)

  const setCount = (id, val) => setCounts(c => ({ ...c, [id]: parseFloat(val) }))

  const variancePreview = ingredients.map(ing => {
    const physCount = counts[ing.id] !== undefined ? counts[ing.id] : ing.currentStock
    const diff      = parseFloat((ing.currentStock - physCount).toFixed(3))
    const pct       = ing.currentStock > 0 ? Math.abs((diff / ing.currentStock) * 100) : 0
    return { ...ing, physCount, diff, pct }
  })

  const totalVarianceItems = variancePreview.filter(v => Math.abs(v.diff) > 0.01).length

  const handleSubmit = () => {
    if (!signature) return alert('Please sign the stock count before submitting.')
    const items = ingredients.map(ing => ({
      ingredientId: ing.id,
      physicalCount: counts[ing.id] !== undefined ? counts[ing.id] : ing.currentStock,
    }))
    submitStockCount({ countedBy: staff, signature, items })
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Daily Stock Count</h1>
          <p className="page-subtitle">Enter physical counts — staff must sign off to submit</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-executive-muted bg-white border border-gold-200 rounded-lg px-3 py-2">
          <Calendar size={14} className="text-gold-500" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {submitted && (
        <div className="gold-card p-4 bg-green-50 border-green-200 flex items-center gap-3">
          <Check size={20} className="text-green-600" />
          <div>
            <p className="font-semibold text-green-800">Stock count submitted successfully!</p>
            <p className="text-xs text-green-600">Inventory has been updated. Variance analysis is now available.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Count Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap gap-3">
            <select className="select-gold w-auto" value={staff} onChange={e => setStaff(e.target.value)}>
              {STAFF_LIST.map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="flex gap-2 flex-wrap">
              {categories.map(c => (
                <button key={c} onClick={() => setFilterCat(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterCat === c ? 'bg-gold-500 text-white' : 'bg-white border border-gray-200 text-executive-muted hover:border-gold-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="gold-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-gold">
                <thead>
                  <tr>
                    <th>Ingredient</th>
                    <th>Unit</th>
                    <th>System Stock</th>
                    <th>Physical Count</th>
                    <th>Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(ing => {
                    const vp      = variancePreview.find(v => v.id === ing.id)
                    const entered = counts[ing.id] !== undefined
                    const diff    = vp?.diff || 0
                    return (
                      <tr key={ing.id}>
                        <td>
                          <div className="font-medium text-executive-dark">{ing.name}</div>
                          <div className="text-[10px] text-executive-muted">{ing.category}</div>
                        </td>
                        <td className="text-executive-muted">{ing.unit}</td>
                        <td className="font-mono">{ing.currentStock}</td>
                        <td>
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            className={`input-gold w-28 ${entered ? 'border-gold-400 bg-gold-50' : ''}`}
                            placeholder={ing.currentStock}
                            value={counts[ing.id] !== undefined ? counts[ing.id] : ''}
                            onChange={e => setCount(ing.id, e.target.value)}
                          />
                        </td>
                        <td>
                          {entered && (
                            <span className={`font-mono text-xs font-semibold ${
                              Math.abs(diff) < 0.01 ? 'text-green-600'
                              : diff > 0 ? 'text-red-600'
                              : 'text-blue-600'
                            }`}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(3)}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Signature + Submit Panel */}
        <div className="space-y-4">
          <div className="gold-card p-5 space-y-4 sticky top-0">
            <div>
              <h2 className="font-serif font-semibold text-executive-dark mb-1">Sign Off</h2>
              <p className="text-xs text-executive-muted">
                Counted by <strong>{staff}</strong>. Sign below to certify this count.
              </p>
            </div>

            <div>
              <label className="label-gold">Staff Member</label>
              <select className="select-gold" value={staff} onChange={e => setStaff(e.target.value)}>
                {STAFF_LIST.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="label-gold flex items-center gap-2">
                <Pen size={12} /> Digital Signature
              </label>
              <SignaturePad
                onSave={setSignature}
                onClear={() => setSignature(null)}
              />
              {signature && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Check size={12} /> Signature captured
                </p>
              )}
            </div>

            {totalVarianceItems > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    <strong>{totalVarianceItems} item{totalVarianceItems !== 1 ? 's' : ''}</strong> have variance from system stock. These will be flagged in the Variance Analysis.
                  </p>
                </div>
              </div>
            )}

            <button
              className={`btn-gold w-full justify-center ${!signature ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!signature}
              onClick={handleSubmit}
            >
              <Save size={16} /> Submit Stock Count
            </button>

            {!signature && (
              <p className="text-xs text-center text-executive-muted">Signature required to submit</p>
            )}
          </div>

          {/* Previous Counts */}
          {stockCounts.length > 0 && (
            <div className="gold-card p-4">
              <h3 className="font-serif font-semibold text-executive-dark mb-3 text-sm">Recent Counts</h3>
              <div className="space-y-2">
                {stockCounts.slice(0, 3).map(sc => (
                  <div key={sc.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-executive-dark">{sc.date}</p>
                      <p className="text-[10px] text-executive-muted">By {sc.countedBy}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-executive-dark">{sc.items.length} items</p>
                      {sc.signature && <p className="text-[10px] text-green-600">Signed</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
