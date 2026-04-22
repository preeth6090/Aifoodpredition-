import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const InventoryContext = createContext(null)

const INITIAL_INGREDIENTS = [
  { id: 1, name: 'Burger Bun',      unit: 'pcs', currentStock: 150, parLevel: 50,  costPerUnit: 15,  category: 'Bakery',     vendorId: 1, lastUpdated: '2026-04-19', sku: 'BKR-001' },
  { id: 2, name: 'Chicken Patty',   unit: 'pcs', currentStock: 80,  parLevel: 40,  costPerUnit: 110, category: 'Meat',       vendorId: 2, lastUpdated: '2026-04-19', sku: 'MT-001' },
  { id: 3, name: 'Lettuce',         unit: 'kg',  currentStock: 5.2, parLevel: 3,   costPerUnit: 60,  category: 'Produce',    vendorId: 3, lastUpdated: '2026-04-19', sku: 'PRD-001' },
  { id: 4, name: 'Tomato',          unit: 'kg',  currentStock: 8.0, parLevel: 4,   costPerUnit: 40,  category: 'Produce',    vendorId: 3, lastUpdated: '2026-04-18', sku: 'PRD-002' },
  { id: 5, name: 'Cheese Slice',    unit: 'pcs', currentStock: 120, parLevel: 60,  costPerUnit: 20,  category: 'Dairy',      vendorId: 4, lastUpdated: '2026-04-19', sku: 'DRY-001' },
  { id: 6, name: 'Coca-Cola 330ml', unit: 'cans',currentStock: 200, parLevel: 100, costPerUnit: 45,  category: 'Beverages',  vendorId: 5, lastUpdated: '2026-04-19', sku: 'BVG-001' },
  { id: 7, name: 'Potato (Fries)',  unit: 'kg',  currentStock: 25,  parLevel: 15,  costPerUnit: 30,  category: 'Produce',    vendorId: 3, lastUpdated: '2026-04-18', sku: 'PRD-003' },
  { id: 8, name: 'Cooking Oil',     unit: 'L',   currentStock: 10,  parLevel: 5,   costPerUnit: 180, category: 'Pantry',     vendorId: 6, lastUpdated: '2026-04-17', sku: 'PNT-001' },
  { id: 9, name: 'Chicken Breast',  unit: 'kg',  currentStock: 12,  parLevel: 8,   costPerUnit: 320, category: 'Meat',       vendorId: 2, lastUpdated: '2026-04-19', sku: 'MT-002' },
  { id:10, name: 'Green Chutney',   unit: 'L',   currentStock: 3.5, parLevel: 2,   costPerUnit: 120, category: 'Condiments', vendorId: 6, lastUpdated: '2026-04-16', sku: 'CND-001' },
]

const INITIAL_RECIPES = [
  {
    id: 1, name: 'Veg Burger', category: 'Burgers', sellingPrice: 199,
    ingredients: [
      { ingredientId: 1, quantity: 1 },
      { ingredientId: 3, quantity: 0.02 },
      { ingredientId: 4, quantity: 0.03 },
      { ingredientId: 5, quantity: 1 },
    ]
  },
  {
    id: 2, name: 'Chicken Burger', category: 'Burgers', sellingPrice: 349,
    ingredients: [
      { ingredientId: 1, quantity: 1 },
      { ingredientId: 2, quantity: 1 },
      { ingredientId: 3, quantity: 0.02 },
      { ingredientId: 4, quantity: 0.03 },
      { ingredientId: 5, quantity: 2 },
    ]
  },
  {
    id: 3, name: 'Crispy Fries', category: 'Sides', sellingPrice: 129,
    ingredients: [
      { ingredientId: 7, quantity: 0.2 },
      { ingredientId: 8, quantity: 0.05 },
    ]
  },
  {
    id: 4, name: 'Grilled Chicken Burger', category: 'Burgers', sellingPrice: 299,
    ingredients: [
      { ingredientId: 1, quantity: 1 },
      { ingredientId: 9, quantity: 0.18 },
      { ingredientId: 3, quantity: 0.025 },
      { ingredientId: 10, quantity: 0.02 },
    ]
  },
  {
    id: 5, name: 'Coca-Cola', category: 'Beverages', sellingPrice: 99,
    ingredients: [
      { ingredientId: 6, quantity: 1 },
    ]
  },
]

