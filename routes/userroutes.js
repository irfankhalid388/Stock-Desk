
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');
const {authrequired} = require('../middleware/authmiddleware');
const {rolerequired} = require('../middleware/rolerequired');
const { registerRules, validate } = require('../middleware/validate');

router.post('/', authrequired, rolerequired('admin'), registerRules, validate, authController.adduser);
router.patch('/:id/deactivate', authrequired, rolerequired('admin'), authController.deactivate);

module.exports = router;