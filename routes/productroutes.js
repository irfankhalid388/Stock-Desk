const express = require("express");

const productController = require("../controllers/productcontroller");
const { authrequired } = require("../middleware/authmiddleware");
const {rolerequired}=require("../middleware/rolerequired")
const router = express.Router();
router.get("/", authrequired, productController.list);
router.get("/:id",authrequired,productController.show)
router.post("/",authrequired,rolerequired("admin","staff"),productController.create)
router.put("/:id",authrequired,rolerequired("admin","staff"),productController.update)
router.delete("/:id",authrequired,rolerequired("admin"),productController.remove)
router.post("/:id/adjust",authrequired,rolerequired("admin"),productController.stockadjust)
module.exports = router;