const INITIAL_VENDORS = [
  {
    id: 1, name: 'Golden Bakery Co.', contactPerson: 'Suresh Kumar', phone: '9845012345',
    email: 'orders@goldenbakery.com', address: '14 Commercial Street, Bangalore 560001',
    category: 'Bakery', leadTimeDays: 1,
    gstNumber: '29AABCG1234A1Z5', panNumber: 'AABCG1234A', fssaiNumber: '10019011001234',
    bankName: 'HDFC Bank', accountNumber: '50100123456789', ifscCode: 'HDFC0001234', accountType: 'Current',
    paymentTerms: 'Net 15', creditLimit: 50000, minOrderValue: 1000,
    deliveryCharge: 0, freeDeliveryAbove: 1500, deliveryDays: '1-2 business days',
    deliverySlot: 'Morning (6–10 AM)', returnPolicy: 'Replace within 24hrs if stale',
    notes: 'Daily fresh delivery. WhatsApp order accepted.',
  },
  {
    id: 2, name: 'Prime Meats Ltd.', contactPerson: 'Ravi Shankar', phone: '9900123456',
    email: 'supply@primemeats.com', address: '8 KR Market, Bangalore 560002',
    category: 'Meat', leadTimeDays: 2,
    gstNumber: '29AABCP5678B1Z3', panNumber: 'AABCP5678B', fssaiNumber: '10019011005678',
    bankName: 'SBI', accountNumber: '30012345678901', ifscCode: 'SBIN0012345', accountType: 'Current',
    paymentTerms: 'Net 7', creditLimit: 100000, minOrderValue: 2000,
    deliveryCharge: 150, freeDeliveryAbove: 5000, deliveryDays: '2 business days',
    deliverySlot: 'Morning (5–9 AM)', returnPolicy: 'No return — quality checked on delivery',
    notes: 'FSSAI certified cold chain. Halal certified.',
  },
  {
    id: 3, name: 'Fresh Farm Produce', contactPerson: 'Anitha Reddy', phone: '9743012345',
    email: 'orders@freshfarm.com', address: '22 APMC Yard, Yeshwanthpur, Bangalore 560022',
    category: 'Produce', leadTimeDays: 1,
    gstNumber: '29AABCF9012C1Z1', panNumber: 'AABCF9012C', fssaiNumber: '10019011009012',
    bankName: 'Canara Bank', accountNumber: '1234567890123', ifscCode: 'CNRB0001234', accountType: 'Current',
    paymentTerms: 'COD', creditLimit: 25000, minOrderValue: 500,
    deliveryCharge: 50, freeDeliveryAbove: 2000, deliveryDays: 'Same day if ordered before 8 AM',
    deliverySlot: 'Early Morning (4–8 AM)', returnPolicy: 'Credit note issued for rejected items',
    notes: 'Organic certified. Direct farm sourcing.',
  },
  {
    id: 4, name: 'Dairy Direct', contactPerson: 'Mohan Pillai', phone: '9845098765',
    email: 'supply@dairydirect.com', address: '5 Milk Colony, Hebbal, Bangalore 560024',
    category: 'Dairy', leadTimeDays: 1,
    gstNumber: '29AABCD3456D1Z9', panNumber: 'AABCD3456D', fssaiNumber: '10019011003456',
    bankName: 'ICICI Bank', accountNumber: '123456789012', ifscCode: 'ICIC0001234', accountType: 'Current',
    paymentTerms: 'Net 30', creditLimit: 75000, minOrderValue: 1000,
    deliveryCharge: 0, freeDeliveryAbove: 0, deliveryDays: 'Daily',
    deliverySlot: 'Early Morning (4–7 AM)', returnPolicy: 'Expiry replacements honoured',
    notes: 'Pasteurised and chilled supply. Temperature monitored.',
  },
  {
    id: 5, name: 'Beverage World', contactPerson: 'Kiran Shetty', phone: '9980123456',
    email: 'orders@bevworld.com', address: '33 Industrial Layout, Peenya, Bangalore 560058',
    category: 'Beverages', leadTimeDays: 3,
    gstNumber: '29AABCB7890E1Z7', panNumber: 'AABCB7890E', fssaiNumber: '10019011007890',
    bankName: 'Axis Bank', accountNumber: '9876543210123', ifscCode: 'UTIB0001234', accountType: 'Current',
    paymentTerms: 'Net 30', creditLimit: 150000, minOrderValue: 5000,
    deliveryCharge: 200, freeDeliveryAbove: 10000, deliveryDays: '3-5 business days',
    deliverySlot: 'Business Hours (10 AM–5 PM)', returnPolicy: 'No return on opened stock',
    notes: 'Bulk discounts available above ₹20,000.',
  },
  {
    id: 6, name: 'Pantry Plus', contactPerson: 'Deepa Nair', phone: '9632012345',
    email: 'orders@pantryplus.com', address: '18 Gandhi Nagar, Bangalore 560009',
    category: 'Pantry', leadTimeDays: 2,
    gstNumber: '29AABCP2345F1Z5', panNumber: 'AABCP2345F', fssaiNumber: '10019011002345',
    bankName: 'Kotak Mahindra Bank', accountNumber: '2345678901234', ifscCode: 'KKBK0001234', accountType: 'Current',
    paymentTerms: 'Net 15', creditLimit: 60000, minOrderValue: 2000,
    deliveryCharge: 100, freeDeliveryAbove: 4000, deliveryDays: '2 business days',
    deliverySlot: 'Daytime (9 AM–3 PM)', returnPolicy: 'Sealed stock returned within 7 days',
    notes: 'Weekly consolidated order recommended.',
  },
]

