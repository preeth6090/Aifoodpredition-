import React, { useState, useMemo } from 'react'
import { ShoppingBag, Plus, Minus, Receipt, Clock, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

const STAFF_LIST = ['Maria G.', 'James R.', 'Sarah L.', 'Tom B.', 'Anna K.']

export default function SalesRecorder() {
  const { recipes, ingredients, sales, recordSale, calcRecipeCost } = useInventory()
  const [cart,      setCart]      = useState([])  // [{ recipeId, qty }]
  const [staff,     setStaff]     = useState(STAFF_LIST[0])
  const [submitted, setSubmitted] = useState(false)
  const [filterCat, setFilterCat] = useState('All')

  const categories = useMemo(() => ['All', ...new Set(recipes.map(r => r.category))], [recipes])

  const filtered = recipes.filter(r => filterCat === 'All' || r.category === filterCat)

  const addToCart = (recipeId) => {
    setCart(prev => {
      const exists = prev.find(c => c.recipeId === recipeId)
      if (exists) return prev.map(c => c.recipeId === recipeId ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { recipeId, qty: 1 }]
    })
  }

  const updateQty = (recipeId, delta) => {
    setCart(prev => {
      const updated = prev.map(c => c.recipeId === recipeId ? { ...c, qty: Math.max(0, c.qty + delta) } : c)
      return updated.filter(c => c.qty > 0)
    })
  }

  const removeFromCart = (recipeId) => setCart(prev => prev.filter(c => c.recipeId !== recipeId))

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const r = recipes.find(r => r.id === item.recipeId)
      return sum + (r ? r.sellingPrice * item.qty : 0)
    }, 0)
  }, [cart, recipes])

  const cartCost = useMemo(() => {
    return cart.reduce((sum, item) => {
      const r = recipes.find(r => r.id === item.recipeId)
      return sum + (r ? calcRecipeCost(r) * item.qty : 0)
    }, 0)
  }, [cart, recipes, calcRecipeCost])

  const canFulfill = useMemo(() => {
    const needed = {}
    cart.forEach(({ recipeId, qty }) => {
      const r = recipes.find(r => r.id === recipeId)
      if (!r) return
      r.ingredients.forEach(ri => {
        needed[ri.ingredientId] = (needed[ri.ingredientId] || 0) + ri.quantity * qty
      })
    })
    const warnings = []
    Object.entries(needed).forEach(([ingId, total]) => {
      const ing = ingredients.find(i => i.id === parseInt(ingId))
      if (ing && ing.currentStock < total) {
        warnings.push(`${ing.name}: need ${total.toFixed(2)}, have ${ing.currentStock.toFixed(2)}`)
      }
    })
    return warnings
  }, [cart, recipes, ingredients])

  const handleSubmit = () => {
    if (cart.length === 0) return
    cart.forEach(({ recipeId, qty }) => recordSale(recipeId, qty, staff))
    setSubmitted(true)
    setTimeout(() => { setCart([]); setSubmitted(false) }, 2500)
  }

  // Today's sales
  const today = new Date().toISOString().split('T')[0]
  const todaySales = sales.filter(s => s.timestamp.startsWith(today))

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Sales Recorder</h1>
          <p className="page-subtitle">Record sales to automatically deplete inventory in real-time</p>
        </div>
        <select className="select-gold w-auto" value={staff} onChange={e => setStaff(e.target.value)}>
          {STAFF_LIST.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {submitted && (
        <div className="gold-card p-4 bg-green-50 border-green-200 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600" />
          <div>
            <p className="font-semibold text-green-800">Sale recorded successfully!</p>
            <p className="text-xs text-green-600">Inventory has been updated in real-time.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Menu Selector */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setFilterCat(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterCat === c ? 'bg-gold-500 text-white' : 'bg-white border border-gray-200 text-executive-muted hover:border-gold-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(recipe => {
              const cost       = calcRecipeCost(recipe)
              const margin     = recipe.sellingPrice ? ((recipe.sellingPrice - cost) / recipe.sellingPrice * 100) : 0
              const inCart     = cart.find(c => c.recipeId === recipe.id)
              return (
                <div key={recipe.id} className={`gold-card p-4 cursor-pointer transition-all ${inCart ? 'border-gold-400 shadow-gold bg-gold-50' : 'hover:shadow-gold hover:border-gold-300'}`}
                  onClick={() => addToCart(recipe.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="badge-gold text-[10px] mb-1">{recipe.category}</span>
                      <h3 className="font-serif font-semibold text-executive-dark">{recipe.name}</h3>
                    </div>
                    {inCart && (
                      <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center text-white text-xs font-bold">
                        {inCart.qty}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-executive-muted">
                      Cost: ₹{cost.toFixed(2)} | Margin: {margin.toFixed(0)}%
                    </div>
                    <span className="font-serif font-bold text-gold-700 text-lg">₹{recipe.sellingPrice?.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-executive-muted mt-1 flex flex-wrap gap-1">
                    {recipe.ingredients.map((ri, i) => {
                      const ing = ingredients.find(ing => ing.id === ri.ingredientId)
                      return <span key={i} className="bg-gray-100 px-1.5 py-0.5 rounded">{ing?.name}: {ri.quantity}{ing?.unit}</span>
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cart / Order Summary */}
        <div className="space-y-4">
          <div className="gold-card p-4 sticky top-0">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag size={18} className="text-gold-600" />
              <h2 className="font-serif font-semibold text-executive-dark">Current Order</h2>
              <span className="ml-auto badge-gold">{cart.reduce((s, c) => s + c.qty, 0)} items</span>
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-executive-muted text-sm">
                <ShoppingBag size={28} className="mx-auto text-gold-200 mb-2" />
                Click items to add them to the order
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {cart.map(({ recipeId, qty }) => {
                  const r = recipes.find(r => r.id === recipeId)
                  if (!r) return null
                  return (
                    <div key={recipeId} className="flex items-center gap-2 py-2 border-b border-gray-100">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-executive-dark truncate">{r.name}</p>
                        <p className="text-xs text-executive-muted">₹{(r.sellingPrice * qty).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQty(recipeId, -1)} className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-gold-400 transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                        <button onClick={() => updateQty(recipeId, 1)} className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-gold-400 transition-colors">
                          <Plus size={12} />
                        </button>
                        <button onClick={() => removeFromCart(recipeId)} className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {canFulfill.length > 0 && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg mb-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-1">Insufficient stock:</p>
                    {canFulfill.map((w, i) => <p key={i} className="text-xs text-red-600">{w}</p>)}
                  </div>
                </div>
              </div>
            )}

            {cart.length > 0 && (
              <div className="border-t border-gold-100 pt-3 mt-2 space-y-1.5">
                <div className="flex justify-between text-xs text-executive-muted">
                  <span>Food Cost</span>
                  <span>₹{cartCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-executive-muted">
                  <span>Gross Margin</span>
                  <span>{cartTotal > 0 ? (((cartTotal - cartCost) / cartTotal) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex justify-between font-bold text-executive-dark">
                  <span>Total Revenue</span>
                  <span className="text-gold-700 font-serif text-lg">₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              className={`btn-gold w-full mt-4 justify-center ${cart.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={cart.length === 0}
              onClick={handleSubmit}
            >
              <Receipt size={16} />
              Record Sale & Deplete Stock
            </button>
          </div>
        </div>
      </div>

      {/* Today's Sales Log */}
      <div className="gold-card overflow-hidden">
        <div className="section-header px-5 pt-5 pb-0">
          <h2 className="font-serif font-semibold text-executive-dark">Today's Sales Log</h2>
          <span className="badge-gold">{todaySales.length} transactions</span>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="table-gold">
            <thead>
              <tr>
                <th>Time</th>
                <th>Menu Item</th>
                <th>Qty</th>
                <th>Revenue</th>
                <th>Staff</th>
              </tr>
            </thead>
            <tbody>
              {todaySales.map(sale => {
                const r = recipes.find(r => r.id === sale.recipeId)
                return (
                  <tr key={sale.id}>
                    <td className="flex items-center gap-1.5 text-executive-muted">
                      <Clock size={12} />
                      {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="font-medium text-executive-dark">{r?.name || 'Unknown'}</td>
                    <td>{sale.quantity}</td>
                    <td className="font-semibold text-gold-700">
                      ₹{r ? (r.sellingPrice * sale.quantity).toFixed(2) : '—'}
                    </td>
                    <td className="text-executive-muted">{sale.staff}</td>
                  </tr>
                )
              })}
              {todaySales.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-executive-muted">No sales recorded today.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
