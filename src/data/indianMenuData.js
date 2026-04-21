// Pre-built Indian Restaurant Database — South Indian + North Indian
// All prices in INR. Edit & re-upload via Bulk Upload page.

export const TEMPLATE_INGREDIENTS = [
  // ─── SOUTH INDIAN BASE ───────────────────────────────────────────
  { name: 'Idly Rice (Parboiled)',     sku: 'SI-001', category: 'Pantry',     unit: 'kg',   costPerUnit: 45,  currentStock: 25,  parLevel: 10 },
  { name: 'Urad Dal (Split)',          sku: 'SI-002', category: 'Pantry',     unit: 'kg',   costPerUnit: 120, currentStock: 10,  parLevel: 4  },
  { name: 'Fenugreek Seeds',           sku: 'SI-003', category: 'Pantry',     unit: 'kg',   costPerUnit: 180, currentStock: 1,   parLevel: 0.5},
  { name: 'Rice Flour',                sku: 'SI-004', category: 'Pantry',     unit: 'kg',   costPerUnit: 40,  currentStock: 8,   parLevel: 3  },
  { name: 'Semolina / Rava',           sku: 'SI-005', category: 'Pantry',     unit: 'kg',   costPerUnit: 50,  currentStock: 6,   parLevel: 2  },
  { name: 'Poha (Flattened Rice)',     sku: 'SI-006', category: 'Pantry',     unit: 'kg',   costPerUnit: 55,  currentStock: 4,   parLevel: 1.5},
  { name: 'Toor Dal',                  sku: 'SI-007', category: 'Pantry',     unit: 'kg',   costPerUnit: 130, currentStock: 12,  parLevel: 5  },
  { name: 'Chana Dal',                 sku: 'SI-008', category: 'Pantry',     unit: 'kg',   costPerUnit: 115, currentStock: 5,   parLevel: 2  },
  { name: 'Tamarind',                  sku: 'SI-009', category: 'Pantry',     unit: 'kg',   costPerUnit: 180, currentStock: 3,   parLevel: 1  },
  { name: 'Fresh Coconut',             sku: 'SI-010', category: 'Produce',    unit: 'pcs',  costPerUnit: 30,  currentStock: 40,  parLevel: 15 },
  { name: 'Desiccated Coconut',        sku: 'SI-011', category: 'Pantry',     unit: 'kg',   costPerUnit: 120, currentStock: 2,   parLevel: 0.5},
  { name: 'Curry Leaves',              sku: 'SI-012', category: 'Produce',    unit: 'kg',   costPerUnit: 80,  currentStock: 1,   parLevel: 0.3},
  { name: 'Mustard Seeds',             sku: 'SI-013', category: 'Pantry',     unit: 'kg',   costPerUnit: 90,  currentStock: 1.5, parLevel: 0.5},
  { name: 'Asafoetida / Hing',         sku: 'SI-014', category: 'Pantry',     unit: 'kg',   costPerUnit: 1500,currentStock: 0.2, parLevel: 0.05},
  { name: 'Sambhar Masala Powder',     sku: 'SI-015', category: 'Pantry',     unit: 'kg',   costPerUnit: 350, currentStock: 2,   parLevel: 0.5},
  { name: 'Idly / Dosa Batter',        sku: 'SI-016', category: 'Pantry',     unit: 'L',    costPerUnit: 60,  currentStock: 20,  parLevel: 8  },
  { name: 'Green Chutney Paste',       sku: 'SI-017', category: 'Pantry',     unit: 'kg',   costPerUnit: 120, currentStock: 3,   parLevel: 1  },
  { name: 'Tomato (Ripe)',             sku: 'CM-001', category: 'Produce',    unit: 'kg',   costPerUnit: 40,  currentStock: 15,  parLevel: 5  },
  { name: 'Onion',                     sku: 'CM-002', category: 'Produce',    unit: 'kg',   costPerUnit: 30,  currentStock: 20,  parLevel: 8  },
  { name: 'Potato',                    sku: 'CM-003', category: 'Produce',    unit: 'kg',   costPerUnit: 30,  currentStock: 15,  parLevel: 5  },
  { name: 'Green Chilli',              sku: 'CM-004', category: 'Produce',    unit: 'kg',   costPerUnit: 80,  currentStock: 2,   parLevel: 0.5},
  { name: 'Ginger',                    sku: 'CM-005', category: 'Pantry',     unit: 'kg',   costPerUnit: 200, currentStock: 2,   parLevel: 0.5},
  { name: 'Garlic',                    sku: 'CM-006', category: 'Pantry',     unit: 'kg',   costPerUnit: 200, currentStock: 2,   parLevel: 0.5},
  { name: 'Coriander Leaves',          sku: 'CM-007', category: 'Produce',    unit: 'kg',   costPerUnit: 80,  currentStock: 2,   parLevel: 0.5},
  { name: 'Cooking Oil (Sunflower)',   sku: 'CM-008', category: 'Pantry',     unit: 'L',    costPerUnit: 180, currentStock: 20,  parLevel: 8  },
  { name: 'Ghee',                      sku: 'CM-009', category: 'Dairy',      unit: 'kg',   costPerUnit: 600, currentStock: 5,   parLevel: 2  },
  { name: 'Butter',                    sku: 'CM-010', category: 'Dairy',      unit: 'kg',   costPerUnit: 500, currentStock: 4,   parLevel: 1.5},
  { name: 'Milk',                      sku: 'CM-011', category: 'Dairy',      unit: 'L',    costPerUnit: 65,  currentStock: 15,  parLevel: 5  },
  { name: 'Salt',                      sku: 'CM-012', category: 'Pantry',     unit: 'kg',   costPerUnit: 20,  currentStock: 5,   parLevel: 2  },
  { name: 'Sugar',                     sku: 'CM-013', category: 'Pantry',     unit: 'kg',   costPerUnit: 45,  currentStock: 5,   parLevel: 2  },
  { name: 'Turmeric Powder',           sku: 'CM-014', category: 'Pantry',     unit: 'kg',   costPerUnit: 200, currentStock: 1,   parLevel: 0.3},
  { name: 'Red Chilli Powder',         sku: 'CM-015', category: 'Pantry',     unit: 'kg',   costPerUnit: 250, currentStock: 1.5, parLevel: 0.5},
  { name: 'Coriander Powder',          sku: 'CM-016', category: 'Pantry',     unit: 'kg',   costPerUnit: 200, currentStock: 1.5, parLevel: 0.5},
  { name: 'Cumin Seeds',               sku: 'CM-017', category: 'Pantry',     unit: 'kg',   costPerUnit: 300, currentStock: 1,   parLevel: 0.3},
  { name: 'Garam Masala',              sku: 'CM-018', category: 'Pantry',     unit: 'kg',   costPerUnit: 400, currentStock: 1,   parLevel: 0.3},
  { name: 'Cumin Powder',              sku: 'CM-019', category: 'Pantry',     unit: 'kg',   costPerUnit: 320, currentStock: 0.5, parLevel: 0.2},
  { name: 'Black Pepper',              sku: 'CM-020', category: 'Pantry',     unit: 'kg',   costPerUnit: 700, currentStock: 0.5, parLevel: 0.2},
  // ─── NORTH INDIAN BASE ───────────────────────────────────────────
  { name: 'Wheat Flour (Atta)',        sku: 'NI-001', category: 'Pantry',     unit: 'kg',   costPerUnit: 35,  currentStock: 30,  parLevel: 10 },
  { name: 'Maida (All-Purpose Flour)', sku: 'NI-002', category: 'Pantry',     unit: 'kg',   costPerUnit: 40,  currentStock: 15,  parLevel: 5  },
  { name: 'Besan (Gram Flour)',        sku: 'NI-003', category: 'Pantry',     unit: 'kg',   costPerUnit: 90,  currentStock: 5,   parLevel: 2  },
  { name: 'Paneer',                    sku: 'NI-004', category: 'Dairy',      unit: 'kg',   costPerUnit: 320, currentStock: 10,  parLevel: 4  },
  { name: 'Fresh Cream',               sku: 'NI-005', category: 'Dairy',      unit: 'L',    costPerUnit: 280, currentStock: 5,   parLevel: 2  },
  { name: 'Yoghurt / Curd',            sku: 'NI-006', category: 'Dairy',      unit: 'kg',   costPerUnit: 80,  currentStock: 5,   parLevel: 2  },
  { name: 'Chicken (Boneless)',        sku: 'NI-007', category: 'Meat',       unit: 'kg',   costPerUnit: 320, currentStock: 20,  parLevel: 8  },
  { name: 'Chicken (Bone-in)',         sku: 'NI-008', category: 'Meat',       unit: 'kg',   costPerUnit: 240, currentStock: 15,  parLevel: 6  },
  { name: 'Mutton (Bone-in)',          sku: 'NI-009', category: 'Meat',       unit: 'kg',   costPerUnit: 750, currentStock: 10,  parLevel: 4  },
  { name: 'Cashews',                   sku: 'NI-010', category: 'Pantry',     unit: 'kg',   costPerUnit: 800, currentStock: 2,   parLevel: 0.5},
  { name: 'Tomato Puree',              sku: 'NI-011', category: 'Pantry',     unit: 'kg',   costPerUnit: 90,  currentStock: 5,   parLevel: 2  },
  { name: 'Rajma (Kidney Beans)',      sku: 'NI-012', category: 'Pantry',     unit: 'kg',   costPerUnit: 130, currentStock: 5,   parLevel: 2  },
  { name: 'Kabuli Chana (Chickpeas)',  sku: 'NI-013', category: 'Pantry',     unit: 'kg',   costPerUnit: 120, currentStock: 5,   parLevel: 2  },
  { name: 'Black Urad Dal (Whole)',    sku: 'NI-014', category: 'Pantry',     unit: 'kg',   costPerUnit: 140, currentStock: 5,   parLevel: 2  },
  { name: 'Moong Dal (Split)',         sku: 'NI-015', category: 'Pantry',     unit: 'kg',   costPerUnit: 110, currentStock: 4,   parLevel: 1.5},
  { name: 'Basmati Rice',             sku: 'NI-016', category: 'Pantry',     unit: 'kg',   costPerUnit: 120, currentStock: 20,  parLevel: 8  },
  { name: 'Cardamom (Elaichi)',        sku: 'NI-017', category: 'Pantry',     unit: 'kg',   costPerUnit: 2500,currentStock: 0.2, parLevel: 0.05},
  { name: 'Bay Leaf (Tej Patta)',      sku: 'NI-018', category: 'Pantry',     unit: 'kg',   costPerUnit: 400, currentStock: 0.3, parLevel: 0.1},
  { name: 'Cinnamon (Dalchini)',       sku: 'NI-019', category: 'Pantry',     unit: 'kg',   costPerUnit: 600, currentStock: 0.3, parLevel: 0.1},
  { name: 'Cloves (Laung)',            sku: 'NI-020', category: 'Pantry',     unit: 'kg',   costPerUnit: 700, currentStock: 0.2, parLevel: 0.05},
  { name: 'Kasuri Methi',             sku: 'NI-021', category: 'Pantry',     unit: 'kg',   costPerUnit: 350, currentStock: 0.5, parLevel: 0.1},
  { name: 'Biryani Masala',           sku: 'NI-022', category: 'Pantry',     unit: 'kg',   costPerUnit: 450, currentStock: 1,   parLevel: 0.3},
  { name: 'Tandoori Masala',          sku: 'NI-023', category: 'Pantry',     unit: 'kg',   costPerUnit: 380, currentStock: 1,   parLevel: 0.3},
  { name: 'Saffron (Kesar)',          sku: 'NI-024', category: 'Pantry',     unit: 'g',    costPerUnit: 5,   currentStock: 10,  parLevel: 3  },
  { name: 'Spinach / Palak',          sku: 'NI-025', category: 'Produce',    unit: 'kg',   costPerUnit: 30,  currentStock: 5,   parLevel: 2  },
  { name: 'Peas (Matar)',             sku: 'NI-026', category: 'Produce',    unit: 'kg',   costPerUnit: 50,  currentStock: 5,   parLevel: 2  },
  { name: 'Cauliflower (Gobi)',       sku: 'NI-027', category: 'Produce',    unit: 'kg',   costPerUnit: 35,  currentStock: 5,   parLevel: 2  },
  { name: 'Mushroom',                 sku: 'NI-028', category: 'Produce',    unit: 'kg',   costPerUnit: 200, currentStock: 3,   parLevel: 1  },
  { name: 'Capsicum / Bell Pepper',  sku: 'NI-029', category: 'Produce',    unit: 'kg',   costPerUnit: 80,  currentStock: 3,   parLevel: 1  },
  { name: 'Lemon',                    sku: 'NI-030', category: 'Produce',    unit: 'pcs',  costPerUnit: 5,   currentStock: 50,  parLevel: 20 },
  // ─── BEVERAGES ───────────────────────────────────────────────────
  { name: 'Tea Powder (CTC)',         sku: 'BV-001', category: 'Beverages',  unit: 'kg',   costPerUnit: 300, currentStock: 2,   parLevel: 0.5},
  { name: 'Coffee Powder',            sku: 'BV-002', category: 'Beverages',  unit: 'kg',   costPerUnit: 500, currentStock: 1,   parLevel: 0.3},
  { name: 'Coca-Cola (300ml)',        sku: 'BV-003', category: 'Beverages',  unit: 'pcs',  costPerUnit: 30,  currentStock: 100, parLevel: 30 },
  { name: 'Mango Pulp (Canned)',      sku: 'BV-004', category: 'Beverages',  unit: 'kg',   costPerUnit: 120, currentStock: 5,   parLevel: 2  },
  { name: 'Rose Syrup',               sku: 'BV-005', category: 'Beverages',  unit: 'L',    costPerUnit: 150, currentStock: 2,   parLevel: 0.5},
]

