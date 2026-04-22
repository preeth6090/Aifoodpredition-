import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

const TableContext = createContext(null)

const now = Date.now()

export const INITIAL_TABLES = [
  { id: 'T01', number: 'T-01', seats: 4, section: 'Main Hall',    shape: 'rect' },
  { id: 'T02', number: 'T-02', seats: 2, section: 'Main Hall',    shape: 'round' },
  { id: 'T03', number: 'T-03', seats: 6, section: 'Main Hall',    shape: 'rect' },
  { id: 'T04', number: 'T-04', seats: 4, section: 'Main Hall',    shape: 'rect' },
  { id: 'T05', number: 'T-05', seats: 2, section: 'Outdoor',      shape: 'round' },
  { id: 'T06', number: 'T-06', seats: 8, section: 'Private Room', shape: 'rect' },
  { id: 'T07', number: 'T-07', seats: 4, section: 'Outdoor',      shape: 'rect' },
  { id: 'T08', number: 'T-08', seats: 2, section: 'Bar',          shape: 'round' },
  { id: 'T09', number: 'T-09', seats: 6, section: 'Main Hall',    shape: 'rect' },
  { id: 'T10', number: 'T-10', seats: 4, section: 'Main Hall',    shape: 'rect' },
]

const INITIAL_SESSIONS = [
  { id: 'S001', tableId: 'T01', startTime: new Date(now - 45 * 60000).toISOString(), covers: 3, status: 'active',         billRequested: false },
  { id: 'S002', tableId: 'T03', startTime: new Date(now - 22 * 60000).toISOString(), covers: 5, status: 'active',         billRequested: false },
  { id: 'S003', tableId: 'T05', startTime: new Date(now - 92 * 60000).toISOString(), covers: 2, status: 'bill-requested', billRequested: true  },
  { id: 'S004', tableId: 'T07', startTime: new Date(now - 12 * 60000).toISOString(), covers: 4, status: 'active',         billRequested: false },
]

const INITIAL_ORDERS = [
  {
    id: 'ORD-001', sessionId: 'S001', tableId: 'T01', round: 1,
    status: 'served',
    createdAt: new Date(now - 38 * 60000).toISOString(),
    items: [
      { recipeId: 2, name: 'Chicken Burger',        qty: 2, price: 349, status: 'served',   notes: '' },
      { recipeId: 3, name: 'Crispy Fries',           qty: 3, price: 129, status: 'served',   notes: '' },
      { recipeId: 5, name: 'Coca-Cola',              qty: 3, price: 99,  status: 'served',   notes: '' },
    ],
  },
  {
    id: 'ORD-002', sessionId: 'S002', tableId: 'T03', round: 1,
    status: 'preparing',
    createdAt: new Date(now - 14 * 60000).toISOString(),
    items: [
      { recipeId: 1, name: 'Veg Burger',             qty: 2, price: 199, status: 'preparing', notes: '' },
      { recipeId: 4, name: 'Grilled Chicken Burger', qty: 2, price: 299, status: 'preparing', notes: 'Extra sauce' },
      { recipeId: 5, name: 'Coca-Cola',              qty: 5, price: 99,  status: 'ready',     notes: '' },
    ],
  },
  {
    id: 'ORD-003', sessionId: 'S003', tableId: 'T05', round: 1,
    status: 'served',
    createdAt: new Date(now - 85 * 60000).toISOString(),
    items: [
      { recipeId: 3, name: 'Crispy Fries', qty: 2, price: 129, status: 'served', notes: '' },
      { recipeId: 5, name: 'Coca-Cola',    qty: 2, price: 99,  status: 'served', notes: '' },
    ],
  },
  {
    id: 'ORD-004', sessionId: 'S004', tableId: 'T07', round: 1,
    status: 'pending',
    createdAt: new Date(now - 8 * 60000).toISOString(),
    items: [
      { recipeId: 4, name: 'Grilled Chicken Burger', qty: 4, price: 299, status: 'pending', notes: '' },
      { recipeId: 3, name: 'Crispy Fries',           qty: 4, price: 129, status: 'pending', notes: '' },
    ],
  },
]

// Derive table status from sessions
function deriveTableStatus(tableId, sessions) {
  const session = sessions.find(s => s.tableId === tableId && s.status !== 'closed')
  if (!session) return 'available'
  return session.billRequested ? 'bill-requested' : 'occupied'
}

