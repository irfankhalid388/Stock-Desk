const db=require("../config/db")
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
module.exports={findall};