export const TEMPLATE_RECIPES = [
  // ═══════════════════════════════════════════════════════════════
  //  SOUTH INDIAN
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Plain Idly (2 pcs)',
    category: 'South Indian',
    sellingPrice: 60,
    ingredients: [
      { name: 'Idly / Dosa Batter',    quantity: 0.15, unit: 'L'  },
      { name: 'Ghee',                  quantity: 0.01, unit: 'kg' },
      { name: 'Salt',                  quantity: 0.003,unit: 'kg' },
    ],
  },
  {
    name: 'Plain Dosa',
    category: 'South Indian',
    sellingPrice: 80,
    ingredients: [
      { name: 'Idly / Dosa Batter',    quantity: 0.2,  unit: 'L'  },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.01, unit: 'L'  },
      { name: 'Salt',                  quantity: 0.003,unit: 'kg' },
    ],
  },
  {
    name: 'Masala Dosa',
    category: 'South Indian',
    sellingPrice: 120,
    ingredients: [
      { name: 'Idly / Dosa Batter',    quantity: 0.2,  unit: 'L'  },
      { name: 'Potato',                quantity: 0.1,  unit: 'kg' },
      { name: 'Onion',                 quantity: 0.05, unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.015,unit: 'L'  },
      { name: 'Mustard Seeds',         quantity: 0.002,unit: 'kg' },
      { name: 'Curry Leaves',          quantity: 0.005,unit: 'kg' },
      { name: 'Turmeric Powder',       quantity: 0.002,unit: 'kg' },
      { name: 'Green Chilli',          quantity: 0.01, unit: 'kg' },
      { name: 'Ghee',                  quantity: 0.01, unit: 'kg' },
    ],
  },
  {
    name: 'Rava Dosa',
    category: 'South Indian',
    sellingPrice: 110,
    ingredients: [
      { name: 'Semolina / Rava',       quantity: 0.08, unit: 'kg' },
      { name: 'Rice Flour',            quantity: 0.04, unit: 'kg' },
      { name: 'Maida (All-Purpose Flour)',quantity:0.02,unit: 'kg'},
      { name: 'Onion',                 quantity: 0.03, unit: 'kg' },
      { name: 'Green Chilli',          quantity: 0.005,unit: 'kg' },
      { name: 'Coriander Leaves',      quantity: 0.01, unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.015,unit: 'L'  },
      { name: 'Ghee',                  quantity: 0.01, unit: 'kg' },
    ],
  },
  {
    name: 'Onion Uttapam',
    category: 'South Indian',
    sellingPrice: 90,
    ingredients: [
      { name: 'Idly / Dosa Batter',    quantity: 0.25, unit: 'L'  },
      { name: 'Onion',                 quantity: 0.05, unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.03, unit: 'kg' },
      { name: 'Green Chilli',          quantity: 0.005,unit: 'kg' },
      { name: 'Coriander Leaves',      quantity: 0.01, unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.015,unit: 'L'  },
    ],
  },
  {
    name: 'Medu Vada (2 pcs)',
    category: 'South Indian',
    sellingPrice: 70,
    ingredients: [
      { name: 'Urad Dal (Split)',      quantity: 0.08, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.03, unit: 'kg' },
      { name: 'Green Chilli',          quantity: 0.005,unit: 'kg' },
      { name: 'Curry Leaves',          quantity: 0.003,unit: 'kg' },
      { name: 'Ginger',                quantity: 0.005,unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.05, unit: 'L'  },
      { name: 'Salt',                  quantity: 0.003,unit: 'kg' },
    ],
  },
  {
    name: 'Ven Pongal',
    category: 'South Indian',
    sellingPrice: 80,
    ingredients: [
      { name: 'Idly Rice (Parboiled)', quantity: 0.1,  unit: 'kg' },
      { name: 'Moong Dal (Split)',     quantity: 0.04, unit: 'kg' },
      { name: 'Ghee',                  quantity: 0.02, unit: 'kg' },
      { name: 'Cumin Seeds',           quantity: 0.003,unit: 'kg' },
      { name: 'Black Pepper',          quantity: 0.003,unit: 'kg' },
      { name: 'Curry Leaves',          quantity: 0.003,unit: 'kg' },
      { name: 'Ginger',                quantity: 0.005,unit: 'kg' },
      { name: 'Cashews',               quantity: 0.01, unit: 'kg' },
      { name: 'Salt',                  quantity: 0.003,unit: 'kg' },
    ],
  },
  {
    name: 'Upma',
    category: 'South Indian',
    sellingPrice: 60,
    ingredients: [
      { name: 'Semolina / Rava',       quantity: 0.1,  unit: 'kg' },
      { name: 'Onion',                 quantity: 0.05, unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.03, unit: 'kg' },
      { name: 'Green Chilli',          quantity: 0.005,unit: 'kg' },
      { name: 'Mustard Seeds',         quantity: 0.002,unit: 'kg' },
      { name: 'Curry Leaves',          quantity: 0.003,unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.02, unit: 'L'  },
      { name: 'Salt',                  quantity: 0.003,unit: 'kg' },
    ],
  },
  {
    name: 'Sambar',
    category: 'South Indian',
    sellingPrice: 40,
    ingredients: [
      { name: 'Toor Dal',              quantity: 0.08, unit: 'kg' },
      { name: 'Tamarind',              quantity: 0.01, unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.05, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.04, unit: 'kg' },
      { name: 'Sambhar Masala Powder', quantity: 0.01, unit: 'kg' },
      { name: 'Turmeric Powder',       quantity: 0.002,unit: 'kg' },
      { name: 'Mustard Seeds',         quantity: 0.002,unit: 'kg' },
      { name: 'Curry Leaves',          quantity: 0.003,unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.01, unit: 'L'  },
    ],
  },
  {
    name: 'Coconut Chutney',
    category: 'South Indian',
    sellingPrice: 30,
    ingredients: [
      { name: 'Fresh Coconut',         quantity: 0.5,  unit: 'pcs'},
      { name: 'Green Chilli',          quantity: 0.01, unit: 'kg' },
      { name: 'Ginger',                quantity: 0.005,unit: 'kg' },
      { name: 'Mustard Seeds',         quantity: 0.002,unit: 'kg' },
      { name: 'Curry Leaves',          quantity: 0.003,unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.005,unit: 'L'  },
    ],
  },
  {
    name: 'Set Dosa (3 pcs)',
    category: 'South Indian',
    sellingPrice: 90,
    ingredients: [
      { name: 'Idly / Dosa Batter',    quantity: 0.3,  unit: 'L'  },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.02, unit: 'L'  },
      { name: 'Ghee',                  quantity: 0.015,unit: 'kg' },
    ],
  },
  {
    name: 'Bisi Bele Bath',
    category: 'South Indian',
    sellingPrice: 130,
    ingredients: [
      { name: 'Idly Rice (Parboiled)', quantity: 0.1,  unit: 'kg' },
      { name: 'Toor Dal',              quantity: 0.06, unit: 'kg' },
      { name: 'Tamarind',              quantity: 0.01, unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.04, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.04, unit: 'kg' },
      { name: 'Sambhar Masala Powder', quantity: 0.015,unit: 'kg' },
      { name: 'Ghee',                  quantity: 0.02, unit: 'kg' },
      { name: 'Cashews',               quantity: 0.01, unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.01, unit: 'L'  },
    ],
  },
  {
    name: 'Filter Coffee',
    category: 'Beverages',
    sellingPrice: 40,
    ingredients: [
      { name: 'Coffee Powder',         quantity: 0.015,unit: 'kg' },
      { name: 'Milk',                  quantity: 0.15, unit: 'L'  },
      { name: 'Sugar',                 quantity: 0.01, unit: 'kg' },
    ],
  },
  // ═══════════════════════════════════════════════════════════════
  //  NORTH INDIAN — BREADS
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Tandoori Roti',
    category: 'North Indian Breads',
    sellingPrice: 30,
    ingredients: [
      { name: 'Wheat Flour (Atta)',    quantity: 0.08, unit: 'kg' },
      { name: 'Ghee',                  quantity: 0.005,unit: 'kg' },
      { name: 'Salt',                  quantity: 0.001,unit: 'kg' },
    ],
  },
  {
    name: 'Butter Naan',
    category: 'North Indian Breads',
    sellingPrice: 55,
    ingredients: [
      { name: 'Maida (All-Purpose Flour)',quantity:0.08,unit: 'kg'},
      { name: 'Yoghurt / Curd',        quantity: 0.02, unit: 'kg' },
      { name: 'Butter',                quantity: 0.015,unit: 'kg' },
      { name: 'Salt',                  quantity: 0.001,unit: 'kg' },
      { name: 'Sugar',                 quantity: 0.002,unit: 'kg' },
    ],
  },
  {
    name: 'Garlic Naan',
    category: 'North Indian Breads',
    sellingPrice: 65,
    ingredients: [
      { name: 'Maida (All-Purpose Flour)',quantity:0.08,unit: 'kg'},
      { name: 'Yoghurt / Curd',        quantity: 0.02, unit: 'kg' },
      { name: 'Butter',                quantity: 0.015,unit: 'kg' },
      { name: 'Garlic',                quantity: 0.01, unit: 'kg' },
      { name: 'Coriander Leaves',      quantity: 0.005,unit: 'kg' },
      { name: 'Salt',                  quantity: 0.001,unit: 'kg' },
    ],
  },
  {
    name: 'Aloo Paratha',
    category: 'North Indian Breads',
    sellingPrice: 80,
    ingredients: [
      { name: 'Wheat Flour (Atta)',    quantity: 0.1,  unit: 'kg' },
      { name: 'Potato',               quantity: 0.1,  unit: 'kg' },
      { name: 'Green Chilli',          quantity: 0.005,unit: 'kg' },
      { name: 'Ginger',                quantity: 0.005,unit: 'kg' },
      { name: 'Coriander Leaves',      quantity: 0.01, unit: 'kg' },
      { name: 'Cumin Seeds',           quantity: 0.002,unit: 'kg' },
      { name: 'Ghee',                  quantity: 0.015,unit: 'kg' },
    ],
  },
  {
    name: 'Puri (4 pcs)',
    category: 'North Indian Breads',
    sellingPrice: 50,
    ingredients: [
      { name: 'Wheat Flour (Atta)',    quantity: 0.1,  unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.08, unit: 'L'  },
      { name: 'Salt',                  quantity: 0.002,unit: 'kg' },
    ],
  },
  // ═══════════════════════════════════════════════════════════════
  //  NORTH INDIAN — VEG GRAVIES
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Paneer Butter Masala',
    category: 'North Indian Gravies',
    sellingPrice: 220,
    ingredients: [
      { name: 'Paneer',                quantity: 0.15, unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.15, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.08, unit: 'kg' },
      { name: 'Fresh Cream',           quantity: 0.05, unit: 'L'  },
      { name: 'Butter',                quantity: 0.03, unit: 'kg' },
      { name: 'Cashews',               quantity: 0.02, unit: 'kg' },
      { name: 'Ginger',                quantity: 0.01, unit: 'kg' },
      { name: 'Garlic',                quantity: 0.01, unit: 'kg' },
      { name: 'Red Chilli Powder',     quantity: 0.005,unit: 'kg' },
      { name: 'Garam Masala',          quantity: 0.003,unit: 'kg' },
      { name: 'Kasuri Methi',         quantity: 0.002,unit: 'kg' },
      { name: 'Sugar',                 quantity: 0.005,unit: 'kg' },
    ],
  },
  {
    name: 'Palak Paneer',
    category: 'North Indian Gravies',
    sellingPrice: 200,
    ingredients: [
      { name: 'Paneer',                quantity: 0.15, unit: 'kg' },
      { name: 'Spinach / Palak',       quantity: 0.2,  unit: 'kg' },
      { name: 'Onion',                 quantity: 0.06, unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.06, unit: 'kg' },
      { name: 'Fresh Cream',           quantity: 0.03, unit: 'L'  },
      { name: 'Ginger',                quantity: 0.01, unit: 'kg' },
      { name: 'Garlic',                quantity: 0.01, unit: 'kg' },
      { name: 'Green Chilli',          quantity: 0.005,unit: 'kg' },
      { name: 'Ghee',                  quantity: 0.02, unit: 'kg' },
      { name: 'Garam Masala',          quantity: 0.003,unit: 'kg' },
    ],
  },
  {
    name: 'Shahi Paneer',
    category: 'North Indian Gravies',
    sellingPrice: 240,
    ingredients: [
      { name: 'Paneer',                quantity: 0.15, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.1,  unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.08, unit: 'kg' },
      { name: 'Fresh Cream',           quantity: 0.07, unit: 'L'  },
      { name: 'Milk',                  quantity: 0.05, unit: 'L'  },
      { name: 'Cashews',               quantity: 0.03, unit: 'kg' },
      { name: 'Butter',                quantity: 0.02, unit: 'kg' },
      { name: 'Cardamom (Elaichi)',    quantity: 0.002,unit: 'kg' },
      { name: 'Garam Masala',          quantity: 0.003,unit: 'kg' },
      { name: 'Saffron (Kesar)',       quantity: 0.1,  unit: 'g'  },
    ],
  },
  {
    name: 'Kadai Paneer',
    category: 'North Indian Gravies',
    sellingPrice: 210,
    ingredients: [
      { name: 'Paneer',                quantity: 0.15, unit: 'kg' },
      { name: 'Capsicum / Bell Pepper',quantity: 0.08, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.08, unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.1,  unit: 'kg' },
      { name: 'Ginger',                quantity: 0.01, unit: 'kg' },
      { name: 'Garlic',                quantity: 0.01, unit: 'kg' },
      { name: 'Red Chilli Powder',     quantity: 0.008,unit: 'kg' },
      { name: 'Coriander Powder',      quantity: 0.005,unit: 'kg' },
      { name: 'Garam Masala',          quantity: 0.003,unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.03, unit: 'L'  },
    ],
  },
  {
    name: 'Matar Paneer',
    category: 'North Indian Gravies',
    sellingPrice: 190,
    ingredients: [
      { name: 'Paneer',                quantity: 0.1,  unit: 'kg' },
      { name: 'Peas (Matar)',          quantity: 0.1,  unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.1,  unit: 'kg' },
      { name: 'Onion',                 quantity: 0.07, unit: 'kg' },
      { name: 'Ginger',                quantity: 0.008,unit: 'kg' },
      { name: 'Garlic',                quantity: 0.008,unit: 'kg' },
      { name: 'Red Chilli Powder',     quantity: 0.005,unit: 'kg' },
      { name: 'Coriander Powder',      quantity: 0.005,unit: 'kg' },
      { name: 'Garam Masala',          quantity: 0.003,unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.025,unit: 'L'  },
    ],
  },
  {
    name: 'Dal Makhani',
    category: 'North Indian Gravies',
    sellingPrice: 180,
    ingredients: [
      { name: 'Black Urad Dal (Whole)', quantity: 0.1, unit: 'kg' },
      { name: 'Rajma (Kidney Beans)',  quantity: 0.02, unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.08, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.06, unit: 'kg' },
      { name: 'Butter',                quantity: 0.03, unit: 'kg' },
      { name: 'Fresh Cream',           quantity: 0.04, unit: 'L'  },
      { name: 'Ginger',                quantity: 0.01, unit: 'kg' },
      { name: 'Garlic',                quantity: 0.01, unit: 'kg' },
      { name: 'Red Chilli Powder',     quantity: 0.005,unit: 'kg' },
      { name: 'Garam Masala',          quantity: 0.003,unit: 'kg' },
      { name: 'Kasuri Methi',         quantity: 0.002,unit: 'kg' },
    ],
  },
  {
    name: 'Dal Tadka',
    category: 'North Indian Gravies',
    sellingPrice: 150,
    ingredients: [
      { name: 'Toor Dal',              quantity: 0.1,  unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.06, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.05, unit: 'kg' },
      { name: 'Ghee',                  quantity: 0.02, unit: 'kg' },
      { name: 'Cumin Seeds',           quantity: 0.003,unit: 'kg' },
      { name: 'Garlic',                quantity: 0.01, unit: 'kg' },
      { name: 'Red Chilli Powder',     quantity: 0.005,unit: 'kg' },
      { name: 'Turmeric Powder',       quantity: 0.002,unit: 'kg' },
      { name: 'Coriander Leaves',      quantity: 0.01, unit: 'kg' },
    ],
  },
  {
    name: 'Chole Masala',
    category: 'North Indian Gravies',
    sellingPrice: 160,
    ingredients: [
      { name: 'Kabuli Chana (Chickpeas)', quantity: 0.12, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.1,  unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.1,  unit: 'kg' },
      { name: 'Ginger',                quantity: 0.01, unit: 'kg' },
      { name: 'Garlic',                quantity: 0.01, unit: 'kg' },
      { name: 'Red Chilli Powder',     quantity: 0.008,unit: 'kg' },
      { name: 'Coriander Powder',      quantity: 0.005,unit: 'kg' },
      { name: 'Garam Masala',          quantity: 0.005,unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.025,unit: 'L'  },
      { name: 'Coriander Leaves',      quantity: 0.01, unit: 'kg' },
    ],
  },
  {
    name: 'Rajma Masala',
    category: 'North Indian Gravies',
    sellingPrice: 160,
    ingredients: [
      { name: 'Rajma (Kidney Beans)',  quantity: 0.12, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.1,  unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.1,  unit: 'kg' },
      { name: 'Ginger',                quantity: 0.01, unit: 'kg' },
      { name: 'Garlic',                quantity: 0.01, unit: 'kg' },
      { name: 'Red Chilli Powder',     quantity: 0.005,unit: 'kg' },
      { name: 'Coriander Powder',      quantity: 0.005,unit: 'kg' },
      { name: 'Garam Masala',          quantity: 0.003,unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.025,unit: 'L'  },
    ],
  },
  {
    name: 'Aloo Gobi',
    category: 'North Indian Gravies',
    sellingPrice: 150,
    ingredients: [
      { name: 'Potato',               quantity: 0.15, unit: 'kg' },
      { name: 'Cauliflower (Gobi)',    quantity: 0.15, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.06, unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.06, unit: 'kg' },
      { name: 'Turmeric Powder',       quantity: 0.002,unit: 'kg' },
      { name: 'Red Chilli Powder',     quantity: 0.005,unit: 'kg' },
      { name: 'Coriander Powder',      quantity: 0.005,unit: 'kg' },
      { name: 'Garam Masala',          quantity: 0.003,unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.025,unit: 'L'  },
    ],
  },
  {
    name: 'Mixed Veg Curry',
    category: 'North Indian Gravies',
    sellingPrice: 160,
    ingredients: [
      { name: 'Potato',               quantity: 0.07, unit: 'kg' },
      { name: 'Cauliflower (Gobi)',    quantity: 0.07, unit: 'kg' },
      { name: 'Peas (Matar)',          quantity: 0.05, unit: 'kg' },
      { name: 'Capsicum / Bell Pepper',quantity: 0.04, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.06, unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.07, unit: 'kg' },
      { name: 'Ginger',                quantity: 0.008,unit: 'kg' },
      { name: 'Garlic',                quantity: 0.008,unit: 'kg' },
      { name: 'Garam Masala',          quantity: 0.003,unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.025,unit: 'L'  },
    ],
  },
  // ═══════════════════════════════════════════════════════════════
  //  NORTH INDIAN — NON-VEG GRAVIES
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Butter Chicken (Murgh Makhani)',
    category: 'North Indian Non-Veg',
    sellingPrice: 280,
    ingredients: [
      { name: 'Chicken (Boneless)',    quantity: 0.2,  unit: 'kg' },
      { name: 'Yoghurt / Curd',        quantity: 0.05, unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.15, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.08, unit: 'kg' },
      { name: 'Butter',                quantity: 0.03, unit: 'kg' },
      { name: 'Fresh Cream',           quantity: 0.06, unit: 'L'  },
      { name: 'Cashews',               quantity: 0.02, unit: 'kg' },
      { name: 'Ginger',                quantity: 0.01, unit: 'kg' },
      { name: 'Garlic',                quantity: 0.01, unit: 'kg' },
      { name: 'Tandoori Masala',      quantity: 0.01, unit: 'kg' },
      { name: 'Kasuri Methi',         quantity: 0.002,unit: 'kg' },
      { name: 'Garam Masala',          quantity: 0.003,unit: 'kg' },
    ],
  },
  {
    name: 'Chicken Tikka Masala',
    category: 'North Indian Non-Veg',
    sellingPrice: 290,
    ingredients: [
      { name: 'Chicken (Boneless)',    quantity: 0.2,  unit: 'kg' },
      { name: 'Yoghurt / Curd',        quantity: 0.06, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.1,  unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.12, unit: 'kg' },
      { name: 'Fresh Cream',           quantity: 0.05, unit: 'L'  },
      { name: 'Ginger',                quantity: 0.01, unit: 'kg' },
      { name: 'Garlic',                quantity: 0.01, unit: 'kg' },
      { name: 'Tandoori Masala',      quantity: 0.015,unit: 'kg' },
      { name: 'Red Chilli Powder',     quantity: 0.008,unit: 'kg' },
      { name: 'Garam Masala',          quantity: 0.005,unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.025,unit: 'L'  },
    ],
  },
  {
    name: 'Kadai Chicken',
    category: 'North Indian Non-Veg',
    sellingPrice: 270,
    ingredients: [
      { name: 'Chicken (Bone-in)',     quantity: 0.25, unit: 'kg' },
      { name: 'Capsicum / Bell Pepper',quantity: 0.08, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.1,  unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.1,  unit: 'kg' },
      { name: 'Ginger',                quantity: 0.01, unit: 'kg' },
      { name: 'Garlic',                quantity: 0.01, unit: 'kg' },
      { name: 'Red Chilli Powder',     quantity: 0.008,unit: 'kg' },
      { name: 'Coriander Powder',      quantity: 0.005,unit: 'kg' },
      { name: 'Garam Masala',          quantity: 0.005,unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.03, unit: 'L'  },
    ],
  },
  {
    name: 'Mutton Rogan Josh',
    category: 'North Indian Non-Veg',
    sellingPrice: 380,
    ingredients: [
      { name: 'Mutton (Bone-in)',      quantity: 0.25, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.12, unit: 'kg' },
      { name: 'Yoghurt / Curd',        quantity: 0.06, unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.08, unit: 'kg' },
      { name: 'Ginger',                quantity: 0.01, unit: 'kg' },
      { name: 'Garlic',                quantity: 0.01, unit: 'kg' },
      { name: 'Red Chilli Powder',     quantity: 0.01, unit: 'kg' },
      { name: 'Coriander Powder',      quantity: 0.008,unit: 'kg' },
      { name: 'Garam Masala',          quantity: 0.005,unit: 'kg' },
      { name: 'Cardamom (Elaichi)',    quantity: 0.003,unit: 'kg' },
      { name: 'Cooking Oil (Sunflower)',quantity: 0.035,unit: 'L'  },
    ],
  },
  // ═══════════════════════════════════════════════════════════════
  //  RICE & BIRYANI
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Steamed Rice',
    category: 'Rice',
    sellingPrice: 80,
    ingredients: [
      { name: 'Basmati Rice',          quantity: 0.12, unit: 'kg' },
      { name: 'Salt',                  quantity: 0.002,unit: 'kg' },
    ],
  },
  {
    name: 'Jeera Rice',
    category: 'Rice',
    sellingPrice: 120,
    ingredients: [
      { name: 'Basmati Rice',          quantity: 0.12, unit: 'kg' },
      { name: 'Cumin Seeds',           quantity: 0.005,unit: 'kg' },
      { name: 'Ghee',                  quantity: 0.015,unit: 'kg' },
      { name: 'Bay Leaf (Tej Patta)',   quantity: 0.002,unit: 'kg' },
      { name: 'Salt',                  quantity: 0.002,unit: 'kg' },
    ],
  },
  {
    name: 'Veg Biryani',
    category: 'Rice',
    sellingPrice: 180,
    ingredients: [
      { name: 'Basmati Rice',          quantity: 0.15, unit: 'kg' },
      { name: 'Potato',               quantity: 0.06, unit: 'kg' },
      { name: 'Peas (Matar)',          quantity: 0.05, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.08, unit: 'kg' },
      { name: 'Yoghurt / Curd',        quantity: 0.04, unit: 'kg' },
      { name: 'Biryani Masala',        quantity: 0.015,unit: 'kg' },
      { name: 'Saffron (Kesar)',       quantity: 0.1,  unit: 'g'  },
      { name: 'Ghee',                  quantity: 0.02, unit: 'kg' },
      { name: 'Coriander Leaves',      quantity: 0.01, unit: 'kg' },
    ],
  },
  {
    name: 'Chicken Biryani',
    category: 'Rice',
    sellingPrice: 280,
    ingredients: [
      { name: 'Basmati Rice',          quantity: 0.15, unit: 'kg' },
      { name: 'Chicken (Bone-in)',     quantity: 0.2,  unit: 'kg' },
      { name: 'Onion',                 quantity: 0.1,  unit: 'kg' },
      { name: 'Yoghurt / Curd',        quantity: 0.06, unit: 'kg' },
      { name: 'Tomato (Ripe)',         quantity: 0.05, unit: 'kg' },
      { name: 'Biryani Masala',        quantity: 0.02, unit: 'kg' },
      { name: 'Saffron (Kesar)',       quantity: 0.15, unit: 'g'  },
      { name: 'Ghee',                  quantity: 0.025,unit: 'kg' },
      { name: 'Coriander Leaves',      quantity: 0.01, unit: 'kg' },
      { name: 'Lemon',                 quantity: 0.5,  unit: 'pcs'},
    ],
  },
  {
    name: 'Mutton Biryani',
    category: 'Rice',
    sellingPrice: 380,
    ingredients: [
      { name: 'Basmati Rice',          quantity: 0.15, unit: 'kg' },
      { name: 'Mutton (Bone-in)',      quantity: 0.22, unit: 'kg' },
      { name: 'Onion',                 quantity: 0.12, unit: 'kg' },
      { name: 'Yoghurt / Curd',        quantity: 0.07, unit: 'kg' },
      { name: 'Biryani Masala',        quantity: 0.025,unit: 'kg' },
      { name: 'Saffron (Kesar)',       quantity: 0.2,  unit: 'g'  },
      { name: 'Ghee',                  quantity: 0.03, unit: 'kg' },
      { name: 'Coriander Leaves',      quantity: 0.01, unit: 'kg' },
      { name: 'Lemon',                 quantity: 0.5,  unit: 'pcs'},
    ],
  },
]

