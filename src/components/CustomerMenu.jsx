import React, { useState, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ShoppingBag, Plus, Minus, X, CheckCircle, ChevronDown, Leaf, Flame, Clock, Bell } from 'lucide-react'
import { useInventory } from '../context/InventoryContext'
import { useTable } from '../context/TableContext'

const CATEGORY_ICONS = {
  'Burgers': '🍔', 'Sides': '🍟', 'Beverages': '🥤',
  'Starters': '🍱', 'Mains': '🍛', 'Desserts': '🍮',
  'Breads': '🫓', 'Rice': '🍚', 'Soups': '🍜',
  'Dosa': '🥙', 'South Indian': '🍽', 'North Indian': '🫕',
  'Indo-Chinese': '🥡', 'Karnataka': '🌿', 'All': '✦',
}

const VEG_CATEGORIES = ['Produce','Bakery','Dairy','Beverages','Pantry','Condiments']

function isVeg(recipe, ingredients) {
  return recipe.ingredients.every(ri => {
    const ing = ingredients.find(i => i.id === ri.ingredientId)
    return ing ? VEG_CATEGORIES.includes(ing.category) : true
  })
}

function CartItem({ item, onInc, onDec }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/10">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{item.name}</p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>₹{(item.price * item.qty).toFixed(0)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onDec} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <Minus size={12} className="text-white" />
        </button>
        <span className="w-5 text-center text-sm font-bold text-white">{item.qty}</span>
        <button onClick={onInc} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <Plus size={12} className="text-white" />
        </button>
      </div>
    </div>
  )
}

