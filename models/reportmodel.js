const db = require("../config/db");

async function getreport(from, to) {
  const sql = `
    SELECT
      COALESCE(SUM(ii.unit_price * ii.quantity), 0) AS revenue,
      COALESCE(SUM(p.cost_price * ii.quantity), 0) AS cost,
      COUNT(DISTINCT i.id) AS invoice_count
    FROM invoices i
    JOIN invoice_items ii ON ii.invoice_id = i.id
    JOIN products p ON p.id = ii.product_id
    WHERE i.created_at BETWEEN ? AND ?
      AND i.status != 'cancelled'`;
  const rows = await db.query(sql, [from, to]);
  const { revenue, cost, invoice_count } = rows[0];
  const profit = revenue - cost;
  return {
    revenue: Number(revenue),
    cost: Number(cost),
    profit: Number(profit),
    invoice_count,
  };
}

// GET TOP PRODUCTS
async function gettopproducts(from, to, limit = 5) {
  const sql = `
    SELECT p.id,
           p.name,
           SUM(ii.unit_price * ii.quantity) AS revenue
    FROM invoice_items ii
    JOIN invoices i ON i.id = ii.invoice_id
    JOIN products p ON p.id = ii.product_id
    WHERE i.created_at BETWEEN ? AND ?
      AND i.status != 'cancelled'
    GROUP BY p.id
    ORDER BY revenue DESC
    LIMIT ?`;
  const rows = await db.query(sql, [from, to, Number(limit)]);
  return rows;
}

// SALE PER PERSON
async function saleperperson(from, to) {
  const sql = `
    SELECT u.id AS user_id,
           u.name AS user_name,
           COUNT(DISTINCT i.id) AS invoice_count,
           SUM(ii.unit_price * ii.quantity) AS revenue
    FROM invoices i
    JOIN invoice_items ii ON ii.invoice_id = i.id
    JOIN users u ON u.id = i.user_id
    WHERE i.created_at BETWEEN ? AND ?
      AND i.status != 'cancelled'
    GROUP BY u.id
    ORDER BY revenue DESC`;
  const rows = await db.query(sql, [from, to]);
  return rows;
}

module.exports = { getreport, gettopproducts, saleperperson };