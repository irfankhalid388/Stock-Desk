const db = require("../config/db");

async function getreport(from, to) {
  const revenueSql = `
    SELECT COALESCE(SUM(subtotal - discount), 0) AS revenue,
           COUNT(*) AS invoice_count
    FROM invoices
    WHERE status = 'paid'
      AND created_at BETWEEN ? AND ?`;
  const costSql = `
    SELECT COALESCE(SUM(ii.cost_price * ii.quantity), 0) AS cost
    FROM invoice_items ii
    JOIN invoices i ON i.id = ii.invoice_id
    WHERE i.status = 'paid'
      AND i.created_at BETWEEN ? AND ?`;

  const revRows = await db.query(revenueSql, [from, to]);
  const costRows = await db.query(costSql, [from, to]);

  const revenue = Number(revRows[0].revenue);
  const cost = Number(costRows[0].cost);
  return {
    revenue,
    cost,
    profit: revenue - cost,
    invoice_count: Number(revRows[0].invoice_count),
  };
}

// GET TOP PRODUCTS
async function gettopproducts(from, to, limit = 5) {
  const sql = `
    SELECT 
          SUM(ii.quantity) AS units_sold,
           p.id,
           p.name,
           SUM(ii.unit_price * ii.quantity) AS revenue
    FROM invoice_items ii
    JOIN invoices i ON i.id = ii.invoice_id
    JOIN products p ON p.id = ii.product_id
    WHERE i.created_at BETWEEN ? AND ?
      AND i.status = 'paid'
      GROUP BY p.id, p.name
ORDER BY units_sold DESC, revenue DESC
    LIMIT ?`;
  const rows = await db.query(sql, [from, to, Number(limit)]);
  return rows;
}

// SALE PER PERSON
async function saleperperson(from, to) {
  const sql = `
    SELECT u.id AS user_id,
           u.name AS user_name,
           COUNT(*) AS invoice_count,
           SUM(i.subtotal - i.discount) AS revenue
    FROM invoices i
    JOIN users u ON u.id = i.user_id
    WHERE i.status = 'paid'
      AND i.created_at BETWEEN ? AND ?
    GROUP BY u.id, u.name
    ORDER BY revenue DESC`;
  return await db.query(sql, [from, to]);
}
module.exports = { getreport, gettopproducts, saleperperson };