// Map role_id (from database) → role name (used in frontend)
export const ROLE_MAP = {
  1: "admin",
  2: "manager",
  3: "accountant",
  4: "inventory_officer",
  5: "store_keeper",
  6: "auditor",
  7: "cashier",
  8: "cashier_plus",
  9: "kitchen_staff",
  // Optional fallback:
  0: "staff"
};


export const ROLE_DEFAULT_ROUTE = {
  admin: "/dashboard",
  manager: "/dashboard",
  cashier: "/pos",
  cashier_plus: "/pos",
  kitchen_staff: "/inventory",
  inventory_officer: "/inventory",
  accountant: "/expenses",
  auditor: "/reports",
  store_keeper: "/products",
  staff: "/pos"
};


// Permissions for each role
export const ROLE_PERMISSIONS = {
  admin: {
    dashboard: true,
    pos: true,
    vendors: true,
    products: true,
    stock: true,
    expenses: true,
    reports: true,
    users: true,
    sic_product: true,
    sic_raw: true,
    costing: true,
    recipes: true,
    stocks: true
  },

  manager: {
    dashboard: true,
    pos: true,
    vendors: true,
    products: true,
    stock: true,
    expenses: true,
    reports: true,
    users: true,
    sic_product: true,
    sic_raw: true,
    costing: true,
    recipes: true
  },

  accountant: {
    expenses: true,
    reports: true
  },

  inventory_officer: {
    stock: true,
    reports: true
  },

  store_keeper: {
    stock: true,
    sic_raw: true // should be able to see sic raw
  },

  auditor: {
    reports: true
  },

  cashier: {
    pos: true
  },

  cashier_plus: {
    pos: true,
    sic_product: true, //should be able to see sic product
    stock: true
  },

  kitchen_staff: {
    stock: true, //raw only
  },

  staff: {
    // Fallback for undefined roles
  }

  //stock === inventory management page
};
