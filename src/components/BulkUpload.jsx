import React, { useState, useRef, useCallback } from 'react'
import {
  Download, Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle,
  ChefHat, Package, Trash2, Eye, EyeOff, RefreshCw, X, Info
} from 'lucide-react'
import { useInventory } from '../context/InventoryContext'
import {
  TEMPLATE_INGREDIENTS, TEMPLATE_RECIPES,
  ingredientsToCSV, recipesToCSV,
  parseIngredientsCSV, parseRecipesCSV,
} from '../data/indianMenuData'

// ─── helpers ────────────────────────────────────────────────────────────────

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function Badge({ children, color = 'gold' }) {
  const map = { gold: 'badge-gold', green: 'badge-green', red: 'badge-red', amber: 'badge-amber', blue: 'bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-xs font-medium' }
  return <span className={map[color] || map.gold}>{children}</span>
}

// ─── Drop Zone ───────────────────────────────────────────────────────────────

function DropZone({ label, accept, onFile, disabled }) {
  const [drag, setDrag] = useState(false)
  const ref = useRef()
  const handle = useCallback((file) => { if (file) onFile(file) }, [onFile])

  return (
    <div
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]) }}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onClick={() => !disabled && ref.current?.click()}
      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        drag ? 'border-gold-500 bg-gold-50 scale-[1.01]' : 'border-gold-300 bg-white hover:border-gold-400 hover:bg-gold-50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => handle(e.target.files[0])} />
      <Upload size={28} className="mx-auto text-gold-400 mb-3" />
      <p className="text-sm font-semibold text-executive-dark">{drag ? 'Release to Upload' : `Upload ${label}`}</p>
      <p className="text-xs text-executive-muted mt-1">Drag & drop or click — CSV files only</p>
    </div>
  )
}

// ─── Preview Table ────────────────────────────────────────────────────────────

