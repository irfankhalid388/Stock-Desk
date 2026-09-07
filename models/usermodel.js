const db=require("../config/db")
require("dotenv").config()
async function create({name, email, password_hash, role}) {
    const sql=`INSERT INTO users (name, email, password_hash, role)
VALUES (?, ?, ?, ?);
`
const rows=await db.query(sql , [name, email, password_hash, role])
return rows
}
async function FindByEmail(email){
    const sql=`select * from users where email=?;`
    const rows= await db.query(sql,[email])
    return rows[0] || null
}
async function saverefreshtoken(userid,tokenhash,expiresat){
    const sql = `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
VALUES (?, ?, ?);`
const rows= await db.query(sql,[userid,tokenhash,expiresat])
return rows
}


async function  findRefreshToken(tokenhash){
const sql=`SELECT * FROM refresh_tokens WHERE token_hash = ? `
const rows=await db.query(sql,[tokenhash])
return rows [0] || null
}
async function revokeRefreshToken(id){
    const sql=`UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?`
    const rows= await db.query(sql,[id])
    return rows[0] || null 
    
}
module.exports={
    create,
    FindByEmail,
    saverefreshtoken,
    findRefreshToken,
    revokeRefreshToken
};
