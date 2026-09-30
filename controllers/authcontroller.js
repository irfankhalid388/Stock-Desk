const model = require("../models/usermodel")
const { hash,compare } = require("../utils/password")
const { signaccess, signrefresh,hashtoken, verifyrefresh } = require("../utils/token")
// ///////////////////REGISTER///////////////////////////////////////////
async function register(req, res, next) {
    try {
       const count=await model.countuser()
       if(count>0){
        // some is already exits
     return res.status(403).json({
            error:'REGISTRATION_CLOSED',
            message:'an admin already exists. Ask your owner to add your acount'
        })
       }
        const { name, email, password} = req.body

        const password_hash = await hash(password)

        const result = await model.create({
            name,
            email,
            password_hash,
            role:"admin"
    })

        res.status(201).json({
            message: "user registered successfully",
            userid: result.insertId
        })
    }
    catch (err) {
       if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
    }  
      next(err)

    }
}
// /////////////////////////////////////ADDUSER///////////////////////////////////////////////////////////
async function adduser(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const password_hash = await hash(password);
    const result = await model.create({
      name,
      email,
      password_hash,
      role: "staff",
    });
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
    }
    next(err);
  }
}
// update /////////////////////////////////////////////////////////////////
async function updateuser(req, res, next) {
  try {
    const targetId = Number(req.params.id);
    const { name, email, role } = req.body;
    if (targetId === req.user.id && role !== "admin") {
  return res.status(400).json({
    error: "CANNOT_CHANGE_OWN_ROLE",
    message: "you cannot remove your own admin role"
  });
}

    const updated = await model.updateUser(targetId, { name, email, role });
    if (!updated) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    const user = await model.findById(targetId);
    res.status(200).json(user);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
    }
    next(err);
  }
}
// //////////////////////////////DEACTIVATE//////////////////////////////////
async function deactivate(req,res,next){
    try{
const targetid=Number(req.params.id)
if(targetid===req.user.id){
return  res.status(400).json({
        error:"CANNOT_DEACTIVATE_SELF",
        message:"you cannot deactivate yourself"
    })
}
const target=await model.findById(targetid)
if(!target){
return  res.status(404).json({
        error:"USER_NOT_FOUND"
    })
}
await model.deactivate(target.id)
await model.revokeAllForUser(target.id)
res.status(200).json({message:`${target.name} has been de_activated`})
    }
    catch(err){
     next(err)
    }
}
// //////////////////////////PASSWORDCHANGE/////////////////////////////////
async function changepassword(req,res,next){
    try{

    
const {currentPassword,newPassword}=req.body
const user=await model.findByIdWithPassword(req.user.id)
if(!user){
 return res.status(404).json({error:"USER_NOT_FOUND"})
}
const match=await compare(currentPassword,user.password_hash)
if(!match){
     return res.status(400).json({ error: 'Current password is incorrect' });
}
const newHash = await hash(newPassword);
    await model.updatepassword(user.id, newHash);
    await model.revokeAllForUser(user.id);

    res.json({ message: 'Password updated. Please log in again on your other devices.' });
}
catch(err){
next(err)
}
}
/////////////////////////// LOGIN///////////////////////////////////////////
async function login (req,res,next){
    try{
        const {email,password}=req.body
        const user = await model.FindByEmail(email)
        if(!user){
             return res.status(401).json({ error: "invalid credentials" })
        }
         if (!user.is_active) {
      return res.status(401).json({ error: 'Invalid credentials' });
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
// //////////////////////REFRESH///////////////////////////////////////////////
async function refresh(req,res,next) {
    try{
    const oldrefresh=req.cookies.refreshtoken
    if(!oldrefresh){
         return res.status(401).json({ error:"missing refresh token" })
    }
    let payload
    try{
      payload= await verifyrefresh(oldrefresh)
    }
    catch(err){
      return res.status(401).json({ error:"invalid refresh token " })
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
     const user = await model.findById(payload.id)
     if (!user) {
         return res.status(401).json({ error: "user not found" })
     }

     const newAccessToken = await signaccess({ id: user.id, role: user.role })
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
// ////////////////////////////////////LOGOUT///////////////////////////////// 
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
// /////////////////////////////////ME///////////////////////////////////
async function me(req, res, next) {
  try {
    const user = await model.findById(req.user.id);
    if (!user){ return res.status(404).json({ error: 'User not found' })};

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
}
// get all users/////////////////////////////////////////////////
// controllers/authcontroller.js

async function getallusers(req, res, next) {
  try {
    const users = await model.getallusers();
    const total = await model.countuser();

    res.status(200).json({
      total,
      users
    });
  } catch (err) {
    next(err);
  }
}
// ///////////////////////////EXPORTS/////////////////////////////////////
module.exports={
    register,
    login,
    refresh,
    logout,
    adduser,
    me,
    deactivate,
    changepassword,
    getallusers,
    updateuser
}