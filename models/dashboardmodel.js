const db = require("../config/db");

// productmodel.findlowsstock() wali WHERE condition yahan copy karo
const LOW_STOCK_WHERE = "quantity <= reorder_level";

// 7 counts, 1 query mein
async function getcounts() {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM customers) AS customers,
      (SELECT COUNT(*) FROM products) AS products,
      (SELECT COUNT(*) FROM products WHERE ${LOW_STOCK_WHERE}) AS low_stock,
      COUNT(*) AS invoices,
      COALESCE(SUM(status = 'cancelled'), 0) AS cancelled,
      COALESCE(SUM(status = 'paid'), 0) AS paid,
      COALESCE(SUM(status = 'unpaid'), 0) AS unpaid
    FROM invoices`;
  const rows = await db.query(sql, []);
  const r = rows[0];
  return {
    customers: Number(r.customers),
    products: Number(r.products),
    low_stock: Number(r.low_stock),
    invoices: Number(r.invoices),
    cancelled: Number(r.cancelled),
    paid: Number(r.paid),
    unpaid: Number(r.unpaid),
  };
}

// aaj ki sales: CURDATE() = aaj ki tareekh (MySQL ki apni clock se)
async function getsalestoday() {
  const sql = `
    SELECT COALESCE(SUM(ii.unit_price * ii.quantity), 0) AS total
    FROM invoices i
    JOIN invoice_items ii ON ii.invoice_id = i.id
    WHERE i.status != 'cancelled'
      AND i.created_at >= CURDATE()`;
  const rows = await db.query(sql, []);
  return Number(rows[0].total);
}

// is mahine ki sales: DATE_FORMAT(CURDATE(), '%Y-%m-01') = is mahine ki 1 tareekh
async function getsalesmonth() {
  const sql = `
    SELECT COALESCE(SUM(ii.unit_price * ii.quantity), 0) AS total
    FROM invoices i
    JOIN invoice_items ii ON ii.invoice_id = i.id
    WHERE i.status != 'cancelled'
      AND i.created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')`;
  const rows = await db.query(sql, []);
  return Number(rows[0].total);
}

// unpaid invoices ki total rakam (sab dinon ki)
async function getunpaidamount() {
  const sql = `
    SELECT COALESCE(SUM(ii.unit_price * ii.quantity), 0) AS total
    FROM invoices i
    JOIN invoice_items ii ON ii.invoice_id = i.id
    WHERE i.status = 'unpaid'`;
  const rows = await db.query(sql, []);
  return Number(rows[0].total);
}

// is mahine ke top 5 products (revenue ke hisaab se)
async function gettopproducts() {
  const sql = `
    SELECT p.id,
           p.name,
           SUM(ii.unit_price * ii.quantity) AS revenue
    FROM invoice_items ii
    JOIN invoices i ON i.id = ii.invoice_id
    JOIN products p ON p.id = ii.product_id
    WHERE i.status != 'cancelled'
      AND i.created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
    GROUP BY p.id
    ORDER BY revenue DESC
    LIMIT 5`;
  const rows = await db.query(sql, []);
  return rows.map((p) => ({ id: p.id, name: p.name, revenue: Number(p.revenue) }));
}

module.exports = {
  getcounts,
  getsalestoday,
  getsalesmonth,
  getunpaidamount,
  gettopproducts,
};