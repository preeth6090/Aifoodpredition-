import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

// ── Vendor credentials mapped to their email in InventoryContext ──
const VENDOR_CREDS = {
  'orders@goldenbakery.com': { vendorId: 1, name: 'Golden Bakery Co.',  avatar: 'GB' },
  'supply@primemeats.com':   { vendorId: 2, name: 'Prime Meats Ltd.',   avatar: 'PM' },
  'orders@freshfarm.com':    { vendorId: 3, name: 'Fresh Farm Produce', avatar: 'FF' },
  'supply@dairydirect.com':  { vendorId: 4, name: 'Dairy Direct',       avatar: 'DD' },
  'orders@bevworld.com':     { vendorId: 5, name: 'Beverage World',     avatar: 'BW' },
  'orders@pantryplus.com':   { vendorId: 6, name: 'Pantry Plus',        avatar: 'PP' },
}
const VENDOR_PASSWORD = 'vendor@123'

// ── Staff accounts ────────────────────────────────────────────────
export const STAFF_USERS = [
  { id: 'admin',   email: 'admin@goldstock.com',   password: 'admin123',   name: 'Rajesh Kumar',    role: 'admin',   title: 'General Manager',    avatar: 'RK' },
  { id: 'store',   email: 'store@goldstock.com',   password: 'store123',   name: 'Priya Sharma',    role: 'store',   title: 'Store Manager',       avatar: 'PS' },
  { id: 'kitchen', email: 'kitchen@goldstock.com', password: 'kitchen123', name: 'Chef Arun Menon', role: 'kitchen', title: 'Head Chef',            avatar: 'CA' },
  { id: 'billing', email: 'billing@goldstock.com', password: 'billing123', name: 'Meena Iyer',      role: 'billing', title: 'Cashier / Billing',    avatar: 'MI' },
]

// ── Role display config ───────────────────────────────────────────
export const ROLE_CONFIG = {
  admin:   { label: 'Admin',           color: '#C9A84C', bg: '#FDF8EC', border: '#F4DEAA', home: '/',        description: 'Full system access'             },
  store:   { label: 'Store Manager',   color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', home: '/',        description: 'Inventory, POs & vendor ops'     },
  kitchen: { label: 'Kitchen Manager', color: '#059669', bg: '#f0fdf4', border: '#a7f3d0', home: '/kitchen', description: 'Kitchen display & recipe control' },
  billing: { label: 'Billing',         color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', home: '/tables',  description: 'Tables, orders & invoicing'      },
  vendor:  { label: 'Vendor Partner',  color: '#dc2626', bg: '#fff5f5', border: '#fecaca', home: '/vendor',  description: 'Your profile, POs & price list'  },
}

// ── Routes accessible per role (null = all) ───────────────────────
export const ROLE_PATHS = {
  admin:   null,
  store:   ['/', '/ingredients', '/stock-count', '/variance', '/purchase-orders', '/payments', '/vendors', '/bulk-upload', '/ai-insights', '/invoice-scanner'],
  kitchen: ['/kitchen', '/recipes', '/ingredients'],
  billing: ['/tables', '/sales', '/', '/payments'],
  vendor:  ['/vendor'],
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('gs_user')) } catch { return null }
  })

  const login = useCallback((email, password) => {
    const emailLower = email.toLowerCase().trim()

    // Staff login
    const staff = STAFF_USERS.find(u => u.email === emailLower && u.password === password)
    if (staff) {
      const u = { id: staff.id, name: staff.name, role: staff.role, title: staff.title, avatar: staff.avatar, email: staff.email }
      sessionStorage.setItem('gs_user', JSON.stringify(u))
      setUser(u)
      return { ok: true, role: staff.role }
    }

    // Vendor login
    const vendorInfo = VENDOR_CREDS[emailLower]
    if (vendorInfo && password === VENDOR_PASSWORD) {
      const u = { id: `vendor-${vendorInfo.vendorId}`, name: vendorInfo.name, role: 'vendor', title: 'Vendor Partner', avatar: vendorInfo.avatar, email: emailLower, vendorId: vendorInfo.vendorId }
      sessionStorage.setItem('gs_user', JSON.stringify(u))
      setUser(u)
      return { ok: true, role: 'vendor' }
    }

    return { ok: false, error: 'Invalid email or password' }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('gs_user')
    setUser(null)
  }, [])

  const canAccess = useCallback((path) => {
    if (!user) return false
    const allowed = ROLE_PATHS[user.role]
    if (allowed === null) return true            // admin sees all
    return allowed.some(p => path === p || path.startsWith(p + '/'))
  }, [user])

  return (
    <AuthContext.Provider value={{ user, login, logout, canAccess }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
