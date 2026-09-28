const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categorycontroller");
const { authrequired } = require("../middleware/authmiddleware");
const { rolerequired } = require("../middleware/rolerequired");

router.get("/", authrequired, categoryController.list);
router.post("/", authrequired, rolerequired("admin"), categoryController.create);

module.exports = router;