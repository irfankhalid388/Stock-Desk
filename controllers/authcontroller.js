const model = require("../models/usermodel")
const { hash,compare } = require("../utils/password")
const { signaccess, signrefresh,hashtoken, verifyrefresh } = require("../utils/token")
async function register(req, res, next) {
    try {
        const { name, email, password, role } = req.body

        const password_hash = await hash(password)

        const result = await model.create({
            name,
            email,
            password_hash,
            role
    })

        res.status(201).json({
            message: "user registered successfully",
            userid: result.insertId
        })
    }
    catch (err) {
        next(err)
    }
}
async function login (req,res,next){
    try{
        const {email,password}=req.body
        const user = await model.FindByEmail(email)
        if(!user){
             return res.status(401).json({ error: "invalid credentials" })
        }
        const isMatch=await compare(password,user.password_hash)
        if(!isMatch){
          return res.status(401).json({ error: "invalid credentials" })  
        }
        // tokens /////////////////////////////////////////////////////
        const accesstoken= await signaccess({id:user.id,role:user.role})
        const refreshtoken= await signrefresh({id:user.id})
        // converting token into crypto form/////////////////////////////
        const tokenHash=await hashtoken(refreshtoken)
        const expiresat=new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        await model.saverefreshtoken(user.id,tokenHash,expiresat)
        res.cookie("refreshtoken",refreshtoken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge:7 * 24 * 60 * 60 * 1000
        })
        res.status(200).json({
            accesstoken
        })
    }
    catch(err){
        next(err)
    }
}
async function refresh(req,res,next) {
    try{
    const oldrefresh=req.cookies.refreshtoken
    if(!oldrefresh){
         return res.status(401).json({
         error:"missing refresh token"
        })
    }
    let payload
    try{
      payload= await verifyrefresh(oldrefresh)
    }
    catch(err){
      return res.status(401).json({
        error:"invalid refresh token "
       })
    }
     const oldTokenHash = await hashtoken(oldrefresh)
     const row = await model.findRefreshToken(oldTokenHash)
     if(!row){
         return res.status(401).json({ error: "invalid refresh token" })
     }
                if (row.revoked_at) {
            return res.status(401).json({ error: "invalid refresh token" })
        }
                if (new Date(row.expires_at) < new Date()) {
            return res.status(401).json({ error: "refresh token expired" })
        }
                await model.revokeRefreshToken(row.id)
                        const newAccessToken = await signaccess({ id: payload.id, role: payload.role })
        const newRefreshToken = await signrefresh({ id: payload.id })
                const newTokenHash = await hashtoken(newRefreshToken)
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        await model.saverefreshtoken(payload.id, newTokenHash, newExpiresAt)
                res.cookie("refreshtoken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
      return res.status(200).json({ accesstoken: newAccessToken })
    }
    
    catch(err){
      next(err)
    }
} 
async function logout(req, res, next) {
    try {
        const oldrefresh = req.cookies.refreshtoken

        if (oldrefresh) {
            const tokenHash = await hashtoken(oldrefresh)
            const row = await model.findRefreshToken(tokenHash)
            if (row) {
                await model.revokeRefreshToken(row.id)
            }
        }

        res.clearCookie("refreshtoken")
        return res.status(200).json({ message: "logged out" })
    }
    catch (err) {
        next(err)
    }
}

module.exports={
    register,
    login,
    refresh,
    logout
}