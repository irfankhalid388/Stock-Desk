const db=require("../config/db")
require("dotenv").config()
async function create({name, email, password_hash, role}) {
    const sql=`INSERT INTO users (name, email, password_hash, role)
VALUES (?, ?, ?, ?);
`
const rows=await db.query(sql , [name, email, password_hash, role])
return rows
}
// ///////////////////FINDBYEMAIL////////////////////////////////////////
async function FindByEmail(email){
    const sql=`SELECT id, name, email, password_hash, role, is_active
     FROM users
     WHERE email = ?`
    const rows= await db.query(sql,[email])
    return rows[0] || null
}
// ////////////////////////////SAVEREFRESHTOKEN///////////////////////////////////////
async function saverefreshtoken(userid,tokenhash,expiresat){
    const sql = `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
VALUES (?, ?, ?);`
const rows= await db.query(sql,[userid,tokenhash,expiresat])
return rows
}

// //////////////////////////FINDREFRESHTOKEN//////////////////////////////////
async function  findRefreshToken(tokenhash){
const sql=`SELECT * FROM refresh_tokens WHERE token_hash = ? `
const rows=await db.query(sql,[tokenhash])
return rows [0] || null
}
// //////////////REVOKEEREFRESHTOKEN/////////////////////////
async function revokeRefreshToken(id){
    const sql=`UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?`
    const rows= await db.query(sql,[id])
    return rows.affectedRows > 0
    
}
// ///////////////////////////////////////////// COUNTUSER///////////////////////////////////
async function countuser(){
    const sql=`select COUNT(*) as count from users`
    const result=await db.query(sql)
    return result[0].count
}
// /////////////////////////////FINDBYID//////////////////////////////////////
async function findById(id) {
  const sql = `SELECT id, name, email, role, is_active FROM users WHERE id = ?`;
  const rows = await db.query(sql, [id]);
  return rows[0] || null;
}
//////////////////////////// REVOKEALLUSERS//////////////////////////////////
async function revokeAllForUser(userId) {
  const sql = `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL`;
  const result = await db.query(sql, [userId]);
  return result.affectedRows;
}
// ////////////////////////////////////DEACTIVATE//////////////////////////////////////
async function deactivate(id) {
  const sql = `UPDATE users SET is_active = 0 WHERE id = ?`;
  const result = await db.query(sql, [id]);
  return result.affectedRows > 0;
}
// /////////////////////UPDATE PASSWORD/////////////////////
async function updatepassword(id,newPasswordhash){
    const sql=`UPDATE users SET password_hash = ? WHERE id = ?`
    const result=await db.query(sql,[newPasswordhash,id])
    return result.affectedRows > 0;
 }
//  ////////////////////////////////findbyidWITHpassword//////////////////////
async function findByIdWithPassword(id){
    const sql=`SELECT id, name, email, role, is_active, password_hash FROM users WHERE id = ?`
    const result=await db.query(sql,[id])
    return result[0] || null
}
// ///////////////////////////////////EXPORTS///////////////////////////////////
module.exports={
    create,
    FindByEmail,
    saverefreshtoken,
    findRefreshToken,
    revokeRefreshToken,
    countuser,
    findById,
    revokeAllForUser,
    deactivate,
    updatepassword,
    findByIdWithPassword
};