function IngredientsPreview({ rows, onRemove, onToggle, selected }) {
  return (
    <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-gold-200">
      <table className="table-gold text-xs">
        <thead>
          <tr>
            <th className="w-8"><input type="checkbox" onChange={e => rows.forEach((_, i) => onToggle(i, e.target.checked))} /></th>
            <th>Name</th><th>SKU</th><th>Category</th><th>Unit</th>
            <th>Cost/Unit (₹)</th><th>Stock</th><th>Par Level</th><th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={!selected[i] ? 'opacity-40' : ''}>
              <td><input type="checkbox" checked={!!selected[i]} onChange={e => onToggle(i, e.target.checked)} /></td>
              <td className="font-medium text-executive-dark">{r.name}</td>
              <td className="font-mono text-executive-muted">{r.sku || '—'}</td>
              <td><Badge>{r.category}</Badge></td>
              <td className="text-executive-muted">{r.unit}</td>
              <td className="font-semibold text-gold-700">₹{Number(r.costPerUnit).toFixed(2)}</td>
              <td>{r.currentStock}</td>
              <td>{r.parLevel}</td>
              <td><button onClick={() => onRemove(i)} className="text-red-400 hover:text-red-600"><X size={12} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RecipesPreview({ rows, onRemove, selected, onToggle }) {
  const [expanded, setExpanded] = useState({})
  return (
    <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-gold-200">
      <table className="table-gold text-xs">
        <thead>
          <tr>
            <th className="w-8"><input type="checkbox" onChange={e => rows.forEach((_, i) => onToggle(i, e.target.checked))} /></th>
            <th>Recipe</th><th>Category</th><th>Price (₹)</th><th>Ingredients</th><th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <React.Fragment key={i}>
              <tr className={!selected[i] ? 'opacity-40' : ''}>
                <td><input type="checkbox" checked={!!selected[i]} onChange={e => onToggle(i, e.target.checked)} /></td>
                <td className="font-semibold text-executive-dark">{r.name}</td>
                <td><Badge>{r.category}</Badge></td>
                <td className="font-semibold text-gold-700">₹{r.sellingPrice}</td>
                <td>
                  <button onClick={() => setExpanded(x => ({ ...x, [i]: !x[i] }))} className="flex items-center gap-1 text-gold-600 hover:text-gold-800">
                    {r.ingredients.length} items {expanded[i] ? <EyeOff size={11} /> : <Eye size={11} />}
                  </button>
                </td>
                <td><button onClick={() => onRemove(i)} className="text-red-400 hover:text-red-600"><X size={12} /></button></td>
              </tr>
              {expanded[i] && r.ingredients.map((ing, j) => (
                <tr key={`${i}-${j}`} className="bg-gold-50/50">
                  <td /><td colSpan={2} className="pl-6 text-executive-muted italic">↳ {ing.name}</td>
                  <td colSpan={3} className="text-executive-muted">{ing.quantity} {ing.unit}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BulkUpload() {
  const { ingredients, addIngredient, addRecipe } = useInventory()

  // Ingredients tab state
  const [ingRows,     setIngRows]     = useState([])
  const [ingSelected, setIngSelected] = useState({})
  const [ingImported, setIngImported] = useState(null) // null | number
  const [ingError,    setIngError]    = useState('')

  // Recipes tab state
  const [recRows,     setRecRows]     = useState([])
  const [recSelected, setRecSelected] = useState({})
  const [recImported, setRecImported] = useState(null)
  const [recError,    setRecError]    = useState('')

  const [activeTab, setActiveTab] = useState('ingredients')
  const [mergeMode, setMergeMode] = useState('skip') // 'skip' | 'overwrite'

  // ── Downloads ──────────────────────────────────────────────────
  const downloadIngredientTemplate = () => downloadCSV(ingredientsToCSV(TEMPLATE_INGREDIENTS), 'indian_ingredients_template.csv')
  const downloadRecipeTemplate     = () => downloadCSV(recipesToCSV(TEMPLATE_RECIPES), 'indian_recipes_template.csv')
  const downloadCurrentIngredients = () => downloadCSV(ingredientsToCSV(ingredients), 'current_ingredients_export.csv')

  // ── File Parsers ───────────────────────────────────────────────
  const readFile = (file, onText) => {
    const reader = new FileReader()
    reader.onload = e => onText(e.target.result)
    reader.readAsText(file)
  }

  const handleIngFile = (file) => {
    setIngError(''); setIngImported(null)
    readFile(file, text => {
      try {
        const parsed = parseIngredientsCSV(text)
        if (!parsed.length) { setIngError('No valid rows found. Check your CSV format.'); return }
        setIngRows(parsed)
        const sel = {}; parsed.forEach((_, i) => { sel[i] = true }); setIngSelected(sel)
      } catch { setIngError('Failed to parse CSV. Ensure it matches the template format.') }
    })
  }

  const handleRecFile = (file) => {
    setRecError(''); setRecImported(null)
    readFile(file, text => {
      try {
        const parsed = parseRecipesCSV(text)
        if (!parsed.length) { setRecError('No valid rows found. Check your CSV format.'); return }
        setRecRows(parsed)
        const sel = {}; parsed.forEach((_, i) => { sel[i] = true }); setRecSelected(sel)
      } catch { setRecError('Failed to parse CSV. Ensure it matches the template format.') }
    })
  }

  // ── Import ─────────────────────────────────────────────────────
  const importIngredients = () => {
    const toImport = ingRows.filter((_, i) => ingSelected[i])
    const existing = new Set(ingredients.map(i => i.name.toLowerCase()))
    let count = 0
    toImport.forEach(row => {
      if (mergeMode === 'skip' && existing.has(row.name.toLowerCase())) return
      addIngredient(row); count++
    })
    setIngImported(count); setIngRows([]); setIngSelected({})
  }

  const importRecipes = () => {
    const toImport = recRows.filter((_, i) => recSelected[i])
    let count = 0
    toImport.forEach(row => {
      // Map ingredient names → IDs
      const mappedIngredients = row.ingredients.map(ri => {
        const found = ingredients.find(i => i.name.toLowerCase() === ri.name.toLowerCase())
        return found ? { ingredientId: found.id, quantity: ri.quantity } : null
      }).filter(Boolean)

      addRecipe({
        name:         row.name,
        category:     row.category,
        sellingPrice: row.sellingPrice,
        ingredients:  mappedIngredients,
      }); count++
    })
    setRecImported(count); setRecRows([]); setRecSelected({})
  }

  // ── Load Full Template Directly ────────────────────────────────
  const loadIngredientTemplate = () => {
    setIngRows(TEMPLATE_INGREDIENTS)
    const sel = {}; TEMPLATE_INGREDIENTS.forEach((_, i) => { sel[i] = true }); setIngSelected(sel)
    setIngImported(null); setIngError('')
  }

  const loadRecipeTemplate = () => {
    setRecRows(TEMPLATE_RECIPES.map(r => ({
      ...r,
      // keep ingredient names as-is (will resolve during import)
      ingredients: r.ingredients.map(ing => ({ name: ing.name, quantity: ing.quantity, unit: ing.unit }))
    })))
    const sel = {}; TEMPLATE_RECIPES.forEach((_, i) => { sel[i] = true }); setRecSelected(sel)
    setRecImported(null); setRecError('')
  }

  const ingSelectedCount = Object.values(ingSelected).filter(Boolean).length
  const recSelectedCount = Object.values(recSelected).filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="page-title">Bulk Upload</h1>
          <p className="page-subtitle">Import South & North Indian menu data in bulk — download, edit in Excel, re-upload</p>
        </div>
        <span className="badge-gold">Indian Menu Database</span>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
        <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>How it works:</strong> Download the pre-filled template CSV → Edit prices, stock, categories in Excel/Google Sheets → Re-upload the file → Preview & import.
          You can also click <strong>"Load Template"</strong> to preview & import the full Indian menu directly without downloading.
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Template Ingredients', value: TEMPLATE_INGREDIENTS.length,  icon: Package,  color: 'text-gold-600'  },
          { label: 'Total Recipes',        value: TEMPLATE_RECIPES.length,      icon: ChefHat,  color: 'text-green-600' },
          { label: 'Karnataka + S.Indian', value: TEMPLATE_RECIPES.filter(r => r.category === 'South Indian' || r.category === 'Karnataka').length, icon: ChefHat, color: 'text-amber-600' },
          { label: 'N.Indian + Indo-Chinese', value: TEMPLATE_RECIPES.filter(r => r.category.startsWith('North Indian') || r.category === 'Indo-Chinese').length, icon: ChefHat, color: 'text-blue-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="gold-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-executive-dark">{value}</p>
              <p className="text-[10px] text-executive-muted uppercase tracking-wide">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gold-200 gap-1">
        {['ingredients', 'recipes'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === t
                ? 'bg-white border border-b-white border-gold-200 text-executive-dark -mb-px'
                : 'text-executive-muted hover:text-executive-dark'
            }`}
          >
            {t === 'ingredients' ? '🥕 Ingredients' : '🍽️ Recipes'}
          </button>
        ))}
      </div>

      {/* ─── INGREDIENTS TAB ─────────────────────────────────────── */}
      {activeTab === 'ingredients' && (
        <div className="space-y-5">
          {/* Download Strip */}
          <div className="gold-card p-5">
            <h2 className="font-serif font-semibold text-executive-dark mb-4">Step 1 — Download Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 border border-gold-200 rounded-xl bg-gold-50">
                <p className="text-xs text-executive-muted mb-2">Full Indian database ({TEMPLATE_INGREDIENTS.length} ingredients)</p>
                <button onClick={downloadIngredientTemplate} className="btn-gold w-full text-xs">
                  <Download size={14} /> Download Template CSV
                </button>
              </div>
              <div className="p-4 border border-gold-200 rounded-xl bg-gold-50">
                <p className="text-xs text-executive-muted mb-2">Your current inventory ({ingredients.length} items)</p>
                <button onClick={downloadCurrentIngredients} className="btn-outline w-full text-xs" disabled={!ingredients.length}>
                  <Download size={14} /> Export Current Data
                </button>
              </div>
              <div className="p-4 border border-blue-100 rounded-xl bg-blue-50">
                <p className="text-xs text-blue-700 mb-2">Skip download — preview & import directly</p>
                <button onClick={loadIngredientTemplate} className="w-full text-xs px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <RefreshCw size={14} /> Load Template Directly
                </button>
              </div>
            </div>
          </div>

          {/* Upload & Options */}
          <div className="gold-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-semibold text-executive-dark">Step 2 — Upload Your Edited CSV</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-executive-muted">Duplicate handling:</span>
                {['skip', 'overwrite'].map(m => (
                  <button key={m} onClick={() => setMergeMode(m)}
                    className={`px-3 py-1 text-xs rounded-lg border transition-all ${mergeMode === m ? 'bg-gold-500 text-white border-gold-500' : 'border-gray-200 text-executive-muted hover:border-gold-300'}`}>
                    {m === 'skip' ? 'Skip Duplicates' : 'Overwrite'}
                  </button>
                ))}
              </div>
            </div>
            <DropZone label="Ingredients CSV" accept=".csv" onFile={handleIngFile} />
            {ingError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <XCircle size={16} /> {ingError}
              </div>
            )}
            {ingImported !== null && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <CheckCircle2 size={16} /> Successfully imported <strong>{ingImported}</strong> ingredients!
              </div>
            )}
          </div>

          {/* Preview */}
          {ingRows.length > 0 && (
            <div className="gold-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-semibold text-executive-dark">
                  Step 3 — Preview &amp; Import
                  <span className="ml-2 text-sm font-sans font-normal text-executive-muted">
                    {ingSelectedCount} of {ingRows.length} selected
                  </span>
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => { setIngRows([]); setIngSelected({}) }} className="btn-ghost text-xs">
                    <Trash2 size={13} /> Clear
                  </button>
                  <button onClick={importIngredients} disabled={!ingSelectedCount} className="btn-gold text-xs">
                    <Upload size={13} /> Import {ingSelectedCount} Ingredients
                  </button>
                </div>
              </div>
              <IngredientsPreview
                rows={ingRows}
                selected={ingSelected}
                onToggle={(i, v) => setIngSelected(s => ({ ...s, [i]: v }))}
                onRemove={i => { setIngRows(r => r.filter((_, j) => j !== i)); setIngSelected(s => { const n = { ...s }; delete n[i]; return n }) }}
              />
            </div>
          )}
        </div>
      )}

      {/* ─── RECIPES TAB ─────────────────────────────────────────── */}
      {activeTab === 'recipes' && (
        <div className="space-y-5">
          {/* Download Strip */}
          <div className="gold-card p-5">
            <h2 className="font-serif font-semibold text-executive-dark mb-4">Step 1 — Download Recipe Template</h2>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 mb-4 flex gap-2">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              Import ingredients first — recipe import links ingredient names to your existing ingredient database.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 border border-gold-200 rounded-xl bg-gold-50">
                <p className="text-xs text-executive-muted mb-2">{TEMPLATE_RECIPES.length} pre-built Indian recipes</p>
                <button onClick={downloadRecipeTemplate} className="btn-gold w-full text-xs">
                  <Download size={14} /> Download Recipe CSV
                </button>
              </div>
              <div className="p-4 border border-blue-100 rounded-xl bg-blue-50">
                <p className="text-xs text-blue-700 mb-2">Preview all {TEMPLATE_RECIPES.length} recipes inline</p>
                <button onClick={loadRecipeTemplate} className="w-full text-xs px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <RefreshCw size={14} /> Load Template Directly
                </button>
              </div>
            </div>
          </div>

          {/* Upload */}
          <div className="gold-card p-5 space-y-4">
            <h2 className="font-serif font-semibold text-executive-dark">Step 2 — Upload Recipe CSV</h2>
            <DropZone label="Recipes CSV" accept=".csv" onFile={handleRecFile} />
            {recError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <XCircle size={16} /> {recError}
              </div>
            )}
            {recImported !== null && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <CheckCircle2 size={16} /> Successfully imported <strong>{recImported}</strong> recipes!
              </div>
            )}
          </div>

          {/* Preview */}
          {recRows.length > 0 && (
            <div className="gold-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-semibold text-executive-dark">
                  Step 3 — Preview &amp; Import
                  <span className="ml-2 text-sm font-sans font-normal text-executive-muted">
                    {recSelectedCount} of {recRows.length} selected
                  </span>
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => { setRecRows([]); setRecSelected({}) }} className="btn-ghost text-xs">
                    <Trash2 size={13} /> Clear
                  </button>
                  <button onClick={importRecipes} disabled={!recSelectedCount} className="btn-gold text-xs">
                    <Upload size={13} /> Import {recSelectedCount} Recipes
                  </button>
                </div>
              </div>
              <RecipesPreview
                rows={recRows}
                selected={recSelected}
                onToggle={(i, v) => setRecSelected(s => ({ ...s, [i]: v }))}
                onRemove={i => { setRecRows(r => r.filter((_, j) => j !== i)); setRecSelected(s => { const n = { ...s }; delete n[i]; return n }) }}
              />
            </div>
          )}
        </div>
      )}

      {/* CSV Format Reference */}
      <div className="gold-card p-5">
        <h2 className="font-serif font-semibold text-executive-dark mb-4">CSV Format Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-executive-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><Package size={12} /> Ingredients CSV</p>
            <div className="bg-executive-dark rounded-lg p-3 font-mono text-xs text-green-300 overflow-x-auto">
              <div className="text-gray-400 mb-1"># Header row (required):</div>
              <div>name,sku,category,unit,costPerUnit,currentStock,parLevel</div>
              <div className="text-gray-400 mt-2 mb-1"># Example rows:</div>
              <div>"Idly Rice",SI-001,Pantry,kg,45,25,10</div>
              <div>"Urad Dal",SI-002,Pantry,kg,120,10,4</div>
              <div>"Fresh Coconut",SI-010,Produce,pcs,30,40,15</div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-executive-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><ChefHat size={12} /> Recipes CSV</p>
            <div className="bg-executive-dark rounded-lg p-3 font-mono text-xs text-green-300 overflow-x-auto">
              <div className="text-gray-400 mb-1"># Header row (required):</div>
              <div>recipeName,recipeCategory,sellingPrice,ingredientName,quantity,unit</div>
              <div className="text-gray-400 mt-2 mb-1"># Example (one row per ingredient):</div>
              <div>"Masala Dosa",South Indian,120,"Idly / Dosa Batter",0.2,L</div>
              <div>,,,"Potato",0.1,kg</div>
              <div>,,,"Onion",0.05,kg</div>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {['Pantry','Produce','Meat','Dairy','Beverages','Bakery','Seafood','Other'].map(c => (
            <span key={c} className="badge-gold text-[10px]">{c}</span>
          ))}
        </div>
        <p className="text-[10px] text-executive-muted mt-2">Valid categories for the <em>category</em> column</p>
      </div>
    </div>
  )
}