export function TableProvider({ children }) {
  const [tables,   setTables]   = useState(INITIAL_TABLES)
  const [sessions, setSessions] = useState(INITIAL_SESSIONS)
  const [orders,   setOrders]   = useState(INITIAL_ORDERS)

  // ── Session management ─────────────────────────────────────────
  const openTable = useCallback((tableId, covers) => {
    const sessionId = `S${Date.now()}`
    setSessions(prev => [...prev, {
      id: sessionId, tableId, covers,
      startTime: new Date().toISOString(),
      status: 'active', billRequested: false,
    }])
    return sessionId
  }, [])

  const closeTable = useCallback((tableId) => {
    setSessions(prev => prev.map(s =>
      s.tableId === tableId && s.status !== 'closed'
        ? { ...s, status: 'closed', endTime: new Date().toISOString() }
        : s
    ))
  }, [])

  const requestBill = useCallback((tableId) => {
    setSessions(prev => prev.map(s =>
      s.tableId === tableId && s.status === 'active'
        ? { ...s, billRequested: true, status: 'bill-requested' }
        : s
    ))
  }, [])

  // ── Order management ──────────────────────────────────────────
  const placeOrder = useCallback((tableId, items, notes = '') => {
    const session = sessions.find(s => s.tableId === tableId && s.status !== 'closed')
    if (!session) return null
    const round = orders.filter(o => o.tableId === tableId && o.sessionId === session.id).length + 1
    const newOrder = {
      id: `ORD-${Date.now()}`,
      sessionId: session.id,
      tableId, round, notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
      items: items.map(i => ({ ...i, status: 'pending' })),
    }
    setOrders(prev => [...prev, newOrder])
    return newOrder.id
  }, [sessions, orders])

  const updateItemStatus = useCallback((orderId, itemIdx, status) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o
      const items = o.items.map((it, i) => i === itemIdx ? { ...it, status } : it)
      const statuses = items.map(it => it.status)
      let orderStatus = o.status
      if (statuses.every(s => s === 'served'))    orderStatus = 'served'
      else if (statuses.every(s => s === 'ready' || s === 'served')) orderStatus = 'ready'
      else if (statuses.some(s => s === 'preparing')) orderStatus = 'preparing'
      else if (statuses.some(s => s === 'ready'))     orderStatus = 'partially-ready'
      return { ...o, items, status: orderStatus }
    }))
  }, [])

  const updateOrderStatus = useCallback((orderId, status) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o
      const items = status === 'preparing'
        ? o.items.map(it => it.status === 'pending' ? { ...it, status: 'preparing' } : it)
        : status === 'ready'
        ? o.items.map(it => it.status !== 'served' ? { ...it, status: 'ready' } : it)
        : status === 'served'
        ? o.items.map(it => ({ ...it, status: 'served' }))
        : o.items
      return { ...o, items, status }
    }))
  }, [])

  // ── Derived data ─────────────────────────────────────────────
  const getActiveSession = useCallback((tableId) => {
    return sessions.find(s => s.tableId === tableId && s.status !== 'closed') || null
  }, [sessions])

  const getTableOrders = useCallback((tableId) => {
    const session = sessions.find(s => s.tableId === tableId && s.status !== 'closed')
    if (!session) return []
    return orders.filter(o => o.sessionId === session.id)
  }, [sessions, orders])

  const getTableBill = useCallback((tableId) => {
    const tableOrders = getTableOrders(tableId)
    const lineItems = []
    tableOrders.forEach(ord => {
      ord.items.forEach(item => {
        if (item.status !== 'served' && item.status !== 'ready' && item.status !== 'preparing') return
        const existing = lineItems.find(l => l.recipeId === item.recipeId && l.price === item.price)
        if (existing) existing.qty += item.qty
        else lineItems.push({ ...item, qty: item.qty })
      })
    })
    const subtotal = lineItems.reduce((s, l) => s + l.qty * l.price, 0)
    const cgst     = parseFloat((subtotal * 0.025).toFixed(2))
    const sgst     = parseFloat((subtotal * 0.025).toFixed(2))
    const total    = parseFloat((subtotal + cgst + sgst).toFixed(2))
    return { lineItems, subtotal, cgst, sgst, total }
  }, [getTableOrders])

  const getTableStatus = useCallback((tableId) => {
    return deriveTableStatus(tableId, sessions)
  }, [sessions])

  const getMinutesSeated = useCallback((tableId) => {
    const session = sessions.find(s => s.tableId === tableId && s.status !== 'closed')
    if (!session) return 0
    return Math.floor((Date.now() - new Date(session.startTime).getTime()) / 60000)
  }, [sessions])

  const addTable = useCallback((data) => {
    setTables(prev => [...prev, { ...data, id: `T${Date.now()}` }])
  }, [])

  // Pending kitchen orders (all items not yet ready)
  const kitchenOrders = useMemo(() => {
    return orders.filter(o => ['pending','preparing','partially-ready'].includes(o.status))
  }, [orders])

  const value = {
    tables, sessions, orders, kitchenOrders,
    openTable, closeTable, requestBill,
    placeOrder, updateItemStatus, updateOrderStatus,
    getActiveSession, getTableOrders, getTableBill,
    getTableStatus, getMinutesSeated, addTable,
  }

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>
}

export function useTable() {
  const ctx = useContext(TableContext)
  if (!ctx) throw new Error('useTable must be used within TableProvider')
  return ctx
}