// ─── CSV EXPORT HELPERS ──────────────────────────────────────────────────────

export function ingredientsToCSV(rows) {
  const headers = ['name','sku','category','unit','costPerUnit','currentStock','parLevel']
  const lines = [headers.join(',')]
  rows.forEach(r => {
    lines.push([
      `"${r.name}"`, r.sku, r.category, r.unit,
      r.costPerUnit, r.currentStock, r.parLevel
    ].join(','))
  })
  return lines.join('\n')
}

export function recipesToCSV(rows) {
  // Flat format: one row per recipe-ingredient pair
  const headers = ['recipeName','recipeCategory','sellingPrice','ingredientName','quantity','unit']
  const lines = [headers.join(',')]
  rows.forEach(r => {
    if (r.ingredients.length === 0) {
      lines.push([`"${r.name}"`, r.category, r.sellingPrice, '', '', ''].join(','))
    } else {
      r.ingredients.forEach((ing, i) => {
        lines.push([
          i === 0 ? `"${r.name}"` : '',
          i === 0 ? r.category : '',
          i === 0 ? r.sellingPrice : '',
          `"${ing.name}"`, ing.quantity, ing.unit
        ].join(','))
      })
    }
  })
  return lines.join('\n')
}

// ─── CSV PARSE HELPERS ───────────────────────────────────────────────────────

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { inQuotes = !inQuotes; continue }
    if (line[i] === ',' && !inQuotes) { result.push(current.trim()); current = ''; continue }
    current += line[i]
  }
  result.push(current.trim())
  return result
}