const INITIAL_VENDOR_PRICES = [
  { id: 1, vendorId: 3, ingredientId: 3, pricePerUnit: 58,  deliveryCharge: 50,  freeDeliveryAbove: 2000, minOrderQty: 2,  leadTimeDays: 1, validUntil: '2026-05-31', notes: 'Farm direct', updatedAt: '2026-04-20T08:00:00' },
  { id: 2, vendorId: 3, ingredientId: 4, pricePerUnit: 38,  deliveryCharge: 50,  freeDeliveryAbove: 2000, minOrderQty: 5,  leadTimeDays: 1, validUntil: '2026-05-31', notes: '', updatedAt: '2026-04-20T08:00:00' },
  { id: 3, vendorId: 3, ingredientId: 7, pricePerUnit: 28,  deliveryCharge: 50,  freeDeliveryAbove: 2000, minOrderQty: 10, leadTimeDays: 1, validUntil: '2026-05-31', notes: '', updatedAt: '2026-04-20T08:00:00' },
  { id: 4, vendorId: 2, ingredientId: 2, pricePerUnit: 108, deliveryCharge: 150, freeDeliveryAbove: 5000, minOrderQty: 10, leadTimeDays: 2, validUntil: '2026-05-31', notes: 'Halal certified', updatedAt: '2026-04-20T09:00:00' },
  { id: 5, vendorId: 2, ingredientId: 9, pricePerUnit: 315, deliveryCharge: 150, freeDeliveryAbove: 5000, minOrderQty: 5,  leadTimeDays: 2, validUntil: '2026-05-31', notes: '', updatedAt: '2026-04-20T09:00:00' },
  { id: 6, vendorId: 4, ingredientId: 5, pricePerUnit: 19,  deliveryCharge: 0,   freeDeliveryAbove: 0,    minOrderQty: 50, leadTimeDays: 1, validUntil: '2026-05-31', notes: 'Daily fresh', updatedAt: '2026-04-20T07:00:00' },
  { id: 7, vendorId: 1, ingredientId: 1, pricePerUnit: 14,  deliveryCharge: 0,   freeDeliveryAbove: 1500, minOrderQty: 50, leadTimeDays: 1, validUntil: '2026-05-31', notes: '', updatedAt: '2026-04-20T06:00:00' },
  { id: 8, vendorId: 6, ingredientId: 8, pricePerUnit: 175, deliveryCharge: 100, freeDeliveryAbove: 4000, minOrderQty: 5,  leadTimeDays: 2, validUntil: '2026-05-31', notes: 'Sunflower refined', updatedAt: '2026-04-20T10:00:00' },
  { id: 9, vendorId: 5, ingredientId: 6, pricePerUnit: 28,  deliveryCharge: 200, freeDeliveryAbove: 10000,minOrderQty: 24, leadTimeDays: 3, validUntil: '2026-05-31', notes: 'Case of 24', updatedAt: '2026-04-20T11:00:00' },
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
      { ingredientId: 3, quantity: 10, unitCost: 60 },
      { ingredientId: 4, quantity: 15, unitCost: 40 },
      { ingredientId: 7, quantity: 20, unitCost: 30 },
    ],
    notes: 'Auto-generated: Stock below par level', createdAt: '2026-04-20', approvedAt: null,
  },
  {
    id: 'PO-2026-002', vendorId: 2, status: 'approved',
    items: [
      { ingredientId: 2, quantity: 50, unitCost: 110 },
      { ingredientId: 9, quantity: 15, unitCost: 320 },
    ],
    notes: 'Weekly poultry order', createdAt: '2026-04-19', approvedAt: '2026-04-19',
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
  const [vendorPrices,   setVendorPrices]   = useState(INITIAL_VENDOR_PRICES)
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

  // ── Vendor Price List ──────────────────────────────────────────
  const upsertVendorPrice = useCallback((data) => {
    setVendorPrices(prev => {
      const existing = prev.find(p => p.vendorId === data.vendorId && p.ingredientId === data.ingredientId)
      const entry = { ...data, updatedAt: new Date().toISOString() }
      if (existing) return prev.map(p => (p.vendorId === data.vendorId && p.ingredientId === data.ingredientId) ? { ...p, ...entry } : p)
      return [...prev, { ...entry, id: Date.now() }]
    })
  }, [])

  const deleteVendorPrice = useCallback((vendorId, ingredientId) => {
    setVendorPrices(prev => prev.filter(p => !(p.vendorId === vendorId && p.ingredientId === ingredientId)))
  }, [])

  const getCheapestVendor = useCallback((ingredientId, qty = 1) => {
    const prices = vendorPrices.filter(p => p.ingredientId === ingredientId)
    if (!prices.length) return null
    return prices
      .map(p => {
        const vendor   = vendors.find(v => v.id === p.vendorId)
        const lineTotal = qty * p.pricePerUnit
        const delivery = (p.freeDeliveryAbove > 0 && lineTotal >= p.freeDeliveryAbove) ? 0 : p.deliveryCharge
        const totalCost = lineTotal + delivery
        return { ...p, vendor, lineTotal, deliveryCost: delivery, totalCost, unitEffective: parseFloat((totalCost / qty).toFixed(3)) }
      })
      .sort((a, b) => a.totalCost - b.totalCost)
  }, [vendorPrices, vendors])

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
    ingredients, recipes, vendors, sales, purchaseOrders, stockCounts, customFields, notifications, vendorPrices,
    recordSale, addIngredient, updateIngredient, deleteIngredient,
    addRecipe, updateRecipe, deleteRecipe,
    addVendor, updateVendor, deleteVendor,
    generatePurchaseOrder, approvePurchaseOrder, deletePurchaseOrder, receiveOrder,
    submitStockCount,
    upsertVendorPrice, deleteVendorPrice, getCheapestVendor,
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
