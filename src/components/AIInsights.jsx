import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  Sparkles, Key, RefreshCw, TrendingUp, ShoppingCart, AlertTriangle,
  Lightbulb, ChevronDown, ChevronUp, X, ExternalLink, Zap, Brain,
  Clock, Play, Pause, CheckCircle, Timer
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useInventory } from '../context/InventoryContext'

const INTERVALS = [
  { label: 'Every 30 min', ms: 30 * 60 * 1000 },
  { label: 'Every 1 hour', ms: 60 * 60 * 1000 },
  { label: 'Every 4 hours', ms: 4 * 60 * 60 * 1000 },
  { label: 'Every 8 hours', ms: 8 * 60 * 60 * 1000 },
  { label: 'Every 24 hours', ms: 24 * 60 * 60 * 1000 },
]

const SALES_TRIGGER_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: 'Every 5 sales', value: 5 },
  { label: 'Every 10 sales', value: 10 },
  { label: 'Every 25 sales', value: 25 },
]

const LS_RESULT    = 'goldstock_ai_result'
const LS_LAST_RUN  = 'goldstock_ai_lastrun'
const LS_AUTO      = 'goldstock_ai_auto'
const LS_INTERVAL  = 'goldstock_ai_interval'
const LS_TRIGGER   = 'goldstock_ai_trigger'
const LS_SALES_CTR = 'goldstock_ai_salesctr'

const GROQ_MODELS = [
  { id: 'llama-3.3-70b-versatile',  label: 'Llama 3.3 70B (Best quality)' },
  { id: 'llama-3.1-8b-instant',     label: 'Llama 3.1 8B (Fastest)'       },
  { id: 'mixtral-8x7b-32768',       label: 'Mixtral 8x7B (Long context)'  },
  { id: 'gemma2-9b-it',             label: 'Gemma 2 9B (Google)'          },
]

const LS_KEY = 'goldstock_groq_key'

function buildPrompt(ingredients, recipes, sales, getVarianceData) {
  const today     = new Date().toISOString().split('T')[0]
  const last7days = sales.filter(s => {
    const diff = (Date.now() - new Date(s.timestamp)) / 86400000
    return diff <= 7
  })

  const salesByRecipe = recipes.map(r => {
    const recipeSales = last7days.filter(s => s.recipeId === r.id)
    const totalQty    = recipeSales.reduce((s, sale) => s + sale.quantity, 0)
    return { name: r.name, category: r.category, price: r.sellingPrice, qty7d: totalQty }
  })

  const variance = getVarianceData().map(v => ({
    name: v.name, unit: v.unit, theoretical: v.theoretical, physical: v.physical,
    variancePct: v.variancePct, varianceCost: v.varianceCost
  }))

  const stockLevels = ingredients.map(i => ({
    name: i.name, current: i.currentStock, par: i.parLevel, unit: i.unit,
    cost: i.costPerUnit, category: i.category
  }))

  return `You are an expert restaurant inventory analyst. Analyze this restaurant's data and return ONLY a valid JSON object.

Today: ${today}

SALES (last 7 days):
${JSON.stringify(salesByRecipe, null, 2)}

CURRENT STOCK LEVELS:
${JSON.stringify(stockLevels, null, 2)}

VARIANCE ANALYSIS (theoretical vs physical):
${JSON.stringify(variance, null, 2)}

Return this EXACT JSON structure (no markdown, no explanation, only JSON):
{
  "demandForecast": [
    { "item": "string", "predictedQty7d": number, "trend": "up|down|stable", "confidence": number, "reason": "string" }
  ],
  "reorderRecommendations": [
    { "ingredient": "string", "currentStock": number, "unit": "string", "recommendedOrderQty": number, "urgency": "critical|high|medium|low", "reasoning": "string" }
  ],
  "varianceInsights": [
    { "ingredient": "string", "assessment": "normal_wastage|suspected_theft|measurement_error|spoilage", "riskLevel": "high|medium|low", "action": "string" }
  ],
  "menuOptimization": [
    { "item": "string", "insight": "string", "action": "promote|discount|remove|keep", "reason": "string" }
  ],
  "executiveSummary": "string (2-3 sentences summarizing the key findings and most urgent actions)"
}`
}

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="gold-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gold-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={17} className="text-gold-600" />
          <span className="font-serif font-semibold text-executive-dark">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-executive-muted" /> : <ChevronDown size={16} className="text-executive-muted" />}
      </button>
      {open && <div className="border-t border-gold-100 p-5">{children}</div>}
    </div>
  )
}

