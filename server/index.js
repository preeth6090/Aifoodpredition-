const express    = require('express')
const cors       = require('cors')
const { Pool }   = require('pg')
const nodemailer = require('nodemailer')
require('dotenv').config()

const app  = express()
const port = process.env.PORT || 5000

// ── DB Connection ────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// ── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ── Email Transport ──────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

async function sendPOEmail(vendor, po, items) {
  const itemRows = items.map(i =>
    `<tr><td>${i.ingredient_name}</td><td>${i.quantity}</td><td>${i.unit}</td><td>$${i.unit_cost}</td><td>$${(i.quantity * i.unit_cost).toFixed(2)}</td></tr>`
  ).join('')

  const total = items.reduce((s, i) => s + i.quantity * i.unit_cost, 0)

  await transporter.sendMail({
    from:    `"GoldStock System" <${process.env.SMTP_USER}>`,
    to:      vendor.email,
    subject: `Purchase Order ${po.id} — ${new Date().toLocaleDateString()}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; border: 2px solid #C9A84C; border-radius: 8px; overflow: hidden;">
        <div style="background: #1A2540; padding: 24px; text-align: center;">
          <h1 style="color: #C9A84C; margin: 0; font-size: 24px;">GoldStock</h1>
          <p style="color: #fff; margin: 4px 0 0; font-size: 12px;">Purchase Order Notification</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #1A2540;">Purchase Order: ${po.id}</h2>
          <p>Dear <strong>${vendor.name}</strong>,</p>
          <p>Please process the following purchase order at your earliest convenience.</p>
          <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
            <thead>
              <tr style="background: #1A2540; color: #C9A84C;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px;">Qty</th>
                <th style="padding: 8px;">Unit</th>
                <th style="padding: 8px;">Unit Cost</th>
                <th style="padding: 8px;">Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr style="background: #FDF8EC; font-weight: bold;">
                <td colspan="4" style="padding: 8px; text-align: right;">Order Total:</td>
                <td style="padding: 8px; color: #C9A84C;">$${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          ${po.notes ? `<p style="color: #666; font-size: 14px;"><em>Notes: ${po.notes}</em></p>` : ''}
          <p style="margin-top: 24px; font-size: 12px; color: #999;">
            This is an automated message from the GoldStock Inventory Management System.
          </p>
        </div>
      </div>
    `,
  })
}

