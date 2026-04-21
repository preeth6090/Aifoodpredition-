-- ============================================================
--  GoldStock — PostgreSQL Database Schema
--  Inventory & Food Cost Management System
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- STAFF
-- ============================================================
CREATE TABLE staff (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  role        VARCHAR(50) DEFAULT 'staff' CHECK (role IN ('admin','manager','staff')),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VENDORS
-- ============================================================
CREATE TABLE vendors (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(150) NOT NULL,
  email          VARCHAR(150),
  phone          VARCHAR(30),
  address        TEXT,
  category       VARCHAR(50),
  lead_time_days INT DEFAULT 2,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INGREDIENT CATEGORIES
-- ============================================================
CREATE TABLE ingredient_categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO ingredient_categories (name) VALUES
  ('Bakery'),('Meat'),('Produce'),('Dairy'),
  ('Beverages'),('Pantry'),('Condiments'),('Seafood'),('Other');

-- ============================================================
-- INGREDIENTS (Master Inventory)
-- ============================================================
CREATE TABLE ingredients (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  sku           VARCHAR(50) UNIQUE,
  category      VARCHAR(50) REFERENCES ingredient_categories(name),
  unit          VARCHAR(20) NOT NULL DEFAULT 'pcs',
  cost_per_unit NUMERIC(10,4) NOT NULL DEFAULT 0,
  par_level     NUMERIC(10,3) NOT NULL DEFAULT 0,
  current_stock NUMERIC(12,3) NOT NULL DEFAULT 0,
  vendor_id     INT REFERENCES vendors(id) ON DELETE SET NULL,
  allergen_info TEXT,
  storage_temp  VARCHAR(50),
  is_active     BOOLEAN DEFAULT TRUE,
  last_updated  DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ingredients_vendor ON ingredients(vendor_id);
CREATE INDEX idx_ingredients_category ON ingredients(category);

-- ============================================================
-- RECIPES (Menu Items)
-- ============================================================
CREATE TABLE recipes (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  category      VARCHAR(50) NOT NULL,
  selling_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe → Ingredient mapping
CREATE TABLE recipe_ingredients (
  id            SERIAL PRIMARY KEY,
  recipe_id     INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INT NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity      NUMERIC(12,4) NOT NULL,
  UNIQUE(recipe_id, ingredient_id)
);

CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);

-- ============================================================
-- SALES
-- ============================================================
CREATE TABLE sales (
  id         SERIAL PRIMARY KEY,
  recipe_id  INT NOT NULL REFERENCES recipes(id),
  quantity   INT NOT NULL DEFAULT 1,
  staff_id   INT REFERENCES staff(id),
  timestamp  TIMESTAMPTZ DEFAULT NOW(),
  notes      TEXT
);

CREATE INDEX idx_sales_recipe ON sales(recipe_id);
CREATE INDEX idx_sales_timestamp ON sales(timestamp);

-- ============================================================
-- STOCK DEPLETION LOG (audit trail from sales)
-- ============================================================
CREATE TABLE stock_depletion_log (
  id            SERIAL PRIMARY KEY,
  sale_id       INT REFERENCES sales(id) ON DELETE CASCADE,
  ingredient_id INT REFERENCES ingredients(id),
  quantity_used NUMERIC(12,4) NOT NULL,
  depleted_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_depletion_ingredient ON stock_depletion_log(ingredient_id);
CREATE INDEX idx_depletion_sale ON stock_depletion_log(sale_id);

-- ============================================================
-- STOCK COUNTS (Physical Inventory)
-- ============================================================
CREATE TABLE stock_counts (
  id           SERIAL PRIMARY KEY,
  count_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  counted_by   VARCHAR(100),
  staff_id     INT REFERENCES staff(id),
  signature    TEXT,  -- base64 PNG
  notes        TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock_count_items (
  id              SERIAL PRIMARY KEY,
  stock_count_id  INT NOT NULL REFERENCES stock_counts(id) ON DELETE CASCADE,
  ingredient_id   INT NOT NULL REFERENCES ingredients(id),
  physical_count  NUMERIC(12,3) NOT NULL,
  UNIQUE(stock_count_id, ingredient_id)
);

CREATE INDEX idx_stock_count_items_count ON stock_count_items(stock_count_id);

-- ============================================================
-- PURCHASE ORDERS
-- ============================================================
CREATE TABLE purchase_orders (
  id          VARCHAR(30) PRIMARY KEY,  -- e.g. PO-2026-001
  vendor_id   INT REFERENCES vendors(id),
  status      VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','pending','approved','received','rejected')),
  notes       TEXT,
  created_by  INT REFERENCES staff(id),
  created_at  DATE DEFAULT CURRENT_DATE,
  approved_at DATE,
  received_at DATE,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
  id           SERIAL PRIMARY KEY,
  po_id        VARCHAR(30) NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  ingredient_id INT NOT NULL REFERENCES ingredients(id),
  quantity     NUMERIC(10,3) NOT NULL,
  unit_cost    NUMERIC(10,4) NOT NULL,
  UNIQUE(po_id, ingredient_id)
);

CREATE INDEX idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_items_po ON purchase_order_items(po_id);

-- ============================================================
-- CUSTOM FIELDS (Admin Field Manager)
-- ============================================================
CREATE TABLE custom_fields (
  id           SERIAL PRIMARY KEY,
  table_name   VARCHAR(50) NOT NULL,
  field_name   VARCHAR(50) NOT NULL,
  label        VARCHAR(100) NOT NULL,
  field_type   VARCHAR(20) DEFAULT 'text' CHECK (field_type IN ('text','number','select','date','boolean','textarea')),
  is_mandatory BOOLEAN DEFAULT FALSE,
  is_visible   BOOLEAN DEFAULT TRUE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(table_name, field_name)
);

-- ============================================================
-- INVOICE SCANS
-- ============================================================
CREATE TABLE invoice_scans (
  id            SERIAL PRIMARY KEY,
  file_name     VARCHAR(255) NOT NULL,
  vendor_id     INT REFERENCES vendors(id),
  scan_date     DATE DEFAULT CURRENT_DATE,
  total_amount  NUMERIC(10,2),
  ocr_data      JSONB,
  ocr_confidence NUMERIC(5,2),
  status        VARCHAR(20) DEFAULT 'review' CHECK (status IN ('review','processed','rejected')),
  matched_po_id VARCHAR(30) REFERENCES purchase_orders(id),
  uploaded_by   INT REFERENCES staff(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VIEWS
-- ============================================================

-- Current stock with par level status
CREATE VIEW v_stock_status AS
SELECT
  i.id,
  i.name,
  i.sku,
  i.category,
  i.unit,
  i.current_stock,
  i.par_level,
  i.cost_per_unit,
  i.current_stock * i.cost_per_unit AS stock_value,
  CASE
    WHEN i.current_stock <= 0          THEN 'out_of_stock'
    WHEN i.current_stock <= i.par_level THEN 'below_par'
    WHEN i.current_stock <= i.par_level * 1.5 THEN 'low'
    ELSE 'ok'
  END AS stock_status,
  v.name AS vendor_name,
  v.email AS vendor_email,
  i.last_updated
FROM ingredients i
LEFT JOIN vendors v ON v.id = i.vendor_id
WHERE i.is_active = TRUE;

-- Theoretical stock (calculated from last count + sales depletions)
CREATE VIEW v_theoretical_stock AS
WITH last_counts AS (
  SELECT DISTINCT ON (sci.ingredient_id)
    sci.ingredient_id,
    sci.physical_count AS base_stock,
    sc.count_date AS base_date
  FROM stock_count_items sci
  JOIN stock_counts sc ON sc.id = sci.stock_count_id
  ORDER BY sci.ingredient_id, sc.count_date DESC
),
depletions_since_count AS (
  SELECT
    sdl.ingredient_id,
    SUM(sdl.quantity_used) AS total_used
  FROM stock_depletion_log sdl
  JOIN last_counts lc ON lc.ingredient_id = sdl.ingredient_id
  WHERE sdl.depleted_at > lc.base_date::TIMESTAMPTZ
  GROUP BY sdl.ingredient_id
)
SELECT
  i.id AS ingredient_id,
  i.name,
  i.unit,
  i.cost_per_unit,
  COALESCE(lc.base_stock, i.current_stock)   AS base_stock,
  COALESCE(d.total_used, 0)                   AS total_used,
  COALESCE(lc.base_stock, i.current_stock) - COALESCE(d.total_used, 0) AS theoretical_stock,
  i.current_stock                              AS physical_stock,
  (COALESCE(lc.base_stock, i.current_stock) - COALESCE(d.total_used, 0)) - i.current_stock AS variance_qty,
  CASE
    WHEN (COALESCE(lc.base_stock, i.current_stock) - COALESCE(d.total_used, 0)) > 0
    THEN ROUND(
      (((COALESCE(lc.base_stock, i.current_stock) - COALESCE(d.total_used, 0)) - i.current_stock)
       / (COALESCE(lc.base_stock, i.current_stock) - COALESCE(d.total_used, 0))) * 100, 2
    )
    ELSE 0
  END AS variance_pct,
  ABS(
    (COALESCE(lc.base_stock, i.current_stock) - COALESCE(d.total_used, 0)) - i.current_stock
  ) * i.cost_per_unit AS variance_cost
FROM ingredients i
LEFT JOIN last_counts lc ON lc.ingredient_id = i.id
LEFT JOIN depletions_since_count d ON d.ingredient_id = i.id
WHERE i.is_active = TRUE;

-- Daily sales summary
CREATE VIEW v_daily_sales AS
SELECT
  DATE(s.timestamp) AS sale_date,
  r.id AS recipe_id,
  r.name AS recipe_name,
  r.category,
  SUM(s.quantity) AS total_qty,
  SUM(s.quantity * r.selling_price) AS total_revenue
FROM sales s
JOIN recipes r ON r.id = s.recipe_id
GROUP BY DATE(s.timestamp), r.id, r.name, r.category;

-- Recipe cost view
CREATE VIEW v_recipe_cost AS
SELECT
  r.id,
  r.name,
  r.category,
  r.selling_price,
  SUM(ri.quantity * i.cost_per_unit) AS total_cost,
  r.selling_price - SUM(ri.quantity * i.cost_per_unit) AS gross_profit,
  CASE
    WHEN r.selling_price > 0
    THEN ROUND((1 - SUM(ri.quantity * i.cost_per_unit) / r.selling_price) * 100, 2)
    ELSE 0
  END AS gross_margin_pct
FROM recipes r
JOIN recipe_ingredients ri ON ri.recipe_id = r.id
JOIN ingredients i ON i.id = ri.ingredient_id
WHERE r.is_active = TRUE
GROUP BY r.id, r.name, r.category, r.selling_price;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ingredients_updated_at   BEFORE UPDATE ON ingredients   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_recipes_updated_at       BEFORE UPDATE ON recipes       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vendors_updated_at       BEFORE UPDATE ON vendors       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_purchase_orders_updated  BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger: Deplete stock when a sale is inserted
CREATE OR REPLACE FUNCTION deplete_stock_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  ri RECORD;
BEGIN
  -- For each ingredient in the recipe, deplete stock
  FOR ri IN
    SELECT ingredient_id, quantity
    FROM recipe_ingredients
    WHERE recipe_id = NEW.recipe_id
  LOOP
    -- Deduct from current_stock
    UPDATE ingredients
    SET current_stock = GREATEST(0, current_stock - (ri.quantity * NEW.quantity)),
        last_updated  = CURRENT_DATE
    WHERE id = ri.ingredient_id;

    -- Log the depletion
    INSERT INTO stock_depletion_log (sale_id, ingredient_id, quantity_used)
    VALUES (NEW.id, ri.ingredient_id, ri.quantity * NEW.quantity);
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deplete_on_sale
AFTER INSERT ON sales
FOR EACH ROW EXECUTE FUNCTION deplete_stock_on_sale();

-- Trigger: Update stock when PO is received
CREATE OR REPLACE FUNCTION restock_on_po_receive()
RETURNS TRIGGER AS $$
DECLARE
  poi RECORD;
BEGIN
  -- Only run when status changes to 'received'
  IF NEW.status = 'received' AND OLD.status != 'received' THEN
    FOR poi IN
      SELECT ingredient_id, quantity
      FROM purchase_order_items
      WHERE po_id = NEW.id
    LOOP
      UPDATE ingredients
      SET current_stock = current_stock + poi.quantity,
          last_updated  = CURRENT_DATE
      WHERE id = poi.ingredient_id;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_restock_on_po_receive
AFTER UPDATE ON purchase_orders
FOR EACH ROW EXECUTE FUNCTION restock_on_po_receive();

-- Trigger: Update ingredient stock when stock count is submitted
CREATE OR REPLACE FUNCTION reconcile_stock_on_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ingredients
  SET current_stock = NEW.physical_count,
      last_updated  = CURRENT_DATE
  WHERE id = NEW.ingredient_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reconcile_on_count
AFTER INSERT ON stock_count_items
FOR EACH ROW EXECUTE FUNCTION reconcile_stock_on_count();

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO staff (name, email, role) VALUES
  ('Admin Manager', 'admin@restaurant.com', 'admin'),
  ('Maria G.',      'maria@restaurant.com',  'manager'),
  ('James R.',      'james@restaurant.com',  'staff'),
  ('Sarah L.',      'sarah@restaurant.com',  'staff');

INSERT INTO vendors (name, email, phone, address, category, lead_time_days) VALUES
  ('Golden Bakery Co.',  'orders@goldenbakery.com', '+1-555-0101', '123 Baker St, NY',        'Bakery',    1),
  ('Prime Meats Ltd.',   'supply@primemeats.com',   '+1-555-0202', '456 Packing District, NY', 'Meat',      2),
  ('Fresh Farm Produce', 'orders@freshfarm.com',    '+1-555-0303', '789 Farm Road, NJ',        'Produce',   1),
  ('Dairy Direct',       'supply@dairydirect.com',  '+1-555-0404', '321 Dairy Lane, PA',       'Dairy',     2),
  ('Beverage World',     'orders@bevworld.com',     '+1-555-0505', '654 Drink Ave, NY',        'Beverages', 3),
  ('Pantry Plus',        'orders@pantryplus.com',   '+1-555-0606', '987 Kitchen St, CT',       'Pantry',    2);

INSERT INTO ingredients (name, sku, category, unit, cost_per_unit, par_level, current_stock, vendor_id) VALUES
  ('Burger Bun',      'BKR-001', 'Bakery',    'pcs',  0.5000,  50,  150, 1),
  ('Beef Patty',      'MT-001',  'Meat',      'pcs',  2.5000,  40,   80, 2),
  ('Lettuce',         'PRD-001', 'Produce',   'kg',   1.2000,   3,  5.2, 3),
  ('Tomato',          'PRD-002', 'Produce',   'kg',   0.8000,   4,  8.0, 3),
  ('Cheese Slice',    'DRY-001', 'Dairy',     'pcs',  0.3000,  60,  120, 4),
  ('Coca-Cola 330ml', 'BVG-001', 'Beverages', 'cans', 0.6000, 100,  200, 5),
  ('Potato (Fries)',  'PRD-003', 'Produce',   'kg',   0.4000,  15,   25, 3),
  ('Olive Oil',       'PNT-001', 'Pantry',    'L',    3.5000,   5,   10, 6),
  ('Chicken Breast',  'MT-002',  'Meat',      'kg',   4.2000,   8,   12, 2),
  ('French Mustard',  'CND-001', 'Condiments','L',    2.8000,   2,  3.5, 6);

INSERT INTO recipes (name, category, selling_price) VALUES
  ('Veg Burger',           'Burgers',   12.99),
  ('Classic Beef Burger',  'Burgers',   16.99),
  ('Crispy Fries',         'Sides',      4.99),
  ('Grilled Chicken Burger','Burgers',  15.99),
  ('Coca-Cola',            'Beverages',  2.99);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
  (1, 1, 1),  (1, 3, 0.02),  (1, 4, 0.03), (1, 5, 1),
  (2, 1, 1),  (2, 2, 1),     (2, 3, 0.02), (2, 4, 0.03), (2, 5, 2),
  (3, 7, 0.2),(3, 8, 0.05),
  (4, 1, 1),  (4, 9, 0.18),  (4, 3, 0.025),(4, 10, 0.02),
  (5, 6, 1);

INSERT INTO custom_fields (table_name, field_name, label, field_type, is_mandatory, is_visible) VALUES
  ('ingredients', 'sku',          'SKU Code',     'text',   TRUE,  TRUE),
  ('ingredients', 'category',     'Category',     'select', TRUE,  TRUE),
  ('ingredients', 'allergen_info','Allergen Info', 'text',   FALSE, TRUE),
  ('ingredients', 'storage_temp', 'Storage Temp', 'text',   FALSE, FALSE);
