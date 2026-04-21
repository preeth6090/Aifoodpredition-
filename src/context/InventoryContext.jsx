import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const InventoryContext = createContext(null)

const INITIAL_INGREDIENTS = [
  { id: 1, name: 'Burger Bun',      unit: 'pcs', currentStock: 150, parLevel: 50,  costPerUnit: 0.50, category: 'Bakery',     vendorId: 1, lastUpdated: '2026-04-19', sku: 'BKR-001' },
  { id: 2, name: 'Beef Patty',      unit: 'pcs', currentStock: 80,  parLevel: 40,  costPerUnit: 2.50, category: 'Meat',       vendorId: 2, lastUpdated: '2026-04-19', sku: 'MT-001' },
  { id: 3, name: 'Lettuce',         unit: 'kg',  currentStock: 5.2, parLevel: 3,   costPerUnit: 1.20, category: 'Produce',    vendorId: 3, lastUpdated: '2026-04-19', sku: 'PRD-001' },
  { id: 4, name: 'Tomato',          unit: 'kg',  currentStock: 8.0, parLevel: 4,   costPerUnit: 0.80, category: 'Produce',    vendorId: 3, lastUpdated: '2026-04-18', sku: 'PRD-002' },
  { id: 5, name: 'Cheese Slice',    unit: 'pcs', currentStock: 120, parLevel: 60,  costPerUnit: 0.30, category: 'Dairy',      vendorId: 4, lastUpdated: '2026-04-19', sku: 'DRY-001' },
  { id: 6, name: 'Coca-Cola 330ml', unit: 'cans',currentStock: 200, parLevel: 100, costPerUnit: 0.60, category: 'Beverages',  vendorId: 5, lastUpdated: '2026-04-19', sku: 'BVG-001' },
  { id: 7, name: 'Potato (Fries)',  unit: 'kg',  currentStock: 25,  parLevel: 15,  costPerUnit: 0.40, category: 'Produce',    vendorId: 3, lastUpdated: '2026-04-18', sku: 'PRD-003' },
  { id: 8, name: 'Olive Oil',       unit: 'L',   currentStock: 10,  parLevel: 5,   costPerUnit: 3.50, category: 'Pantry',     vendorId: 6, lastUpdated: '2026-04-17', sku: 'PNT-001' },
  { id: 9, name: 'Chicken Breast',  unit: 'kg',  currentStock: 12,  parLevel: 8,   costPerUnit: 4.20, category: 'Meat',       vendorId: 2, lastUpdated: '2026-04-19', sku: 'MT-002' },
  { id:10, name: 'French Mustard',  unit: 'L',   currentStock: 3.5, parLevel: 2,   costPerUnit: 2.80, category: 'Condiments', vendorId: 6, lastUpdated: '2026-04-16', sku: 'CND-001' },
]

const INITIAL_RECIPES = [
  {
    id: 1, name: 'Veg Burger', category: 'Burgers', sellingPrice: 12.99,
    ingredients: [
      { ingredientId: 1, quantity: 1 },
      { ingredientId: 3, quantity: 0.02 },
      { ingredientId: 4, quantity: 0.03 },
      { ingredientId: 5, quantity: 1 },
    ]
  },
  {
    id: 2, name: 'Classic Beef Burger', category: 'Burgers', sellingPrice: 16.99,
    ingredients: [
      { ingredientId: 1, quantity: 1 },
      { ingredientId: 2, quantity: 1 },
      { ingredientId: 3, quantity: 0.02 },
      { ingredientId: 4, quantity: 0.03 },
      { ingredientId: 5, quantity: 2 },
    ]
  },
  {
    id: 3, name: 'Crispy Fries', category: 'Sides', sellingPrice: 4.99,
    ingredients: [
      { ingredientId: 7, quantity: 0.2 },
      { ingredientId: 8, quantity: 0.05 },
    ]
  },
  {
    id: 4, name: 'Grilled Chicken Burger', category: 'Burgers', sellingPrice: 15.99,
    ingredients: [
      { ingredientId: 1, quantity: 1 },
      { ingredientId: 9, quantity: 0.18 },
      { ingredientId: 3, quantity: 0.025 },
      { ingredientId: 10, quantity: 0.02 },
    ]
  },
  {
    id: 5, name: 'Coca-Cola', category: 'Beverages', sellingPrice: 2.99,
    ingredients: [
      { ingredientId: 6, quantity: 1 },
    ]
  },
]

