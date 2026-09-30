const db=require("../config/db")
async function findall({
    search="",
    page=1,
    limit=20
}) {
   const offset=(page-1)*limit ;
   const like=`%${search}%`
   const idMatch = /^\d+$/.test(search) ? Number(search) : 0;
   const sql=`SELECT id, name, phone, email, address, created_at
     FROM customers
     WHERE id=? OR name LIKE ? OR phone LIKE ? OR email LIKE ?
     ORDER BY id
     LIMIT ? OFFSET ?`
     const rows=await db.query(sql,[idMatch,like,like,like,Number(limit),Number(offset)])
    //  TOTAL/////////////////////////////////////////////////////// 
     const totalsql=`SELECT COUNT(*) AS total FROM customers
     WHERE id=? OR name LIKE ? OR phone LIKE ? OR email LIKE ?`
     const totalrows=await db.query(totalsql,[idMatch,like,like,like])
    //  return//////////////////////////
    return{
        rows,
        total:totalrows[0].total
    }
}
// FIND BY ID////////////////////////////////////////////////
async function showall(id) {
    const sql=`select * from customers where id=?`
    const rows=await db.query(sql,[id])
    return rows[0]
}
// CREATE//////////////////////////////////////////////////////
async function createdata(data){
    const sql=`INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)`
    const rows=await db.query(sql,[
        data.name,
        data.phone,
        data.email,
        data.address
    ])
    return showall( rows.insertId)
}
// UPDATE///////////////////////////////////////////////////////////
async function updatedata(data,id) {
    const sql= 'UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?'
    const rows=await db.query(sql,[
        data.name,
        data.phone,
        data.email,
        data.address,
        id
    ])
    if(rows.affectedRows===0){
        return null
    }
    return showall(id)
}
// FIND BY INVOICE TOTALS
async function findwithinvoicetotals(id) {
    const sql=`SELECT c.*, 
       COALESCE(SUM(i.total), 0) AS total_spent, 
       COUNT(i.id) AS invoice_count
FROM customers c
LEFT JOIN invoices i ON i.customer_id = c.id AND i.status!="cancelled"
WHERE c.id = ?
GROUP BY c.id`
const rows=await db.query(sql,[id])
return rows[0] || null 
}
module.exports={findall,showall,createdata,updatedata,findwithinvoicetotals}