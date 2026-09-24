const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pagecontrollers');


router.get('/test',pageController.test);
router.get('/products', pageController.productsList);
router.get('/products/new',  pageController.productForm);
router.get('/products/:id/edit',  pageController.productForm);
router.get('/login', (req, res) => res.render('auth/login'));
// customers////////////////////////////////////////////////
router.get("/customers", pageController.customerlist);
router.get("/customers/new", pageController.customerForm);
router.get("/customers/:id/edit", pageController.customerForm);
router.get("/customers/summary", pageController.customerSummary);
// invoices///////////////////////////////////////////////////////
router.get("/invoices", pageController.invoicesList);
router.get("/invoices/:id", pageController.invoiceDetail);

module.exports = router;