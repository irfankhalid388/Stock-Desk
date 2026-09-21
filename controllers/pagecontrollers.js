const productModel = require("../models/productmodel");

async function test(req, res, next) {
  try {
    res.render('layouts/main', {
      title: 'Test',
      view: 'test'
    });
  } catch (err) {
    next(err);
  }
}

async function productsList(req, res, next) {
  try {
    res.render('layouts/main', {
      title: 'Products',
      view: 'products/list'
    });
  } catch (err) {
    next(err);
  }
}

async function productForm(req, res, next) {
  try {
    let product = null;

    if (req.params.id) {
      product = await productModel.showall(req.params.id);
      if (!product) {
        return res.status(404).send('Product not found');
      }
    }

    res.render('layouts/main', {
      title: product ? 'Edit Product' : 'Add Product',
      view: 'products/form',
      product
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { test, productsList, productForm };