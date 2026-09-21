const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pagecontrollers');


router.get('/test',pageController.test);
router.get('/products', pageController.productsList);
router.get('/products/new',  pageController.productForm);
router.get('/products/:id/edit',  pageController.productForm);
router.get('/login', (req, res) => res.render('auth/login'));

module.exports = router;