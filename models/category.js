const db=require("../config/db")
// find all categories
async function findall(){
    const sql=`select name,id from categories order by id asc;`
    const res=await db.query(sql)
    return res
}
// insert the category/////////////////////////////////////////////////
async function create(data){
    const sql=`insert into categories(name)values ?`
    const res=await db.query(sql,[data.name])
    return {
        id:res.insertId,
        name:data.name
    }
}
module.exports={findall,create}