const express=require("express")
const authcontroller=require("../controllers/authcontroller")
const router=express.Router()
router.post("/register",authcontroller.register)
router.post("/login", authcontroller.login)
router.post('/refresh', authcontroller.refresh);
router.post('/logout', authcontroller.logout);


module.exports=router