const INITIAL_VENDORS = [
  { id: 1, name: 'Golden Bakery Co.',   email: 'orders@goldenbakery.com',  phone: '+1-555-0101', address: '123 Baker St, NY',         category: 'Bakery',     leadTimeDays: 1 },
  { id: 2, name: 'Prime Meats Ltd.',    email: 'supply@primemeats.com',    phone: '+1-555-0202', address: '456 Packing District, NY', category: 'Meat',       leadTimeDays: 2 },
  { id: 3, name: 'Fresh Farm Produce',  email: 'orders@freshfarm.com',     phone: '+1-555-0303', address: '789 Farm Road, NJ',        category: 'Produce',    leadTimeDays: 1 },
  { id: 4, name: 'Dairy Direct',        email: 'supply@dairydirect.com',   phone: '+1-555-0404', address: '321 Dairy Lane, PA',       category: 'Dairy',      leadTimeDays: 2 },
  { id: 5, name: 'Beverage World',      email: 'orders@bevworld.com',      phone: '+1-555-0505', address: '654 Drink Ave, NY',        category: 'Beverages',  leadTimeDays: 3 },
  { id: 6, name: 'Pantry Plus',         email: 'orders@pantryplus.com',    phone: '+1-555-0606', address: '987 Kitchen St, CT',       category: 'Pantry',     leadTimeDays: 2 },
]

const INITIAL_SALES = [
  { id: 101, recipeId: 2, quantity: 25, timestamp: '2026-04-20T08:30:00', staff: 'Maria G.' },
  { id: 102, recipeId: 1, quantity: 18, timestamp: '2026-04-20T09:15:00', staff: 'Maria G.' },
  { id: 103, recipeId: 3, quantity: 42, timestamp: '2026-04-20T10:00:00', staff: 'James R.' },
  { id: 104, recipeId: 5, quantity: 35, timestamp: '2026-04-20T11:00:00', staff: 'James R.' },
  { id: 105, recipeId: 4, quantity: 12, timestamp: '2026-04-20T12:30:00', staff: 'Sarah L.' },
  { id: 106, recipeId: 2, quantity: 20, timestamp: '2026-04-19T13:00:00', staff: 'Maria G.' },
  { id: 107, recipeId: 3, quantity: 38, timestamp: '2026-04-19T14:00:00', staff: 'James R.' },
  { id: 108, recipeId: 1, quantity: 15, timestamp: '2026-04-19T12:00:00', staff: 'Sarah L.' },
]

const INITIAL_PURCHASE_ORDERS = [
  {
    id: 'PO-2026-001', vendorId: 3, status: 'pending',
    items: [
      { ingredientId: 3, quantity: 10, unitCost: 1.20 },
      { ingredientId: 4, quantity: 15, unitCost: 0.80 },
      { ingredientId: 7, quantity: 20, unitCost: 0.40 },
    ],
    notes: 'Auto-generated: Stock below par level', createdAt: '2026-04-20', approvedAt: null,
  },
  {
    id: 'PO-2026-002', vendorId: 2, status: 'approved',
    items: [
      { ingredientId: 2, quantity: 50, unitCost: 2.50 },
      { ingredientId: 9, quantity: 15, unitCost: 4.20 },
    ],
    notes: 'Weekly meat order', createdAt: '2026-04-19', approvedAt: '2026-04-19',
  },
]

const INITIAL_STOCK_COUNTS = [
  {
    id: 1, date: '2026-04-19', countedBy: 'John Smith', signature: null,
    items: [
      { ingredientId: 1, physicalCount: 150 },
      { ingredientId: 2, physicalCount: 78 },
      { ingredientId: 3, physicalCount: 5.0 },
      { ingredientId: 4, physicalCount: 7.8 },
      { ingredientId: 5, physicalCount: 118 },
    ]
  }
]

