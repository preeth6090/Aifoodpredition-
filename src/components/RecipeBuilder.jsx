import React, { useState, useMemo } from 'react'
import { Plus, Trash2, Edit3, ChefHat, X, Save, Search, DollarSign } from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

const CATEGORIES = ['Burgers', 'Sides', 'Beverages', 'Salads', 'Desserts', 'Mains', 'Starters']

function RecipeModal({ recipe, onClose, onSave, ingredients, calcRecipeCost }) {
  const [form, setForm] = useState(recipe || {
    name: '', category: 'Burgers', sellingPrice: '', ingredients: []
  })

  const addIngredient = () => {
    setForm(f => ({ ...f, ingredients: [...f.ingredients, { ingredientId: ingredients[0]?.id || 1, quantity: 1 }] }))
  }

  const removeIngredient = (idx) => {
    setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }))
  }

  const updateIngredientRow = (idx, field, value) => {
    setForm(f => {
      const updated = [...f.ingredients]
      updated[idx] = { ...updated[idx], [field]: field === 'quantity' ? parseFloat(value) || 0 : parseInt(value) }
      return { ...f, ingredients: updated }
    })
  }

  const recipeCost = useMemo(() => calcRecipeCost(form), [form, calcRecipeCost])
  const margin = form.sellingPrice ? ((parseFloat(form.sellingPrice) - recipeCost) / parseFloat(form.sellingPrice) * 100) : 0

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-gold-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-executive-dark px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold text-white">
              {recipe ? 'Edit Recipe' : 'New Recipe'}
            </h2>
            <p className="text-xs text-gold-400 mt-0.5">Define ingredients and quantities</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-gold">Recipe / Menu Item Name</label>
              <input
                className="input-gold"
                placeholder="e.g. Classic Beef Burger"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-gold">Category</label>
              <select className="select-gold" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-gold">Selling Price ($)</label>
              <input
                className="input-gold"
                type="number" step="0.01" min="0"
                placeholder="0.00"
                value={form.sellingPrice}
                onChange={e => setForm(f => ({ ...f, sellingPrice: e.target.value }))}
              />
            </div>
            <div className="flex flex-col justify-end">
              <div className="p-3 bg-gold-50 rounded-xl border border-gold-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-executive-muted">Recipe Cost</span>
                  <span className="font-bold text-executive-dark">${recipeCost.toFixed(3)}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-executive-muted">Gross Margin</span>
                  <span className={`font-bold ${margin > 50 ? 'text-green-600' : margin > 30 ? 'text-amber-600' : 'text-red-600'}`}>
                    {margin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label-gold mb-0">Ingredients</label>
              <button className="btn-outline text-xs" onClick={addIngredient}>
                <Plus size={14} /> Add Ingredient
              </button>
            </div>

            {form.ingredients.length === 0 ? (
              <div className="border-2 border-dashed border-gold-200 rounded-xl p-6 text-center">
                <ChefHat size={28} className="mx-auto text-gold-300 mb-2" />
                <p className="text-sm text-executive-muted">No ingredients yet. Click "Add Ingredient" to begin.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 px-2 text-[10px] font-semibold text-executive-muted uppercase tracking-wider">
                  <span className="col-span-6">Ingredient</span>
                  <span className="col-span-3">Quantity</span>
                  <span className="col-span-2">Unit</span>
                  <span className="col-span-1" />
                </div>
                {form.ingredients.map((ri, idx) => {
                  const ing = ingredients.find(i => i.id === ri.ingredientId)
                  return (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded-lg">
                      <div className="col-span-6">
                        <select
                          className="select-gold"
                          value={ri.ingredientId}
                          onChange={e => updateIngredientRow(idx, 'ingredientId', e.target.value)}
                        >
                          {ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input
                          className="input-gold"
                          type="number" step="0.001" min="0"
                          value={ri.quantity}
                          onChange={e => updateIngredientRow(idx, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 text-xs text-executive-muted font-medium">{ing?.unit || '-'}</div>
                      <div className="col-span-1 flex justify-end">
                        <button onClick={() => removeIngredient(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gold-100 px-6 py-4 flex items-center justify-between bg-gray-50">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            className="btn-gold"
            onClick={() => {
              if (!form.name.trim()) return alert('Recipe name is required')
              onSave(form)
            }}
          >
            <Save size={16} /> Save Recipe
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RecipeBuilder() {
  const { recipes, ingredients, addRecipe, updateRecipe, deleteRecipe, calcRecipeCost } = useInventory()
  const [modal, setModal]   = useState(null) // null | 'new' | recipe obj
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')

  const filtered = recipes.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = filterCat === 'All' || r.category === filterCat
    return matchSearch && matchCat
  })

  const handleSave = (form) => {
    if (modal === 'new') {
      addRecipe(form)
    } else {
      updateRecipe(modal.id, form)
    }
    setModal(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="page-title">Recipe Builder</h1>
          <p className="page-subtitle">Map menu items to their ingredient compositions</p>
        </div>
        <button className="btn-gold" onClick={() => setModal('new')}>
          <Plus size={16} /> New Recipe
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-gold pl-9"
            placeholder="Search recipes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', ...CATEGORIES].map(c => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterCat === c
                  ? 'bg-gold-500 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-executive-muted hover:border-gold-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(recipe => {
          const cost   = calcRecipeCost(recipe)
          const margin = recipe.sellingPrice ? ((recipe.sellingPrice - cost) / recipe.sellingPrice * 100) : 0
          return (
            <div key={recipe.id} className="gold-card-hover p-5 flex flex-col gap-4">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="badge-gold text-[10px] mb-1">{recipe.category}</span>
                  <h3 className="font-serif font-semibold text-executive-dark text-lg leading-tight">{recipe.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal(recipe)} className="btn-ghost p-1.5">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => { if (confirm('Delete this recipe?')) deleteRecipe(recipe.id) }} className="btn-ghost p-1.5 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Ingredient List */}
              <div className="space-y-1.5">
                {recipe.ingredients.map((ri, i) => {
                  const ing = ingredients.find(ing => ing.id === ri.ingredientId)
                  return (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-executive-muted flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-gold-400 inline-block" />
                        {ing?.name || 'Unknown'}
                      </span>
                      <span className="font-medium text-executive-dark">{ri.quantity} {ing?.unit || ''}</span>
                    </div>
                  )
                })}
              </div>

              <div className="divider-gold" />

              {/* Financials */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-[10px] text-executive-muted uppercase tracking-wider">Cost</p>
                  <p className="font-bold text-executive-dark text-sm">${cost.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-executive-muted uppercase tracking-wider">Price</p>
                  <p className="font-bold text-executive-dark text-sm">${recipe.sellingPrice?.toFixed(2) || '—'}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-executive-muted uppercase tracking-wider">Margin</p>
                  <p className={`font-bold text-sm ${margin > 60 ? 'text-green-600' : margin > 40 ? 'text-amber-600' : 'text-red-600'}`}>
                    {margin.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        {/* Add New Card */}
        <button
          onClick={() => setModal('new')}
          className="gold-card border-2 border-dashed border-gold-200 p-5 flex flex-col items-center justify-center gap-3 min-h-[220px] hover:border-gold-400 hover:bg-gold-50 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center group-hover:bg-gold-200 transition-colors">
            <Plus size={22} className="text-gold-600" />
          </div>
          <p className="text-sm font-medium text-gold-600">Add New Recipe</p>
        </button>
      </div>

      {/* Modal */}
      {modal && (
        <RecipeModal
          recipe={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          ingredients={ingredients}
          calcRecipeCost={calcRecipeCost}
        />
      )}
    </div>
  )
}