const URGENCY_CLS = { critical: 'badge-red', high: 'badge-amber', medium: 'badge-blue', low: 'badge-gray' }
const RISK_CLS    = { high: 'badge-red', medium: 'badge-amber', low: 'badge-green' }
const ACTION_CLS  = { promote: 'badge-green', discount: 'badge-amber', remove: 'badge-red', keep: 'badge-gray' }
const TREND_ICON  = { up: '↑', down: '↓', stable: '→' }
const TREND_CLS   = { up: 'text-green-600', down: 'text-red-600', stable: 'text-executive-muted' }

export default function AIInsights() {
  const { ingredients, recipes, sales, getVarianceData } = useInventory()

  const [apiKey,       setApiKey]       = useState(() => localStorage.getItem(LS_KEY) || '')
  const [model,        setModel]        = useState(GROQ_MODELS[0].id)
  const [result,       setResult]       = useState(() => { try { return JSON.parse(localStorage.getItem(LS_RESULT)) } catch { return null } })
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)
  const [showKey,      setShowKey]      = useState(!localStorage.getItem(LS_KEY))
  const [lastRun,      setLastRun]      = useState(() => localStorage.getItem(LS_LAST_RUN) || null)
  const [autoOn,       setAutoOn]       = useState(() => localStorage.getItem(LS_AUTO) === 'true')
  const [intervalMs,   setIntervalMs]   = useState(() => parseInt(localStorage.getItem(LS_INTERVAL) || INTERVALS[1].ms))
  const [salesTrigger, setSalesTrigger] = useState(() => parseInt(localStorage.getItem(LS_TRIGGER) || '0'))
  const [countdown,    setCountdown]    = useState('')
  const [justTriggered, setJustTriggered] = useState(false)

  const timerRef    = useRef(null)
  const countdownRef = useRef(null)
  const nextRunRef  = useRef(null)

  const saveKey = (k) => { setApiKey(k); localStorage.setItem(LS_KEY, k) }

  const runAnalysis = useCallback(async (silent = false) => {
    if (!apiKey.trim()) { setShowKey(true); return }
    if (!silent) { setError(null); setResult(null) }
    setLoading(true)

    const prompt = buildPrompt(ingredients, recipes, sales, getVarianceData)
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey.trim()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are a restaurant inventory analyst. Always respond with valid JSON only.' },
            { role: 'user',   content: prompt },
          ],
          temperature: 0.3, max_tokens: 2048,
          response_format: { type: 'json_object' },
        }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e?.error?.message || `API error ${res.status}`)
      }
      const data   = await res.json()
      const parsed = JSON.parse(data.choices?.[0]?.message?.content)
      setResult(parsed)
      const now = new Date().toISOString()
      setLastRun(now)
      localStorage.setItem(LS_RESULT,   JSON.stringify(parsed))
      localStorage.setItem(LS_LAST_RUN, now)
      setError(null)
    } catch (err) {
      if (!silent) setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [apiKey, model, ingredients, recipes, sales, getVarianceData])

  // ── Schedule auto-run ────────────────────────────────────
  const scheduleNext = useCallback(() => {
    clearInterval(timerRef.current)
    clearInterval(countdownRef.current)
    if (!autoOn || !apiKey) return

    nextRunRef.current = Date.now() + intervalMs

    timerRef.current = setInterval(() => {
      runAnalysis(true)
      nextRunRef.current = Date.now() + intervalMs
    }, intervalMs)

    countdownRef.current = setInterval(() => {
      const remaining = nextRunRef.current - Date.now()
      if (remaining <= 0) { setCountdown('Running…'); return }
      const h = Math.floor(remaining / 3600000)
      const m = Math.floor((remaining % 3600000) / 60000)
      const s = Math.floor((remaining % 60000) / 1000)
      setCountdown(h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`)
    }, 1000)
  }, [autoOn, apiKey, intervalMs, runAnalysis])

  useEffect(() => { scheduleNext(); return () => { clearInterval(timerRef.current); clearInterval(countdownRef.current) } }, [scheduleNext])

  // ── Sales-count trigger ──────────────────────────────────
  useEffect(() => {
    if (!salesTrigger || !apiKey) return
    const stored = parseInt(localStorage.getItem(LS_SALES_CTR) || '0')
    const current = sales.length
    if (current - stored >= salesTrigger) {
      localStorage.setItem(LS_SALES_CTR, String(current))
      setJustTriggered(true)
      runAnalysis(true)
      setTimeout(() => setJustTriggered(false), 4000)
    }
  }, [sales.length, salesTrigger, apiKey, runAnalysis])

  const toggleAuto = () => {
    const next = !autoOn
    setAutoOn(next)
    localStorage.setItem(LS_AUTO, String(next))
    if (next && apiKey) runAnalysis(true)
  }

  const changeInterval = (ms) => {
    setIntervalMs(ms)
    localStorage.setItem(LS_INTERVAL, String(ms))
  }

  const changeTrigger = (v) => {
    setSalesTrigger(v)
    localStorage.setItem(LS_TRIGGER, String(v))
    localStorage.setItem(LS_SALES_CTR, String(sales.length))
  }

  const timeAgo = (iso) => {
    if (!iso) return null
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
    if (diff < 60)   return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  const forecastChartData = (result?.demandForecast || []).map(d => ({
    name:      d.item.length > 12 ? d.item.slice(0, 12) + '…' : d.item,
    predicted: d.predictedQty7d,
    confidence: d.confidence,
  })) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Brain size={22} className="text-gold-500" />
            AI Insights
          </h1>
          <p className="page-subtitle">
            Demand forecasting, reorder recommendations & anomaly detection — powered by Groq (free)
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowKey(v => !v)} className="btn-outline text-xs">
            <Key size={14} /> {showKey ? 'Hide Key' : 'API Key'}
          </button>
          <button
            onClick={() => runAnalysis(false)}
            disabled={loading}
            className={`btn-gold ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading
              ? <><RefreshCw size={15} className="animate-spin" /> Analysing…</>
              : <><Sparkles size={15} /> Run Now</>
            }
          </button>
        </div>
      </div>

      {/* Automation Controls */}
      <div className="gold-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Auto toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAuto}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                autoOn
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-gray-100 text-executive-muted hover:bg-gray-200'
              }`}
            >
              {autoOn ? <><Play size={14} /> Auto-Run ON</> : <><Pause size={14} /> Auto-Run OFF</>}
            </button>

            {autoOn && (
              <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                <Timer size={13} className="animate-pulse" />
                Next run in <strong>{countdown || '…'}</strong>
              </div>
            )}
          </div>

          {/* Schedule interval */}
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-executive-muted flex-shrink-0" />
            <span className="text-xs text-executive-muted font-medium">Schedule:</span>
            <div className="flex gap-1 flex-wrap">
              {INTERVALS.map(iv => (
                <button
                  key={iv.ms}
                  onClick={() => changeInterval(iv.ms)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    intervalMs === iv.ms
                      ? 'bg-executive-navy text-gold-400'
                      : 'bg-gray-100 text-executive-muted hover:bg-gray-200'
                  }`}
                >
                  {iv.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sales trigger */}
          <div className="flex items-center gap-2 ml-auto">
            <Zap size={14} className="text-gold-500 flex-shrink-0" />
            <span className="text-xs text-executive-muted font-medium">Auto-trigger:</span>
            <select
              className="select-gold w-auto text-xs py-1"
              value={salesTrigger}
              onChange={e => changeTrigger(parseInt(e.target.value))}
            >
              {SALES_TRIGGER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gold-100 text-xs text-executive-muted">
          {lastRun && (
            <span className="flex items-center gap-1.5">
              <CheckCircle size={12} className="text-green-500" />
              Last analysis: <strong>{timeAgo(lastRun)}</strong>
              <span className="text-gray-300">·</span>
              {new Date(lastRun).toLocaleString()}
            </span>
          )}
          {justTriggered && (
            <span className="flex items-center gap-1.5 text-gold-600 font-medium animate-pulse">
              <Zap size={12} /> Auto-triggered by sales milestone!
            </span>
          )}
          <span className="ml-auto">{sales.length} total sales recorded</span>
        </div>
      </div>

      {/* API Key Setup */}
      {showKey && (
        <div className="gold-card p-5 border-gold-400 bg-gold-50">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-serif font-semibold text-executive-dark">Groq API Key</h3>
              <p className="text-xs text-executive-muted mt-0.5">
                Free at{' '}
                <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-gold-600 hover:underline inline-flex items-center gap-0.5">
                  console.groq.com <ExternalLink size={10} />
                </a>
                {' '}— no credit card required
              </p>
            </div>
            <button onClick={() => setShowKey(false)} className="text-executive-muted hover:text-executive-dark">
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              className="input-gold flex-1"
              placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={e => saveKey(e.target.value)}
            />
            <select className="select-gold w-64" value={model} onChange={e => setModel(e.target.value)}>
              {GROQ_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-executive-muted">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Free tier: 14,400 req/day</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> No credit card needed</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Key stored locally only</div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="gold-card p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Analysis failed</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              {error.includes('401') && (
                <p className="text-xs text-red-600 mt-1">Check your API key at console.groq.com</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="gold-card p-5 space-y-3 animate-pulse">
              <div className="h-4 bg-gold-100 rounded w-48" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
          <div className="text-center text-sm text-executive-muted py-4">
            <Zap size={16} className="inline mr-1 text-gold-500" />
            Groq is analysing {sales.length} sales records and {ingredients.length} ingredients…
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !result && !error && (
        <div className="gold-card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gold-100 flex items-center justify-center mx-auto mb-4">
            <Brain size={28} className="text-gold-600" />
          </div>
          <h2 className="font-serif font-semibold text-executive-dark text-xl mb-2">AI-Powered Predictions</h2>
          <p className="text-executive-muted text-sm max-w-md mx-auto mb-6">
            Uses your actual sales history and inventory data to generate demand forecasts,
            smart reorder recommendations, variance anomaly detection, and menu optimization tips.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto mb-8">
            {[
              { icon: TrendingUp, label: 'Demand Forecast' },
              { icon: ShoppingCart, label: 'Reorder Advice' },
              { icon: AlertTriangle, label: 'Anomaly Detection' },
              { icon: Lightbulb, label: 'Menu Insights' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="p-3 bg-gold-50 border border-gold-200 rounded-xl text-center">
                <Icon size={18} className="text-gold-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-executive-charcoal">{label}</p>
              </div>
            ))}
          </div>
          <button onClick={() => { setShowKey(true); if (apiKey) runAnalysis() }} className="btn-gold mx-auto">
            <Sparkles size={16} /> {apiKey ? 'Run Analysis' : 'Set Up API Key'}
          </button>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Executive Summary */}
          {result.executiveSummary && (
            <div className="gold-card p-5 bg-executive-navy text-white border-none">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                  <Brain size={16} className="text-gold-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-1">AI Executive Summary</p>
                  <p className="text-sm text-white/90 leading-relaxed">{result.executiveSummary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Demand Forecast */}
          {result.demandForecast?.length > 0 && (
            <Section title="7-Day Demand Forecast" icon={TrendingUp}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={forecastChartData} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                      <Tooltip
                        contentStyle={{ background: '#1A2540', border: '1px solid #C9A84C44', borderRadius: 8, color: '#fff', fontSize: 12 }}
                      />
                      <Bar dataKey="predicted" name="Predicted Units" fill="#C9A84C" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {result.demandForecast.map((d, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-executive-dark text-sm">{d.item}</span>
                          <span className={`text-sm font-bold ${TREND_CLS[d.trend]}`}>{TREND_ICON[d.trend]}</span>
                        </div>
                        <p className="text-xs text-executive-muted">{d.reason}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gold-700">{d.predictedQty7d} units</p>
                        <p className="text-[10px] text-executive-muted">{d.confidence}% conf.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Reorder Recommendations */}
          {result.reorderRecommendations?.length > 0 && (
            <Section title="Smart Reorder Recommendations" icon={ShoppingCart}>
              <div className="space-y-2">
                {result.reorderRecommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gold-200 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-executive-dark">{r.ingredient}</span>
                        <span className={URGENCY_CLS[r.urgency] || 'badge-gray'}>{r.urgency}</span>
                      </div>
                      <p className="text-xs text-executive-muted">{r.reasoning}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-executive-muted">Current: {r.currentStock} {r.unit}</p>
                      <p className="font-bold text-gold-700">Order: {r.recommendedOrderQty} {r.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Variance Anomaly Detection */}
          {result.varianceInsights?.length > 0 && (
            <Section title="Variance Anomaly Detection" icon={AlertTriangle}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.varianceInsights.map((v, i) => {
                  const assessmentLabel = v.assessment.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                  const assessmentCls   = v.assessment === 'suspected_theft' ? 'badge-red'
                                        : v.assessment === 'spoilage'        ? 'badge-amber'
                                        : v.assessment === 'measurement_error' ? 'badge-blue'
                                        : 'badge-gray'
                  return (
                    <div key={i} className={`p-4 rounded-xl border ${v.riskLevel === 'high' ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-executive-dark text-sm">{v.ingredient}</span>
                        <div className="flex gap-1">
                          <span className={assessmentCls}>{assessmentLabel}</span>
                          <span className={RISK_CLS[v.riskLevel] || 'badge-gray'}>{v.riskLevel} risk</span>
                        </div>
                      </div>
                      <p className="text-xs text-executive-muted">{v.action}</p>
                    </div>
                  )
                })}
              </div>
            </Section>
          )}

          {/* Menu Optimization */}
          {result.menuOptimization?.length > 0 && (
            <Section title="Menu Optimization Tips" icon={Lightbulb}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.menuOptimization.map((m, i) => (
                  <div key={i} className="p-4 rounded-xl border border-gray-100 hover:border-gold-200 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-executive-dark text-sm">{m.item}</span>
                      <span className={ACTION_CLS[m.action] || 'badge-gray'}>{m.action}</span>
                    </div>
                    <p className="text-xs font-medium text-executive-charcoal mb-1">{m.insight}</p>
                    <p className="text-xs text-executive-muted">{m.reason}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Re-run */}
          <div className="text-center pt-2">
            <button onClick={runAnalysis} className="btn-outline text-xs">
              <RefreshCw size={13} /> Re-run Analysis
            </button>
            <p className="text-[10px] text-executive-muted mt-2">
              Uses {sales.length} sales records · {ingredients.length} ingredients · Model: {model}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
