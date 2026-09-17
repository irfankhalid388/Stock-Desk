const db=require("../config/db");
async function findall({
    page = 1,
    limit = 10,
    search = "",
    category_id = null
}) {
    let conditions = "WHERE is_active = 1";
    let params = [];

    if (search && search.trim()) {
        conditions += ` AND (name LIKE ? OR sku LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }
    if (category_id !== null && category_id !== undefined) {
        conditions += ` AND category_id = ?`;
        params.push(category_id);
    }
    const countSql = `SELECT COUNT(*) AS total FROM products ${conditions}`;
    const countResult = await db.query(countSql, params);
    const total = countResult[0].total;

    const offset = (page - 1) * limit;
    let sql = `
        SELECT
            id, sku, name, category_id, cost_price, sale_price,
            quantity, reorder_level, is_active, created_at, updated_at
        FROM products
        ${conditions}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    `;
    const dataParams = [...params, Number(limit), Number(offset)];
    const rows = await db.query(sql, dataParams);

    return {
        rows,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
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
        return showall(rows.insertId)
}
async function updatedata(id,data){
    const sql=`UPDATE products
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
        return showall(id)
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
async function findlowsstock(){
const sql=`SELECT id, sku, name, quantity, reorder_level
     FROM products
     WHERE quantity <= reorder_level
       AND is_active = 1
     ORDER BY quantity ASC`
     const result=await db.query(sql)
     return result
}
module.exports={findall,showall,createdata,updatedata,softdelte,decrementstock,incrementstock,findlowsstock};