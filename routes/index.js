const express = require("express")
const router = express.Router()
const invoiceRoutes = require("./invoiceroutes")
const reportRoutes = require("./reportroutes")
const productRoutes = require("./productroutes")
const authroutes=require("./authroute")
router.use("/products", productRoutes)
router.use("/auth",authroutes)
router.use("/invoices", invoiceRoutes);
router.use("/reports", reportRoutes);
module.exports = router