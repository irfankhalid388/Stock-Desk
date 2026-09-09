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
module.exports={stock_movements}