function OrderTrackerView({ tableOrders, onClose }) {
  const statusColor = (s) => ({
    pending: '#f59e0b', preparing: '#3b82f6',
    ready: '#10b981', served: '#6b7280',
  }[s] || '#6b7280')

  const statusLabel = (s) => ({
    pending: 'Waiting for kitchen', preparing: 'Being prepared 👨‍🍳',
    ready: 'Ready to serve! 🔔', served: 'Served ✓',
  }[s] || s)

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(160deg, #0F1629 0%, #1A2540 100%)' }}>
      <div className="flex items-center justify-between px-5 pt-10 pb-4 border-b border-white/10">
        <h2 className="font-serif text-2xl font-bold text-white">Your Orders</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <X size={16} className="text-white" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {tableOrders.length === 0 && (
          <div className="text-center py-16 text-white/40">
            <Clock size={40} className="mx-auto mb-3" />
            <p>No orders placed yet.</p>
          </div>
        )}
        {tableOrders.map(order => (
          <div key={order.id} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Round {order.round}</span>
              <span className="text-xs font-semibold" style={{ color: statusColor(order.status) }}>
                {statusLabel(order.status)}
              </span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="px-4 py-3 flex items-center justify-between border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm text-white font-medium">{item.name}</p>
                  <p className="text-xs text-white/40">×{item.qty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: statusColor(item.status) }}>
                    {statusLabel(item.status)}
                  </span>
                  <span className="text-sm font-semibold text-white">₹{(item.price * item.qty).toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CustomerMenu() {
  const { tableId } = useParams()
  const { recipes, ingredients } = useInventory()
  const { tables, placeOrder, getTableOrders, requestBill, openTable, getActiveSession } = useTable()

  const table = tables.find(t => t.id === tableId || t.number === tableId)

  const [cart,         setCart]         = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [showCart,     setShowCart]     = useState(false)
  const [showTracker,  setShowTracker]  = useState(false)
  const [orderPlaced,  setOrderPlaced]  = useState(false)
  const [covers,       setCovers]       = useState(null) // null = ask on first visit
  const [searchQ,      setSearchQ]      = useState('')

  // Auto-open session if table has no active session
  useEffect(() => {
    if (table && !getActiveSession(tableId) && covers) {
      openTable(tableId, covers)
    }
  }, [covers, tableId])

  const visibleRecipes = useMemo(() =>
    recipes.filter(r => r.isVisible !== false && r.isAvailable !== false),
  [recipes])

  const categories = useMemo(() =>
    ['All', ...new Set(visibleRecipes.map(r => r.category))],
  [visibleRecipes])

  const filtered = useMemo(() => {
    let list = activeCategory === 'All' ? visibleRecipes : visibleRecipes.filter(r => r.category === activeCategory)
    if (searchQ) list = list.filter(r => r.name.toLowerCase().includes(searchQ.toLowerCase()))
    return list
  }, [visibleRecipes, activeCategory, searchQ])

  const cartTotal   = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount   = cart.reduce((s, i) => s + i.qty, 0)
  const tableOrders = getTableOrders(tableId)

  const addToCart = (recipe) => {
    setCart(prev => {
      const ex = prev.find(i => i.recipeId === recipe.id)
      if (ex) return prev.map(i => i.recipeId === recipe.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { recipeId: recipe.id, name: recipe.name, price: recipe.sellingPrice, qty: 1 }]
    })
  }

  const updateCart = (recipeId, delta) => {
    setCart(prev => {
      const updated = prev.map(i => i.recipeId === recipeId ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
      return updated.filter(i => i.qty > 0)
    })
  }

  const handleOrder = () => {
    if (!getActiveSession(tableId)) {
      openTable(tableId, covers || 1)
    }
    placeOrder(tableId, cart)
    setCart([])
    setShowCart(false)
    setOrderPlaced(true)
    setTimeout(() => { setOrderPlaced(false); setShowTracker(true) }, 2200)
  }

  // Ask for covers count on first open
  if (covers === null && !getActiveSession(tableId)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'linear-gradient(160deg, #0F1629 0%, #1A2540 100%)' }}>
        <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D060)' }}>
          <span className="text-3xl">🍽</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-white mb-1">Welcome!</h1>
        <p className="text-white/50 text-sm mb-2">
          {table ? `Table ${table.number}` : `Table ${tableId}`}
        </p>
        <p className="text-white/40 text-xs mb-8">How many guests are dining today?</p>
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[1,2,3,4,5,6,7,8].map(n => (
            <button key={n}
              onClick={() => setCovers(n)}
              className="w-14 h-14 rounded-2xl text-lg font-bold text-white transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              {n}
            </button>
          ))}
        </div>
        <p className="text-white/30 text-xs">GoldStock Restaurant</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f7f4' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-10 pb-4" style={{ background: 'linear-gradient(160deg, #0F1629 0%, #1A2540 100%)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">
              {table ? `Table ${table.number}` : `Table ${tableId}`} · {covers} guest{covers > 1 ? 's' : ''}
            </p>
            <h1 className="font-serif text-2xl font-bold text-white leading-tight">Our Menu</h1>
          </div>
          <div className="flex gap-2">
            {tableOrders.length > 0 && (
              <button onClick={() => setShowTracker(true)}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                <Clock size={14} />
                My Orders
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-[9px] flex items-center justify-center font-bold">
                  {tableOrders.length}
                </span>
              </button>
            )}
            <button
              onClick={() => requestBill(tableId)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300"
              style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <Bell size={14} /> Bill
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/30 mb-3"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
          placeholder="Search dishes…"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
        />

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {categories.map(cat => (
            <button key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'text-white'
                  : 'text-white/50'
              }`}
              style={activeCategory === cat
                ? { background: 'linear-gradient(135deg, #C9A84C, #A8882E)' }
                : { background: 'rgba(255,255,255,0.08)' }
              }>
              <span>{CATEGORY_ICONS[cat] || '🍽'}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Order placed toast */}
      {orderPlaced && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3 px-8 py-6 rounded-2xl shadow-2xl"
          style={{ background: '#0F1629', border: '1px solid rgba(201,168,76,0.3)' }}>
          <CheckCircle size={40} className="text-green-400" />
          <p className="font-serif text-xl font-bold text-white">Order Placed!</p>
          <p className="text-white/50 text-xs text-center">Your order has been sent to the kitchen.</p>
        </div>
      )}

      {/* Menu Grid */}
      <div className="flex-1 px-4 py-4 space-y-6 pb-36">
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <p className="font-serif text-xl mb-2">Nothing found</p>
            <p className="text-sm">Try a different category</p>
          </div>
        )}

        {/* Group by category when showing All */}
        {activeCategory === 'All' ? (
          categories.filter(c => c !== 'All').map(cat => {
            const items = filtered.filter(r => r.category === cat)
            if (!items.length) return null
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{CATEGORY_ICONS[cat] || '🍽'}</span>
                  <h2 className="font-serif text-xl font-semibold text-gray-800">{cat}</h2>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="space-y-3">
                  {items.map(recipe => <MenuItemCard key={recipe.id} recipe={recipe} ingredients={ingredients} cart={cart} onAdd={addToCart} onUpdate={updateCart} />)}
                </div>
              </div>
            )
          })
        ) : (
          <div className="space-y-3">
            {filtered.map(recipe => <MenuItemCard key={recipe.id} recipe={recipe} ingredients={ingredients} cart={cart} onAdd={addToCart} onUpdate={updateCart} />)}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && !showCart && (
        <div className="fixed bottom-6 left-4 right-4 z-40">
          <button onClick={() => setShowCart(true)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #A8882E)' }}>
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold text-white">
                {cartCount}
              </span>
              <span className="font-semibold text-white">View Cart</span>
            </div>
            <span className="font-serif font-bold text-white text-lg">₹{cartTotal.toFixed(0)}</span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="relative rounded-t-3xl overflow-hidden flex flex-col max-h-[85vh]"
            style={{ background: 'linear-gradient(160deg, #0F1629 0%, #1A2540 100%)' }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10">
              <div>
                <h3 className="font-serif text-xl font-bold text-white">Your Order</h3>
                <p className="text-xs text-white/40">{cartCount} item{cartCount > 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => setShowCart(false)} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <X size={16} className="text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3">
              {cart.map(item => (
                <CartItem key={item.recipeId} item={item}
                  onInc={() => updateCart(item.recipeId, 1)}
                  onDec={() => updateCart(item.recipeId, -1)} />
              ))}
            </div>

            <div className="px-5 py-5 border-t border-white/10">
              <div className="flex justify-between text-sm text-white/60 mb-1">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-xs text-white/40 mb-4">
                <span>GST (5%) will be added at billing</span>
              </div>
              <div className="flex justify-between font-serif text-xl font-bold text-white mb-5">
                <span>Total</span>
                <span style={{ color: '#C9A84C' }}>₹{cartTotal.toFixed(0)}</span>
              </div>
              <button onClick={handleOrder}
                className="w-full py-4 rounded-2xl font-semibold text-white text-base shadow-xl"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #A8882E)' }}>
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Tracker */}
      {showTracker && (
        <OrderTrackerView tableOrders={tableOrders} onClose={() => setShowTracker(false)} />
      )}
    </div>
  )
}

function MenuItemCard({ recipe, ingredients, cart, onAdd, onUpdate }) {
  const cartItem = cart.find(i => i.recipeId === recipe.id)
  const veg      = isVeg(recipe, ingredients)

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #f0ede6' }}>
      <div className="flex items-start gap-3">
        {/* Veg/Non-veg indicator */}
        <div className={`mt-0.5 w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${veg ? 'border-green-600' : 'border-red-600'}`}>
          <div className={`w-2 h-2 rounded-full ${veg ? 'bg-green-600' : 'bg-red-600'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 leading-tight">{recipe.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {recipe.ingredients.slice(0,3).map(ri => {
              const ing = ingredients.find(i => i.id === ri.ingredientId)
              return ing?.name
            }).filter(Boolean).join(', ')}
          </p>
          <p className="font-serif font-bold text-lg mt-2" style={{ color: '#C9A84C' }}>₹{recipe.sellingPrice}</p>
        </div>

        {/* Quantity control */}
        {cartItem ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => onUpdate(recipe.id, -1)}
              className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors"
              style={{ borderColor: '#C9A84C', color: '#C9A84C' }}>
              <Minus size={14} />
            </button>
            <span className="w-6 text-center font-bold text-gray-800">{cartItem.qty}</span>
            <button onClick={() => onUpdate(recipe.id, 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #A8882E)' }}>
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button onClick={() => onAdd(recipe)}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #A8882E)' }}>
            <Plus size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
