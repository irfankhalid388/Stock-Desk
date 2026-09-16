const { body,validationResult } = require("express-validator");
const customerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('name is required')
    .isLength({ max: 100 }).withMessage('name must be under 100 characters'),

  body('phone')
    .optional({ checkFalsy: true })
    .isLength({ max: 30 }).withMessage('phone must be under 30 characters'),

  body('email')
    .optional({ checkFalsy: true })
    .isEmail().withMessage('email must be a valid email address')
    .isLength({ max: 255 }),

  body('address')
    .optional({ checkFalsy: true })
    .isLength({ max: 255 }).withMessage('address must be under 255 characters'),
];
const adjustRules = [
  body("change_qty")
    .exists()
    .withMessage("change_qty is required")
    .isInt()
    .withMessage("change_qty must be a non-zero whole number"),

  body("reason")
    .exists({ checkFalsy: true })
    .withMessage("reason is required")
    .isIn(["sale", "purchase", "adjustment", "return"])
    .withMessage("reason must be one of: sale, purchase, adjustment, return"),

  body("note")
    .optional({ checkFalsy: true })
    .isString()
    .isLength({ max: 255 })
    .withMessage("note must not exceed 255 characters"),
];

const productRules = [
  body("sku")
    .exists({ checkFalsy: true })
    .withMessage("sku is required")
    .isString()
    .withMessage("sku must be a string")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("sku must not exceed 50 characters"),


  body("name")
    .exists({ checkFalsy: true })
    .withMessage("name is required")
    .isString()
    .withMessage("name must be a string")
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage("name must not exceed 150 characters"),


  body("category_id")
    .exists({ checkFalsy: true })
    .withMessage("category_id is required")
    .isInt({ gt:0})
    .withMessage("category_id must be a positive integer"),


  body("cost_price")
    .exists({ checkFalsy: true })
    .withMessage("cost_price is required")
    .isFloat({ gt: 0 })
    .withMessage("cost_price must be a number greater than 0")
    .isDecimal({decimal_digits:"0,2"})
    .withMessage("cost_price must have at most 2 decimal places"),



  body("sale_price")
    .exists({ checkFalsy: true })
    .withMessage("sale_price is required")
    .isFloat({ gt: 0 })
    .withMessage("sale_price must be a number greater than 0")
    .isDecimal({decimal_digits:"0,2"})
    .withMessage("sale_price must have at most 2 decimal places"),



  body("quantity")
    .exists({ checkFalsy: true })
    .withMessage("quantity is required")
    .isInt({ min: 0 })
    .withMessage("quantity must be a whole number, zero or more"),


  body("reorder_level")
    .exists({ checkFalsy: true })
    .withMessage("reorder_level is required")
    .isInt({ min: 0 })
    .withMessage("reorder_level must be a whole number, zero or more"),
];
 function validate(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = {};
  result.array().forEach((err) => {
    if (!errors[err.path]) {
      errors[err.path] = err.msg;
    }
  });

  return res.status(422).json({ errors });
}
module.exports={productRules,validate,adjustRules,customerRules}