const INITIAL_CUSTOM_FIELDS = [
  { id: 1, tableName: 'ingredients', fieldName: 'sku',           label: 'SKU Code',       fieldType: 'text',   isMandatory: true,  isVisible: true },
  { id: 2, tableName: 'ingredients', fieldName: 'category',      label: 'Category',       fieldType: 'select', isMandatory: true,  isVisible: true },
  { id: 3, tableName: 'ingredients', fieldName: 'allergenInfo',  label: 'Allergen Info',  fieldType: 'text',   isMandatory: false, isVisible: true },
  { id: 4, tableName: 'ingredients', fieldName: 'storageTemp',   label: 'Storage Temp',   fieldType: 'text',   isMandatory: false, isVisible: false },
]

function calcRecipeCost(recipe, ingredients) {
  return recipe.ingredients.reduce((sum, ri) => {
    const ing = ingredients.find(i => i.id === ri.ingredientId)
    return sum + (ing ? ing.costPerUnit * ri.quantity : 0)
  }, 0)
}

function calcTheoreticalStock(ingredientId, ingredients, sales, recipes, stockCounts) {
  const ing = ingredients.find(i => i.id === ingredientId)
  if (!ing) return 0

  const lastCount = stockCounts
    .filter(sc => sc.items.some(it => it.ingredientId === ingredientId))
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]

  let baseStock = ing.currentStock
  let baseDate = null

  if (lastCount) {
    const countItem = lastCount.items.find(it => it.ingredientId === ingredientId)
    if (countItem) {
      baseStock = countItem.physicalCount
      baseDate = lastCount.date
    }
  }

  const relevantSales = baseDate
    ? sales.filter(s => new Date(s.timestamp) > new Date(baseDate))
    : sales

  const totalDepletion = relevantSales.reduce((sum, sale) => {
    const recipe = recipes.find(r => r.id === sale.recipeId)
    if (!recipe) return sum
    const ri = recipe.ingredients.find(r => r.ingredientId === ingredientId)
    return sum + (ri ? ri.quantity * sale.quantity : 0)
  }, 0)

  return parseFloat((baseStock - totalDepletion).toFixed(3))
}

