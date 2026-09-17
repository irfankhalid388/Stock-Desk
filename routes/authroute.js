const express=require("express")
const authcontroller=require("../controllers/authcontroller")
const router=express.Router()
const {registerRules,loginRules,validate}=require("../middleware/validate")
const loginlimiter=require("../middleware/loginlimiter")
const {authrequired}=require("../middleware/authmiddleware")
router.post("/register",registerRules,validate,authcontroller.register)
router.post("/login",loginlimiter,loginRules,validate, authcontroller.login)
router.post('/refresh', authcontroller.refresh);
router.post('/logout', authcontroller.logout);
router.post("/me",authrequired,authcontroller.me)
module.exports=router