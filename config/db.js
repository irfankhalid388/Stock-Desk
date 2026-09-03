const mysql=require("mysql2/promise")
require("dotenv").config()
const pool=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    port:process.env.DB_PORT,
     waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})
async function query(sql,params){
    const [sqlquery]=await pool.query(sql,params)
    return sqlquery
}
async function transaction(callback){
const connection=await pool.getConnection()
try{
await connection.beginTransaction();
const result= await callback(connection)
await connection.commit()
return result;
}
catch(err){
await connection.rollback()
throw(err);
}
finally{
    connection.release()
}
}
async function ping() {
    const connection=await pool.getConnection()
    await connection.ping()
    connection.release()
}
module.exports={
    pool,
    query,
    transaction,
    ping

};