export function InventoryProvider({ children }) {
  const [ingredients,    setIngredients]    = useState(INITIAL_INGREDIENTS)
  const [recipes,        setRecipes]        = useState(INITIAL_RECIPES)
  const [vendors,        setVendors]        = useState(INITIAL_VENDORS)
  const [sales,          setSales]          = useState(INITIAL_SALES)
  const [purchaseOrders, setPurchaseOrders] = useState(INITIAL_PURCHASE_ORDERS)
  const [stockCounts,    setStockCounts]    = useState(INITIAL_STOCK_COUNTS)
  const [customFields,   setCustomFields]   = useState(INITIAL_CUSTOM_FIELDS)
  const [notifications,  setNotifications]  = useState([
    { id: 1, type: 'warning', message: 'Tomato stock not updated in 26 hours',  time: '2h ago', read: false },
    { id: 2, type: 'alert',   message: 'Lettuce below par level — PO suggested', time: '3h ago', read: false },
    { id: 3, type: 'info',    message: 'PO-2026-002 approved and sent to Prime Meats Ltd.', time: '1d ago', read: true },
  ])

  const addNotification = useCallback((type, message) => {
    setNotifications(prev => [
      { id: Date.now(), type, message, time: 'just now', read: false },
      ...prev,
    ])
  }, [])

  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const recordSale = useCallback((recipeId, quantity, staff) => {
    const recipe = recipes.find(r => r.id === recipeId)
    if (!recipe) return

    setIngredients(prev => prev.map(ing => {
      const ri = recipe.ingredients.find(r => r.ingredientId === ing.id)
      if (!ri) return ing
      const newStock = parseFloat(Math.max(0, ing.currentStock - ri.quantity * quantity).toFixed(3))
      return { ...ing, currentStock: newStock }
    }))

    const newSale = { id: Date.now(), recipeId, quantity, timestamp: new Date().toISOString(), staff }
    setSales(prev => [newSale, ...prev])

    setIngredients(prev => {
      prev.forEach(ing => {
        const ri = recipe.ingredients.find(r => r.ingredientId === ing.id)
        if (!ri) return
        const newStock = Math.max(0, ing.currentStock - ri.quantity * quantity)
        if (newStock <= ing.parLevel) {
          setTimeout(() => addNotification('alert', `${ing.name} is at or below par level (${newStock.toFixed(2)} ${ing.unit})`), 0)
        }
      })
      return prev
    })
  }, [recipes, addNotification])

  const addIngredient = useCallback((data) => {
    const newIng = { ...data, id: Date.now(), lastUpdated: new Date().toISOString().split('T')[0] }
    setIngredients(prev => [...prev, newIng])
  }, [])

  const updateIngredient = useCallback((id, data) => {
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, ...data, lastUpdated: new Date().toISOString().split('T')[0] } : i))
  }, [])

  const deleteIngredient = useCallback((id) => {
    setIngredients(prev => prev.filter(i => i.id !== id))
  }, [])

  const addRecipe = useCallback((data) => {
    setRecipes(prev => [...prev, { ...data, id: Date.now() }])
  }, [])

  const updateRecipe = useCallback((id, data) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...data } : r))
  }, [])

  const deleteRecipe = useCallback((id) => {
    setRecipes(prev => prev.filter(r => r.id !== id))
  }, [])

  const addVendor = useCallback((data) => {
    setVendors(prev => [...prev, { ...data, id: Date.now() }])
  }, [])

  const updateVendor = useCallback((id, data) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...data } : v))
  }, [])

  const deleteVendor = useCallback((id) => {
    setVendors(prev => prev.filter(v => v.id !== id))
  }, [])

  const generatePurchaseOrder = useCallback((ingredientIds) => {
    const grouped = {}
    ingredientIds.forEach(ingId => {
      const ing = ingredients.find(i => i.id === ingId)
      if (!ing || !ing.vendorId) return
      if (!grouped[ing.vendorId]) grouped[ing.vendorId] = []
      const orderQty = ing.parLevel * 2 - ing.currentStock
      grouped[ing.vendorId].push({ ingredientId: ing.id, quantity: Math.ceil(orderQty), unitCost: ing.costPerUnit })
    })

    const newPOs = Object.entries(grouped).map(([vendorId, items]) => ({
      id: `PO-${Date.now()}-${vendorId}`,
      vendorId: parseInt(vendorId),
      status: 'draft',
      items,
      notes: 'Auto-generated from par level alert',
      createdAt: new Date().toISOString().split('T')[0],
      approvedAt: null,
    }))

    setPurchaseOrders(prev => [...newPOs, ...prev])
    addNotification('info', `Generated ${newPOs.length} Purchase Order(s)`)
    return newPOs
  }, [ingredients, addNotification])

  const approvePurchaseOrder = useCallback((poId) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id !== poId) return po
      const vendor = vendors.find(v => v.id === po.vendorId)
      addNotification('info', `PO ${poId} approved. Email sent to ${vendor?.email || 'vendor'}.`)
      return { ...po, status: 'approved', approvedAt: new Date().toISOString().split('T')[0] }
    }))
  }, [vendors, addNotification])

  const deletePurchaseOrder = useCallback((poId) => {
    setPurchaseOrders(prev => prev.filter(po => po.id !== poId))
  }, [])

  const receiveOrder = useCallback((poId) => {
    const po = purchaseOrders.find(p => p.id === poId)
    if (!po) return
    setIngredients(prev => prev.map(ing => {
      const item = po.items.find(i => i.ingredientId === ing.id)
      if (!item) return ing
      return { ...ing, currentStock: parseFloat((ing.currentStock + item.quantity).toFixed(3)), lastUpdated: new Date().toISOString().split('T')[0] }
    }))
    setPurchaseOrders(prev => prev.map(po => po.id === poId ? { ...po, status: 'received' } : po))
    addNotification('info', `Order ${poId} received. Stock updated.`)
  }, [purchaseOrders, addNotification])

  const submitStockCount = useCallback((countData) => {
    const newCount = { ...countData, id: Date.now(), date: new Date().toISOString().split('T')[0] }
    setStockCounts(prev => [newCount, ...prev])

    setIngredients(prev => prev.map(ing => {
      const item = countData.items.find(it => it.ingredientId === ing.id)
      if (!item) return ing
      return { ...ing, currentStock: item.physicalCount, lastUpdated: new Date().toISOString().split('T')[0] }
    }))

    addNotification('info', `Stock count submitted by ${countData.countedBy}`)
  }, [addNotification])

  const addCustomField = useCallback((data) => {
    setCustomFields(prev => [...prev, { ...data, id: Date.now() }])
  }, [])

  const updateCustomField = useCallback((id, data) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, ...data } : f))
  }, [])

  const deleteCustomField = useCallback((id) => {
    setCustomFields(prev => prev.filter(f => f.id !== id))
  }, [])

  const getVarianceData = useCallback(() => {
    return ingredients.map(ing => {
      const theoretical = calcTheoreticalStock(ing.id, ingredients, sales, recipes, stockCounts)
      const physical = ing.currentStock
      const variance = parseFloat((theoretical - physical).toFixed(3))
      const variancePct = theoretical > 0 ? parseFloat(((variance / theoretical) * 100).toFixed(1)) : 0
      const varianceCost = parseFloat((Math.abs(variance) * ing.costPerUnit).toFixed(2))
      return { ...ing, theoretical, physical, variance, variancePct, varianceCost }
    })
  }, [ingredients, sales, recipes, stockCounts])

  const getDashboardStats = useCallback(() => {
    const totalStockValue = ingredients.reduce((s, i) => s + i.currentStock * i.costPerUnit, 0)
    const itemsBelowPar   = ingredients.filter(i => i.currentStock <= i.parLevel).length
    const today           = new Date().toISOString().split('T')[0]
    const todaySales      = sales.filter(s => s.timestamp.startsWith(today))
    const todayRevenue    = todaySales.reduce((sum, s) => {
      const r = recipes.find(rec => rec.id === s.recipeId)
      return sum + (r ? r.sellingPrice * s.quantity : 0)
    }, 0)
    const todayCost = todaySales.reduce((sum, s) => {
      const r = recipes.find(rec => rec.id === s.recipeId)
      return sum + (r ? calcRecipeCost(r, ingredients) * s.quantity : 0)
    }, 0)
    const foodCostPct = todayRevenue > 0 ? ((todayCost / todayRevenue) * 100) : 0

    const varianceData    = getVarianceData()
    const totalVarianceCost = varianceData.reduce((s, v) => s + (v.variance > 0 ? v.varianceCost : 0), 0)

    const salesByRecipe = recipes.map(r => {
      const qty = sales.filter(s => s.recipeId === r.id && s.timestamp.startsWith(today))
                       .reduce((s, sale) => s + sale.quantity, 0)
      return { name: r.name.length > 12 ? r.name.slice(0, 12) + '…' : r.name, qty, revenue: qty * r.sellingPrice }
    }).filter(r => r.qty > 0)

    const pendingPOs = purchaseOrders.filter(p => p.status === 'pending' || p.status === 'draft').length

    return { totalStockValue, itemsBelowPar, todayRevenue, foodCostPct, totalVarianceCost, salesByRecipe, pendingPOs }
  }, [ingredients, sales, recipes, purchaseOrders, getVarianceData])

  const value = {
    ingredients, recipes, vendors, sales, purchaseOrders, stockCounts, customFields, notifications,
    recordSale, addIngredient, updateIngredient, deleteIngredient,
    addRecipe, updateRecipe, deleteRecipe,
    addVendor, updateVendor, deleteVendor,
    generatePurchaseOrder, approvePurchaseOrder, deletePurchaseOrder, receiveOrder,
    submitStockCount,
    addCustomField, updateCustomField, deleteCustomField,
    getVarianceData, getDashboardStats,
    markNotificationRead, addNotification,
    calcRecipeCost: (r) => calcRecipeCost(r, ingredients),
  }

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider')
  return ctx
}
