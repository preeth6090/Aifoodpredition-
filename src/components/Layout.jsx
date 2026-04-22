import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ChefHat, Package, BarChart3, ShoppingCart,
  Receipt, Truck, ClipboardList, ScanLine, Settings, Bell,
  ChevronLeft, ChevronRight, TrendingUp, X, Sparkles, Upload,
  Palette, CreditCard, Check
} from 'lucide-react'
import { useInventory } from '../context/InventoryContext'
import { useTheme, THEMES } from '../context/ThemeContext'

const NAV_ITEMS = [
  { path: '/',                label: 'Dashboard',        icon: LayoutDashboard },
  { path: '/sales',           label: 'Record Sales',     icon: Receipt },
  { path: '/recipes',         label: 'Recipe Builder',   icon: ChefHat },
  { path: '/ingredients',     label: 'Ingredients',      icon: Package },
  { path: '/stock-count',     label: 'Stock Count',      icon: ClipboardList },
  { path: '/variance',        label: 'Variance Analysis',icon: BarChart3 },
  { path: '/purchase-orders', label: 'Purchase Orders',  icon: ShoppingCart },
  { path: '/payments',        label: 'Vendor Payments',  icon: CreditCard },
  { path: '/vendors',         label: 'Vendors',          icon: Truck },
  { path: '/invoice-scanner', label: 'Invoice Scanner',  icon: ScanLine },
  { path: '/admin',           label: 'Admin Fields',     icon: Settings },
  { path: '/ai-insights',     label: 'AI Insights',      icon: Sparkles },
  { path: '/bulk-upload',     label: 'Bulk Upload',      icon: Upload },
]

function ThemePicker({ onClose }) {
  const { themes, changeTheme, themeId } = useTheme()
  return (
    <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl border z-50 overflow-hidden"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
      <div className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--card-border)', background: 'var(--th-bg)' }}>
        <span className="font-serif font-semibold text-sm" style={{ color: 'var(--th-text)' }}>
          Choose Theme
        </span>
        <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
          <X size={14} style={{ color: 'var(--th-text)' }} />
        </button>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {themes.map(t => (
          <button
            key={t.id}
            onClick={() => { changeTheme(t.id); onClose() }}
            className="relative flex flex-col gap-2 p-3 rounded-xl border-2 transition-all hover:scale-[1.02] text-left"
            style={{
              borderColor: themeId === t.id ? t.primary : 'transparent',
              background: t.kpiBg,
              boxShadow: themeId === t.id ? `0 0 0 2px ${t.primary}33` : 'none',
            }}
          >
            <div className="flex gap-1.5">
              {t.preview.map((c, i) => (
                <div key={i} className="w-5 h-5 rounded-full shadow-sm" style={{ background: c }} />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-700">{t.name}</span>
            {themeId === t.id && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: t.primary }}>
                <Check size={10} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="px-4 pb-3">
        <p className="text-[10px] text-gray-400 text-center">Preference saved automatically</p>
      </div>
    </div>
  )
}

export default function Layout({ children }) {
  const { notifications, markNotificationRead } = useInventory()
  const { theme }         = useTheme()
  const navigate          = useNavigate()
  const location          = useLocation()
  const [collapsed,       setCollapsed]       = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)

  const unread      = notifications.filter(n => !n.read).length
  const currentPage = NAV_ITEMS.find(n => n.path === location.pathname)

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--page-bg)' }}>
      {/* Sidebar */}
      <aside
        className={`flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out`}
        style={{
          width: collapsed ? '64px' : '232px',
          background: theme.sidebar,
          borderRight: `1px solid ${theme.sidebarBorder}`,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 flex-shrink-0"
          style={{ borderBottom: `1px solid ${theme.sidebarBorder}` }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: theme.logoGradient }}>
            <TrendingUp size={15} className="text-white drop-shadow" />
          </div>
          {!collapsed && (
            <div>
              <div className="font-serif font-bold text-white text-sm leading-tight tracking-wide">GoldStock</div>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: theme.activeText, opacity: 0.7 }}>Pro Edition</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={collapsed ? label : undefined}
                className={`sidebar-link w-full text-left ${collapsed ? 'justify-center px-0' : ''}`}
                style={active ? {
                  background: theme.activeBg,
                  borderLeftColor: theme.activeBorder,
                  color: theme.activeText,
                } : {}}
              >
                <Icon size={17} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Collapse */}
        <div className="flex-shrink-0 p-2" style={{ borderTop: `1px solid ${theme.sidebarBorder}` }}>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="sidebar-link w-full justify-center"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-6 py-3 flex items-center justify-between flex-shrink-0"
          style={{
            background: theme.headerBg,
            borderBottom: `1px solid ${theme.headerBorder}`,
          }}>
          <div>
            <h1 className="font-serif text-xl font-semibold text-executive-dark tracking-wide">
              {currentPage?.label ?? 'GoldStock'}
            </h1>
            <p className="text-xs text-executive-muted mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Picker */}
            <div className="relative">
              <button
                onClick={() => { setShowThemePicker(v => !v); setShowNotifications(false) }}
                className="p-2 rounded-xl hover:bg-gray-100 text-executive-muted transition-colors"
                title="Change Theme"
              >
                <Palette size={18} />
              </button>
              {showThemePicker && <ThemePicker onClose={() => setShowThemePicker(false)} />}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(v => !v); setShowThemePicker(false) }}
                className="relative p-2 rounded-xl hover:bg-gray-100 text-executive-charcoal transition-colors"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-white text-[9px] rounded-full flex items-center justify-center font-bold"
                    style={{ background: '#ef4444' }}>
                    {unread}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl border z-50 overflow-hidden"
                  style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b"
                    style={{ borderColor: 'var(--card-border)', background: 'var(--th-bg)' }}>
                    <span className="font-serif font-semibold text-sm" style={{ color: 'var(--th-text)' }}>Notifications</span>
                    <button onClick={() => setShowNotifications(false)}>
                      <X size={14} style={{ color: 'var(--th-text)', opacity: 0.7 }} />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${n.read ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                            n.type === 'alert' ? 'bg-red-400' : n.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-executive-charcoal">{n.message}</p>
                            <p className="text-[10px] text-executive-muted mt-0.5">{n.time}</p>
                          </div>
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ background: theme.primary }} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: 'var(--card-border)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                style={{ background: theme.logoGradient }}>
                AM
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-executive-dark">Admin Manager</div>
                <div className="text-[10px] text-executive-muted">Restaurant Manager</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