export function parseIngredientsCSV(text) {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase())
  return lines.slice(1).map(line => {
    const cols = parseCSVLine(line)
    const obj = {}
    headers.forEach((h, i) => { obj[h] = cols[i] ?? '' })
    return {
      name:         obj.name,
      sku:          obj.sku || '',
      category:     obj.category || 'Pantry',
      unit:         obj.unit || 'kg',
      costPerUnit:  parseFloat(obj.costperunit) || 0,
      currentStock: parseFloat(obj.currentstock) || 0,
      parLevel:     parseFloat(obj.parlevel) || 0,
    }
  }).filter(r => r.name)
}

export function parseRecipesCSV(text) {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s/g,''))
  const rows = lines.slice(1).map(line => {
    const cols = parseCSVLine(line)
    const obj = {}
    headers.forEach((h, i) => { obj[h] = cols[i] ?? '' })
    return obj
  })

  const recipes = []
  let current = null
  rows.forEach(row => {
    if (row.recipename) {
      current = {
        name:         row.recipename,
        category:     row.recipecategory || 'Mains',
        sellingPrice: parseFloat(row.sellingprice) || 0,
        ingredients:  [],
      }
      recipes.push(current)
    }
    if (current && row.ingredientname) {
      current.ingredients.push({
        name:     row.ingredientname,
        quantity: parseFloat(row.quantity) || 0,
        unit:     row.unit || 'kg',
      })
    }
  })
  return recipes
}
