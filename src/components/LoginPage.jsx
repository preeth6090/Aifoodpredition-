import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, TrendingUp, LogIn, ChevronRight } from 'lucide-react'
import { useAuth, STAFF_USERS, ROLE_CONFIG } from '../context/AuthContext'

const QUICK_LOGINS = [
  { ...STAFF_USERS[0], emoji: '👑' },
  { ...STAFF_USERS[1], emoji: '📦' },
  { ...STAFF_USERS[2], emoji: '👨‍🍳' },
  { ...STAFF_USERS[3], emoji: '🧾' },
  { email: 'orders@goldenbakery.com', password: 'vendor@123', name: 'Golden Bakery Co.', role: 'vendor', title: 'Vendor Partner', emoji: '🚚' },
]

export default function LoginPage() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [activeQuick, setActiveQuick] = useState(null)

  const handleLogin = async (em = email, pw = password) => {
    if (!em || !pw) { setError('Enter email and password'); return }
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 400))
    const result = login(em, pw)
    setLoading(false)
    if (result.ok) {
      navigate(ROLE_CONFIG[result.role]?.home || '/', { replace: true })
    } else {
      setError(result.error)
    }
  }

  const quickLogin = (u) => {
    setActiveQuick(u.email)
    setEmail(u.email)
    setPassword(u.password)
    handleLogin(u.email, u.password)
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0F1629 0%, #1A2540 60%, #0a1020 100%)' }}>
      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12 border-r border-white/10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D060)' }}>
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <div className="font-serif font-bold text-white text-lg leading-tight">GoldStock</div>
            <div className="text-gold-400 text-[10px] uppercase tracking-widest" style={{ color: '#C9A84C' }}>Pro Edition</div>
          </div>
        </div>

        {/* Tagline */}
        <div>
          <h1 className="font-serif text-5xl font-bold text-white leading-tight mb-4">
            Every role.<br />One platform.
          </h1>
          <p className="text-white/50 text-base leading-relaxed mb-8">
            Unified restaurant operations — from kitchen to cashier, vendor to GM. Everyone sees exactly what they need.
          </p>

          {/* Role pills */}
          <div className="space-y-2">
            {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                <div>
                  <span className="text-white text-sm font-semibold">{cfg.label}</span>
                  <span className="text-white/40 text-xs ml-2">— {cfg.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs">© 2026 GoldStock Pro · Restaurant Intelligence Platform</p>
      </div>

      {/* Right Login Panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-10 lg:hidden">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D060)' }}>
            <TrendingUp size={18} className="text-white" />
          </div>
          <div className="font-serif font-bold text-white text-xl">GoldStock Pro</div>
        </div>

        <div className="w-full max-w-md">
          <h2 className="font-serif text-3xl font-bold text-white mb-1">Sign in</h2>
          <p className="text-white/40 text-sm mb-8">Access your role-specific workspace</p>

          {/* Quick login cards */}
          <div className="mb-6">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-5 gap-2">
              {QUICK_LOGINS.map(u => {
                const cfg = ROLE_CONFIG[u.role]
                return (
                  <button
                    key={u.email}
                    onClick={() => quickLogin(u)}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all hover:scale-105"
                    style={{
                      background: activeQuick === u.email ? cfg.bg : 'rgba(255,255,255,0.05)',
                      borderColor: activeQuick === u.email ? cfg.color : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <span className="text-xl">{u.emoji}</span>
                    <span className="text-[9px] font-semibold text-white/60 text-center leading-tight">{u.role === 'vendor' ? 'Vendor' : u.title.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="relative flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">or sign in manually</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Email</label>
              <input
                className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder:text-white/20 outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.15)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
                placeholder="you@goldstock.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                type="email"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 pr-12 rounded-xl text-white text-sm placeholder:text-white/20 outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                />
                <button onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm text-red-300 bg-red-500/10 border border-red-500/20">
                {error}
              </div>
            )}

            <button
              onClick={() => handleLogin()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white text-sm transition-all"
              style={{ background: loading ? 'rgba(201,168,76,0.5)' : 'linear-gradient(135deg, #C9A84C, #A8882E)', boxShadow: '0 4px 20px rgba(201,168,76,0.3)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn size={16} /> Sign In</>
              )}
            </button>
          </div>

          {/* Credentials hint */}
          <div className="mt-8 p-4 rounded-xl border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-3">Demo Credentials</p>
            <div className="space-y-1.5">
              {STAFF_USERS.map(u => (
                <button key={u.id} onClick={() => quickLogin(u)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group text-left">
                  <div>
                    <span className="text-white/60 text-xs font-medium">{u.email}</span>
                    <span className="text-white/25 text-xs ml-2">· {u.password}</span>
                  </div>
                  <ChevronRight size={12} className="text-white/20 group-hover:text-white/40 transition-colors" />
                </button>
              ))}
              <button onClick={() => quickLogin({ email: 'orders@goldenbakery.com', password: 'vendor@123', name: 'Golden Bakery', role: 'vendor', title: 'Vendor' })}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group text-left">
                <div>
                  <span className="text-white/60 text-xs font-medium">orders@goldenbakery.com</span>
                  <span className="text-white/25 text-xs ml-2">· vendor@123</span>
                </div>
                <ChevronRight size={12} className="text-white/20 group-hover:text-white/40 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
