const { query, transaction } = require('../config/db');
const db=require('../config/db')
const { next } = require('../utils/invoicenumber');
const { decrementstock } = require('./productmodel');
const { stock_movements } = require('./stockmovementmodel');

async function createwithitems({ customerId, userId, items, discount = 0, tax = 0 }) {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error("invoice must have at least one item");
    err.status = 422;
    throw err;
  }
  const merged = new Map();
for (const i of items) {
  const pid = Number(i.productid);
  merged.set(pid, (merged.get(pid) || 0) + Number(i.quantity));
}
items = [...merged].map(([productid, quantity]) => ({ productid, quantity }));

  return transaction(async (conn) => {
    // 1. Lock and validate stock
    const productID = items.map((i) => i.productid);
    const [rows] = await conn.query(
      `SELECT id, name,cost_price,sale_price,quantity FROM products WHERE id IN (?) AND is_active=1 FOR UPDATE`,
      [productID]
    );
    const productsmap = new Map(rows.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productsmap.get(item.productid);
      if (!product) {
        const err = new Error("PRODUCT_DOES_NOT_EXISTS");
        err.status = 422;
        throw err;
      }
      if (product.quantity < item.quantity) {
        const err = new Error(`Only ${product.quantity} units of ${product.name} remain`);
        err.status = 422;
        throw err;
      }
    }

    // 2. Server-side recalculation
    discount = Number(discount);
tax = Number(tax);

let subtotal = 0;
const lineitems = items.map((item) => {
  const product = productsmap.get(item.productid);
  const unitprice = product.sale_price;
  const costprice = product.cost_price;
  const linetotal = unitprice * item.quantity;
  subtotal += linetotal;
  return { ...item, unitprice, costprice, linetotal };
});

if (discount > subtotal) {
  const err = new Error("Discount cannot be more than the subtotal");
  err.status = 422;
  throw err;
}
const total = subtotal - discount + tax;
    // 3. Insert invoice
    const invoiceno = await next(conn);
    const [invoiceResult] = await conn.query(
      `INSERT INTO invoices
        (invoice_no, customer_id, user_id, subtotal, discount, tax, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [invoiceno, customerId, userId, subtotal, discount, tax, total, 'unpaid']
    );
    const invoiceid = invoiceResult.insertId;

    // 4. Insert items, decrement stock, log movements
    for (const item of lineitems) {
      await conn.query(
        `INSERT INTO invoice_items
          (invoice_id, product_id, quantity, unit_price,cost_price,line_total)
         VALUES (?, ?, ?, ?, ?,?)`,
        [invoiceid, item.productid, item.quantity, item.unitprice,item.costprice,item.linetotal]
      );

    const decremented=  await decrementstock(conn, item.productid, item.quantity);
    if (!decremented) {
  const err = new Error("Not enough stock");
  err.status = 422;
  throw err;
}
      await stock_movements(conn, {
        product_id: item.productid,
        change_qty: -item.quantity,
        reason: 'sale',
        reference_id: invoiceid,
        user_id: userId,
        note: `Sold via invoice ${invoiceno}`,
      });
    }

    return { id: invoiceid, invoiceno, subtotal, discount, tax, total };
  });
}


// CANCLE INVOICE////////////////////////////////////////////////////////////////////////////////////
const { incrementstock } = require('./productmodel'); 
async function cancelInvoice(invoiceId, userId,userRole) {
  return transaction(async (conn) => {
    const [invoiceRows] = await conn.query(
      `SELECT * FROM invoices WHERE id = ? FOR UPDATE`,
      [invoiceId]
    );

    const invoice = invoiceRows[0];

    if (!invoice) {
      const err = new Error('Invoice not found');
      err.status = 404;
      throw err;
    }
    if (userRole === 'staff' && invoice.user_id !== userId) {
      const err = new Error('You can only cancel invoices you created');
      err.status = 403;
      throw err;
    }

    if (invoice.status === 'cancelled') {
      const err = new Error('Invoice is already cancelled');
      err.status = 422;
      throw err;
    }
    if (invoice.status === 'paid') {
  const err = new Error('Paid invoices cannot be cancelled');
  err.status = 422;
  throw err;
}

    const [items] = await conn.query(
      `SELECT * FROM invoice_items WHERE invoice_id = ?`,
      [invoiceId]
    );

    for (const item of items) {
      await incrementstock(conn, item.product_id, item.quantity);

      await stock_movements(conn, {
        product_id: item.product_id,
        change_qty: item.quantity,
        reason: 'return',
        reference_id: invoiceId,
        user_id: userId,
        note: `Cancelled invoice ${invoice.invoice_no}`,
      });
    }

    await conn.query(
      `UPDATE invoices SET status = 'cancelled' WHERE id = ?`,
      [invoiceId]
    );

    return { id: invoiceId, status: 'cancelled' };
  });
}
// search invoice////////////////////////////////////////////////////////////////////////
async function search(id){
const sql=`SELECT i.*, 
            c.name AS customer_name, c.email AS customer_email,
            u.name AS created_by_name
     FROM invoices i
     LEFT JOIN customers c ON c.id = i.customer_id
     LEFT JOIN users u ON u.id = i.user_id
     WHERE i.id = ?`
     const rows=await db.query(sql,[id])
    const result=rows[0]
    if(!result){
      return null;
    }
    const sql1=`SELECT ii.*, p.name AS product_name, p.sku
     FROM invoice_items ii
     LEFT JOIN products p ON p.id = ii.product_id
     WHERE ii.invoice_id = ?`
     const items=await db.query(sql1,[id])
     return{...result,items}
}
// list////////////////////////////////////////////////
async function list({page=1,limit=10,search='',status=''}){
const offset=(page-1)*limit
const like=`%${search}%`
let condition=`where 1=1`
const param=[]
if(search){
  condition += ` AND (i.invoice_no LIKE ? OR c.name LIKE ?)`
  param.push(like,like)
}
if(status){
  condition += ` AND i.status = ?`;
  param.push(status)
}
 const countsql=`select count(*) as total_count
from invoices i
left join customers c on c.id=i.customer_id
 ${condition}`
 const countrows=await db.query(countsql,param)
 const total=countrows[0].total_count
const sql=`
select
i.id,
i.invoice_no ,
i.customer_id,
c.name as customer_name,
i.subtotal,
i.tax,
i.discount,
i.total,
i.status,
i.created_at
from invoices i
left join customers c on c.id=i.customer_id
${condition}
order by i.id asc
limit ? offset ?`
const rows=await db.query(sql,[...param,Number(limit),Number(offset)])
return { rows, total, page, pages: Math.ceil(total / limit) || 1 };
}
async function paidinvoice(id){
  const sql=`SELECT id, status FROM invoices WHERE id = ?`
  const rows=await db.query(sql,[id])
  const invoice=rows[0]
  
  if (!invoice) {
    const err = new Error("Invoice not found");
    err.status = 404;
    throw err;
  }

  if (invoice.status !== "unpaid") {
    const err = new Error("Only unpaid invoices can be marked as paid");
    err.status = 422;
    throw err;
  }


  const sql1=`UPDATE invoices SET status = 'paid' WHERE id = ? AND status = 'unpaid'`
  const result=await db.query(sql1,[id])
  return{id:id,status:'paid'}
}

module.exports = { createwithitems, cancelInvoice,search,list,paidinvoice }; 
