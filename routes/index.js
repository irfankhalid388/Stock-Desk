const express = require("express")
const router = express.Router()
const productRoutes = require("./productroutes")
const authroutes=require("./authroute")
router.use("/products", productRoutes)
router.use("/auth",authroutes)

module.exports = router