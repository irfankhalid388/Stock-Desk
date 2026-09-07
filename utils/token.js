const jwt=require("jsonwebtoken")
const crypto = require("crypto")
require("dotenv").config()
async function signaccess(payload){
    const accesstoken= await jwt.sign(payload,process.env.JWT_ACCESS_SECRET,{
        expiresIn:process.env.ACCESS_TTL
    })
    return accesstoken
}
async function signrefresh(payload) {
    const refreshtoken=await jwt.sign(payload,process.env. JWT_REFRESH_SECRET,{
        expiresIn:process.env.REFRESH_TTL
    })
    return refreshtoken
}
async function verifyaccess(token) {
    const verifytoken= await jwt.verify(token,process.env.JWT_ACCESS_SECRET)
    return verifytoken 
}
async function verifyrefresh(token) {
    const verifyreftoken=await jwt.verify(token,process.env. JWT_REFRESH_SECRET)
    return verifyreftoken 
}
async function hashtoken(token){
    return crypto.createHash("sha256").update(token).digest("hex")
}
module.exports={
    signaccess,
    signrefresh,
    verifyaccess,
    verifyrefresh,
    hashtoken
}