const express=require("express")
const authcontroller=require("../controllers/authcontroller")
const router=express.Router()
const {registerRules,loginRules,validate,forgotPasswordRules,resetPasswordRules}=require("../middleware/validate")
const loginlimiter=require("../middleware/loginlimiter")
const ratelimiter=require("../middleware/ratelimiter")
const {authrequired}=require("../middleware/authmiddleware")
router.post("/register",registerRules,validate,authcontroller.register)
router.post("/login",loginlimiter,loginRules,validate, authcontroller.login)
router.post('/refresh', authcontroller.refresh);
router.post('/logout', authcontroller.logout);
router.get("/me",authrequired,authcontroller.me)
router.post('/forgot-password', ratelimiter, forgotPasswordRules, validate, authcontroller.forgotpassword)
router.post('/reset-password',  ratelimiter, resetPasswordRules,  validate, authcontroller.resetPassword)
module.exports=router