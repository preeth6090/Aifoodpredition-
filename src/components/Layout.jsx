import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ChefHat, Package, BarChart3, ShoppingCart,
  Receipt, Truck, ClipboardList, ScanLine, Settings, Bell,
  ChevronLeft, ChevronRight, TrendingUp, X, LogOut, Sparkles, Upload
} from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

const NAV_ITEMS = [
  { path: '/',                 label: 'Dashboard',         icon: LayoutDashboard },
  { path: '/sales',            label: 'Record Sales',      icon: Receipt },
  { path: '/recipes',          label: 'Recipe Builder',    icon: ChefHat },
  { path: '/ingredients',      label: 'Ingredients',       icon: Package },
  { path: '/stock-count',      label: 'Stock Count',       icon: ClipboardList },
  { path: '/variance',         label: 'Variance Analysis', icon: BarChart3 },
  { path: '/purchase-orders',  label: 'Purchase Orders',   icon: ShoppingCart },
  { path: '/vendors',          label: 'Vendors',           icon: Truck },
  { path: '/invoice-scanner',  label: 'Invoice Scanner',   icon: ScanLine },
  { path: '/admin',            label: 'Admin Fields',      icon: Settings },
  { path: '/ai-insights',      label: 'AI Insights',       icon: Sparkles },
  { path: '/bulk-upload',      label: 'Bulk Upload',       icon: Upload },
]

export default function Layout({ children }) {
  const { notifications, markNotificationRead } = useInventory()
  const navigate    = useNavigate()
  const location    = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const unread = notifications.filter(n => !n.read).length
  const currentPage = NAV_ITEMS.find(n => n.path === location.pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-executive-cream">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-executive-dark transition-all duration-300 ease-in-out flex-shrink-0 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={16} className="text-executive-dark" />
          </div>
          {!collapsed && (
            <div>
              <div className="font-serif font-bold text-white text-sm leading-tight">GoldStock</div>
              <div className="text-gold-400 text-[10px] uppercase tracking-widest">Pro Edition</div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={collapsed ? label : undefined}
                className={`sidebar-link w-full text-left ${active ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Collapse Button */}
        <div className="border-t border-white/10 p-2">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="sidebar-link w-full justify-center"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gold-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-serif text-lg font-semibold text-executive-dark">
              {currentPage?.label ?? 'GoldStock'}
            </h1>
            <p className="text-xs text-executive-muted">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(v => !v)}
                className="relative p-2 rounded-lg hover:bg-gold-50 text-executive-charcoal transition-colors"
              >
                <Bell size={20} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                    {unread}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-gold-lg border border-gold-200 z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gold-100">
                    <span className="font-serif font-semibold text-executive-dark text-sm">Notifications</span>
                    <button onClick={() => setShowNotifications(false)}>
                      <X size={16} className="text-executive-muted" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`px-4 py-3 cursor-pointer hover:bg-gold-50 transition-colors ${n.read ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                            n.type === 'alert' ? 'bg-red-400' :
                            n.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                          }`} />
                          <div>
                            <p className="text-xs text-executive-charcoal">{n.message}</p>
                            <p className="text-[10px] text-executive-muted mt-0.5">{n.time}</p>
                          </div>
                          {!n.read && <div className="ml-auto w-1.5 h-1.5 bg-gold-500 rounded-full flex-shrink-0 mt-1" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            <div className="flex items-center gap-2 pl-3 border-l border-gold-200">
              <div className="w-8 h-8 rounded-full bg-executive-navy flex items-center justify-center text-gold-400 font-semibold text-xs">
                AM
              </div>
              {!collapsed && (
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-executive-dark">Admin Manager</div>
                  <div className="text-[10px] text-executive-muted">Restaurant Manager</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