// ── INGREDIENTS ──────────────────────────────────────────────
app.get('/api/ingredients', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, v.name as vendor_name FROM ingredients i
       LEFT JOIN vendors v ON v.id = i.vendor_id
       WHERE i.is_active = TRUE ORDER BY i.name`
    )
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/ingredients', async (req, res) => {
  const { name, sku, category, unit, cost_per_unit, par_level, current_stock, vendor_id } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO ingredients (name, sku, category, unit, cost_per_unit, par_level, current_stock, vendor_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, sku, category, unit, cost_per_unit, par_level, current_stock, vendor_id || null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.put('/api/ingredients/:id', async (req, res) => {
  const { name, sku, category, unit, cost_per_unit, par_level, current_stock, vendor_id } = req.body
  try {
    const result = await pool.query(
      `UPDATE ingredients SET name=$1, sku=$2, category=$3, unit=$4, cost_per_unit=$5,
       par_level=$6, current_stock=$7, vendor_id=$8, last_updated=CURRENT_DATE WHERE id=$9 RETURNING *`,
      [name, sku, category, unit, cost_per_unit, par_level, current_stock, vendor_id || null, req.params.id]
    )
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.delete('/api/ingredients/:id', async (req, res) => {
  try {
    await pool.query('UPDATE ingredients SET is_active=FALSE WHERE id=$1', [req.params.id])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── RECIPES ──────────────────────────────────────────────────
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await pool.query('SELECT * FROM recipes WHERE is_active=TRUE ORDER BY name')
    const ingredients = await pool.query(
      `SELECT ri.*, i.name as ingredient_name, i.unit, i.cost_per_unit
       FROM recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id`
    )
    const result = recipes.rows.map(r => ({
      ...r,
      ingredients: ingredients.rows.filter(i => i.recipe_id === r.id)
    }))
    res.json(result)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/recipes', async (req, res) => {
  const { name, category, selling_price, ingredients } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const r = await client.query(
      'INSERT INTO recipes (name, category, selling_price) VALUES ($1,$2,$3) RETURNING *',
      [name, category, selling_price]
    )
    const recipe = r.rows[0]
    for (const ing of ingredients) {
      await client.query(
        'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES ($1,$2,$3)',
        [recipe.id, ing.ingredientId, ing.quantity]
      )
    }
    await client.query('COMMIT')
    res.status(201).json(recipe)
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally { client.release() }
})

app.put('/api/recipes/:id', async (req, res) => {
  const { name, category, selling_price, ingredients } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(
      'UPDATE recipes SET name=$1, category=$2, selling_price=$3 WHERE id=$4',
      [name, category, selling_price, req.params.id]
    )
    await client.query('DELETE FROM recipe_ingredients WHERE recipe_id=$1', [req.params.id])
    for (const ing of ingredients) {
      await client.query(
        'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES ($1,$2,$3)',
        [req.params.id, ing.ingredientId, ing.quantity]
      )
    }
    await client.query('COMMIT')
    res.json({ success: true })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally { client.release() }
})

// ── SALES ────────────────────────────────────────────────────
app.post('/api/sales', async (req, res) => {
  const { recipe_id, quantity, staff_id, notes } = req.body
  try {
    // DB trigger handles stock depletion automatically
    const result = await pool.query(
      'INSERT INTO sales (recipe_id, quantity, staff_id, notes) VALUES ($1,$2,$3,$4) RETURNING *',
      [recipe_id, quantity, staff_id || null, notes || null]
    )

    // Check par levels after depletion
    const lowStock = await pool.query(
      'SELECT * FROM v_stock_status WHERE stock_status IN (\'below_par\',\'out_of_stock\')'
    )

    res.status(201).json({ sale: result.rows[0], lowStockAlerts: lowStock.rows })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/sales', async (req, res) => {
  const { date } = req.query
  try {
    const query = date
      ? `SELECT s.*, r.name as recipe_name, r.selling_price, st.name as staff_name
         FROM sales s JOIN recipes r ON r.id=s.recipe_id LEFT JOIN staff st ON st.id=s.staff_id
         WHERE DATE(s.timestamp) = $1 ORDER BY s.timestamp DESC`
      : `SELECT s.*, r.name as recipe_name, r.selling_price, st.name as staff_name
         FROM sales s JOIN recipes r ON r.id=s.recipe_id LEFT JOIN staff st ON st.id=s.staff_id
         ORDER BY s.timestamp DESC LIMIT 200`
    const result = await pool.query(query, date ? [date] : [])
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── VENDORS ──────────────────────────────────────────────────
app.get('/api/vendors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vendors WHERE is_active=TRUE ORDER BY name')
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/vendors', async (req, res) => {
  const { name, email, phone, address, category, lead_time_days } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO vendors (name, email, phone, address, category, lead_time_days) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, email, phone, address, category, lead_time_days || 2]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── PURCHASE ORDERS ──────────────────────────────────────────
app.get('/api/purchase-orders', async (req, res) => {
  try {
    const pos = await pool.query(
      'SELECT po.*, v.name as vendor_name, v.email as vendor_email FROM purchase_orders po LEFT JOIN vendors v ON v.id=po.vendor_id ORDER BY po.created_at DESC'
    )
    const items = await pool.query(
      `SELECT poi.*, i.name as ingredient_name, i.unit FROM purchase_order_items poi JOIN ingredients i ON i.id=poi.ingredient_id`
    )
    const result = pos.rows.map(po => ({
      ...po,
      items: items.rows.filter(i => i.po_id === po.id)
    }))
    res.json(result)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/purchase-orders', async (req, res) => {
  const { vendor_id, items, notes, status } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const poId = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
    await client.query(
      'INSERT INTO purchase_orders (id, vendor_id, status, notes) VALUES ($1,$2,$3,$4)',
      [poId, vendor_id, status || 'pending', notes || null]
    )
    for (const item of items) {
      await client.query(
        'INSERT INTO purchase_order_items (po_id, ingredient_id, quantity, unit_cost) VALUES ($1,$2,$3,$4)',
        [poId, item.ingredientId, item.quantity, item.unitCost]
      )
    }
    await client.query('COMMIT')
    res.status(201).json({ id: poId })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally { client.release() }
})

app.put('/api/purchase-orders/:id/approve', async (req, res) => {
  try {
    await pool.query(
      "UPDATE purchase_orders SET status='approved', approved_at=CURRENT_DATE WHERE id=$1",
      [req.params.id]
    )

    // Send email to vendor
    const poResult = await pool.query(
      'SELECT po.*, v.name as vendor_name, v.email as vendor_email FROM purchase_orders po JOIN vendors v ON v.id=po.vendor_id WHERE po.id=$1',
      [req.params.id]
    )
    const po = poResult.rows[0]

    const itemsResult = await pool.query(
      `SELECT poi.*, i.name as ingredient_name, i.unit FROM purchase_order_items poi
       JOIN ingredients i ON i.id=poi.ingredient_id WHERE poi.po_id=$1`,
      [req.params.id]
    )

    if (po && po.vendor_email && process.env.SMTP_USER) {
      try {
        await sendPOEmail({ name: po.vendor_name, email: po.vendor_email }, po, itemsResult.rows)
      } catch (emailErr) {
        console.error('Email failed:', emailErr.message)
      }
    }

    res.json({ success: true, emailSent: !!po?.vendor_email })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.put('/api/purchase-orders/:id/receive', async (req, res) => {
  try {
    // DB trigger handles restocking automatically
    await pool.query(
      "UPDATE purchase_orders SET status='received', received_at=CURRENT_DATE WHERE id=$1",
      [req.params.id]
    )
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── STOCK COUNTS ─────────────────────────────────────────────
app.get('/api/stock-counts', async (req, res) => {
  try {
    const counts = await pool.query('SELECT * FROM stock_counts ORDER BY count_date DESC LIMIT 30')
    const items  = await pool.query(
      `SELECT sci.*, i.name as ingredient_name, i.unit FROM stock_count_items sci
       JOIN ingredients i ON i.id=sci.ingredient_id`
    )
    const result = counts.rows.map(c => ({
      ...c,
      items: items.rows.filter(i => i.stock_count_id === c.id)
    }))
    res.json(result)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/stock-counts', async (req, res) => {
  const { counted_by, staff_id, signature, notes, items } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const sc = await client.query(
      'INSERT INTO stock_counts (counted_by, staff_id, signature, notes) VALUES ($1,$2,$3,$4) RETURNING *',
      [counted_by, staff_id || null, signature || null, notes || null]
    )
    const countId = sc.rows[0].id
    for (const item of items) {
      await client.query(
        'INSERT INTO stock_count_items (stock_count_id, ingredient_id, physical_count) VALUES ($1,$2,$3)',
        [countId, item.ingredientId, item.physicalCount]
      )
    }
    await client.query('COMMIT')
    res.status(201).json(sc.rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally { client.release() }
})

// ── VARIANCE ─────────────────────────────────────────────────
app.get('/api/variance', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM v_theoretical_stock ORDER BY variance_cost DESC')
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── DASHBOARD ────────────────────────────────────────────────
app.get('/api/dashboard', async (req, res) => {
  try {
    const [stockValue, lowStock, todaySales, foodCost, variance] = await Promise.all([
      pool.query('SELECT SUM(current_stock * cost_per_unit) as total FROM ingredients WHERE is_active=TRUE'),
      pool.query("SELECT COUNT(*) as count FROM v_stock_status WHERE stock_status IN ('below_par','out_of_stock')"),
      pool.query("SELECT SUM(quantity * selling_price) as revenue, COUNT(*) as transactions FROM sales s JOIN recipes r ON r.id=s.recipe_id WHERE DATE(s.timestamp)=CURRENT_DATE"),
      pool.query(`SELECT SUM(s.quantity * ri.quantity * i.cost_per_unit) as cost, SUM(s.quantity * r.selling_price) as revenue
                  FROM sales s JOIN recipes r ON r.id=s.recipe_id JOIN recipe_ingredients ri ON ri.recipe_id=r.id
                  JOIN ingredients i ON i.id=ri.ingredient_id WHERE DATE(s.timestamp)=CURRENT_DATE`),
      pool.query("SELECT SUM(variance_cost) as total FROM v_theoretical_stock WHERE variance_qty > 0"),
    ])

    const todayRevenue = parseFloat(todaySales.rows[0].revenue || 0)
    const todayCost    = parseFloat(foodCost.rows[0].cost || 0)

    res.json({
      totalStockValue:    parseFloat(stockValue.rows[0].total || 0),
      itemsBelowPar:      parseInt(lowStock.rows[0].count || 0),
      todayRevenue,
      todayTransactions:  parseInt(todaySales.rows[0].transactions || 0),
      foodCostPct:        todayRevenue > 0 ? (todayCost / todayRevenue * 100) : 0,
      totalVarianceCost:  parseFloat(variance.rows[0].total || 0),
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── CUSTOM FIELDS ────────────────────────────────────────────
app.get('/api/custom-fields', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM custom_fields ORDER BY table_name, sort_order')
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/custom-fields', async (req, res) => {
  const { table_name, field_name, label, field_type, is_mandatory, is_visible } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO custom_fields (table_name, field_name, label, field_type, is_mandatory, is_visible) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [table_name, field_name, label, field_type, is_mandatory, is_visible]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.put('/api/custom-fields/:id', async (req, res) => {
  const { is_mandatory, is_visible, label, field_type } = req.body
  try {
    const result = await pool.query(
      'UPDATE custom_fields SET is_mandatory=$1, is_visible=$2, label=$3, field_type=$4 WHERE id=$5 RETURNING *',
      [is_mandatory, is_visible, label, field_type, req.params.id]
    )
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.delete('/api/custom-fields/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM custom_fields WHERE id=$1', [req.params.id])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── AUTOMATION: 24-hour stock count alert ────────────────────
// Run this as a cron job: node -e "require('./server').checkStaleStockCounts()"
async function checkStaleStockCounts() {
  const result = await pool.query(
    `SELECT i.name, i.last_updated
     FROM ingredients i
     WHERE i.last_updated < CURRENT_DATE - INTERVAL '1 day'
     AND i.is_active = TRUE`
  )
  if (result.rows.length > 0 && process.env.SMTP_USER) {
    const stale = result.rows.map(r => `${r.name} (last updated: ${r.last_updated})`).join('<br/>')
    await transporter.sendMail({
      from:    `"GoldStock Alert" <${process.env.SMTP_USER}>`,
      to:      process.env.ALERT_EMAIL || process.env.SMTP_USER,
      subject: `⚠️ Stock Count Overdue — ${result.rows.length} ingredient(s)`,
      html:    `<p>The following ingredients have not been updated in over 24 hours:</p><p>${stale}</p>`,
    })
    console.log(`Alert sent for ${result.rows.length} stale ingredient(s)`)
  }
}

// ── Health Check ─────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', db: 'connected', time: new Date() })
  } catch {
    res.status(500).json({ status: 'error', db: 'disconnected' })
  }
})

// ── Start ────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`\n🚀 GoldStock API running on http://localhost:${port}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
})

module.exports = { app, pool, checkStaleStockCounts }
