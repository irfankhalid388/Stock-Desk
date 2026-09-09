const { name } = require("ejs");
const db=require("../config/db");
const { show } = require("../controllers/productcontroller");
async function findall(){
      const sql = `
        SELECT
            id,
            sku,
            name,
            category_id,
            cost_price,
            sale_price,
            quantity,
            reorder_level,
            is_active,
            created_at,
            updated_at
        FROM products
        WHERE is_active = 1
        ORDER BY id DESC
    `;
    const rows= await db.query(sql)
    return rows

}
async function showall(id){
    const sql=`
        SELECT
            id,
            sku,
            name,
            category_id,
            cost_price,
            sale_price,
            quantity,
            reorder_level,
            is_active,
            created_at,
            updated_at
        FROM products
          where id=?`
        const rows=await db.query(sql,[id])
        return rows[0]  
}
async function createdata(data) {
    const sql=`INSERT INTO products
            (sku, name, category_id, cost_price, sale_price, quantity, reorder_level)
        VALUES (?, ?, ?, ?, ?, ?, ?)`
        const rows=await db.query(sql,[
            data.sku,
           data.name,
            data.category_id,
            data.cost_price,
            data.sale_price,
            data.quantity,
            data.reorder_level
        ])
        return show(rows.insertId)
}
async function updatedata(id,data){
    const mysql=`UPDATE products
        SET
            sku = ?,
            name = ?,
            category_id = ?,
            cost_price = ?,
            sale_price = ?,
            quantity = ?,
            reorder_level = ?
        WHERE id = ?`
        const rows=await db.query(sql,[
             data.sku,
        data.name,
        data.category_id,
        data.cost_price,
        data.sale_price,
        data.quantity,
        data.reorder_level,
        id
        ])
        if(rows.affectedRows===0){
         return null
        }
        return show(id)
}
async function softdelte(id){
    const sql=` UPDATE products
        SET is_active = 0
        WHERE id = ?
    `;
    const result=await db.query(sql,[id])
    return result.affectedRows>0
}
async function decrementstock(conn,id,qty){
    const sql=`UPDATE products
        SET quantity = quantity - ?
        WHERE id = ? AND quantity >= ?
    `
    const [result]=await conn.query(sql,[qty,id,qty])
    return result.affectedRows>0
}
async function incrementstock(conn,id,qty){
    const sql=`UPDATE products SET quantity=quantity + ?
    where id=?`
    const [result]=await conn.query(sql,[qty,id])
    return result.affectedRows>0
}
module.exports={findall,showall,createdata,updatedata,softdelte,decrementstock,incrementstock};