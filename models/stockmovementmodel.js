const db=require("../config/db")
async function stock_movements(conn,data){
    const sql= `INSERT INTO stock_movements (product_id, change_qty, reason, reference_id, user_id, note)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result]=await conn.query(sql,[
        data.product_id,
         data.change_qty,
          data.reason,          
        data.reference_id,
         data.user_id,
          data.note
        ])
}
// //////////////////////////////////////////////////////////////////////list
async function showmovements() {
  const sql = `
    SELECT sm.id, sm.created_at, p.name AS product_name, p.sku,
           sm.change_qty, sm.reason, sm.reference_id,
           u.name AS user_name, sm.note
    FROM stock_movements sm
    JOIN products p ON p.id = sm.product_id
    JOIN users u ON u.id = sm.user_id
    ORDER BY sm.created_at DESC, sm.id DESC
    LIMIT 100`
  const rows = await db.query(sql, [])
  return rows
}
module.exports={stock_movements,showmovements}