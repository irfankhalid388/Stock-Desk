const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pagecontrollers');


router.get('/test',pageController.test);
router.get('/products', pageController.productsList);
router.get('/products/new',  pageController.productForm);
router.get('/products/:id/edit',  pageController.productForm);
// ////////////////////////////////////////////////////auth
router.get('/login', (req, res) => res.render('auth/login'));
router.get('/signup',(req,res)=>res.render('auth/signup'))
// customers////////////////////////////////////////////////
router.get("/customers", pageController.customerlist);
router.get("/customers/new", pageController.customerForm);
router.get("/customers/:id/edit", pageController.customerForm);
router.get("/customers/summary", pageController.customerSummary);
// invoices///////////////////////////////////////////////////////
router.get("/invoices/new", pageController.invoiceForm);
router.get("/invoices", pageController.invoicesList);
router.get("/invoices/:id", pageController.invoiceDetail);
// dashboard/////////////////////////
router.get("/dashboard",pageController.dashboardPage)
// users//////////////////////////////
router.get("/users", pageController.usersList);
router.get("/users/new", pageController.userForm);
router.get("/users/:id/edit", pageController.userForm);
// reports/////////////////////////////////////////////
router.get("/reports", pageController.reportsPage);
module.exports = router;