const express = require("express")
const router = express.Router()
const invoiceRoutes = require("./invoiceroutes")
const reportRoutes = require("./reportroutes")
const productRoutes = require("./productroutes")
const authroutes=require("./authroute")
const customerroutes=require("./customerroute")
const userroutes=require("./userroutes")
router.use("/products", productRoutes)
router.use("/auth",authroutes)
router.use("/invoices", invoiceRoutes);
router.use("/reports", reportRoutes);
router.use("/customers",customerroutes)
router.use("/users",userroutes)
module.exports = router