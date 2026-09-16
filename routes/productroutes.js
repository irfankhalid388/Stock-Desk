const express = require("express");
const {productRules,validate,adjustRules}=require("../middleware/validate")
const productController = require("../controllers/productcontroller");
const { authrequired } = require("../middleware/authmiddleware");
const {rolerequired}=require("../middleware/rolerequired")
const router = express.Router();
router.get("/", authrequired, productController.list);
router.get("/:id",authrequired,productController.show)
router.post("/",authrequired,rolerequired("admin","staff"),productRules,validate,productController.create)
router.put("/:id",authrequired,rolerequired("admin","staff"),productRules,validate,productController.update)
router.delete("/:id",authrequired,rolerequired("admin"),productController.remove)
router.post("/:id/adjust",authrequired,rolerequired("admin"),adjustRules,validate,productController.stockadjust)
module.exports = router;