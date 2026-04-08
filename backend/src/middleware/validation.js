const Joi = require('joi');

/**
 * Legacy validators (keeping for backward compatibility)
 */
const validateSalesData = (req, res, next) => {
  const { vendor_id, product_id, quantity } = req.body;

  if (!vendor_id || !product_id) {
    return res.status(400).json({
      success: false,
      message: 'Vendor ID and Product ID are required'
    });
  }

  if (quantity && (isNaN(quantity) || quantity < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a positive number'
    });
  }

  next();
};

const validateExpenseData = (req, res, next) => {
  const { description, amount } = req.body;

  if (!description || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Description and amount are required'
    });
  }

  if (isNaN(amount) || amount < 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be a positive number'
    });
  }

  next();
};

/**
 * Joi validation schemas
 */
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    tenantName: Joi.string().min(2).max(100).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  productCreate: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    sku: Joi.string().required(),
    vendor_id: Joi.number().integer().positive().allow(null),
    vendor_price: Joi.number().min(0).default(0),
    custom_commission: Joi.number().min(0).default(0),
    category_id: Joi.number().integer().positive().required(),
    description: Joi.string().max(1000).allow('')
  }),

  productUpdate: Joi.object({
    name: Joi.string().min(1).max(200),
    sku: Joi.string(),
    vendor_id: Joi.number().integer().positive().allow(null),
    vendor_price: Joi.number().min(0),
    custom_commission: Joi.number().min(0),
    category_id: Joi.number().integer().positive(),
    description: Joi.string().max(1000).allow('')
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(8).required()
  }),

  recordSale: Joi.object({
    product_id: Joi.number().integer().positive().required(),
    qty: Joi.number().positive().required(),
    selling_price: Joi.number().positive().required(),
    payment_method: Joi.string().allow('', null),
    payment_breakdown: Joi.array().items(Joi.object({
      method: Joi.string().required(),
      amount: Joi.number().required()
    })).optional(),
    order_method: Joi.string().allow('', null),
    vendor_id: Joi.number().integer().positive().allow(null),
    commission: Joi.number().min(0).optional(),
    shift_id: Joi.number().integer().positive().allow(null),
    transaction_id: Joi.string().optional()
  })
};

/**
 * Joi validation middleware factory
 * @param {string} schemaName - Name of the validation schema to use
 * @returns {Function} Express middleware function
 */
function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      return res.status(500).json({
        success: false,
        message: `Validation schema '${schemaName}' not found`
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors
      stripUnknown: true  // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Replace req.body with validated/sanitized values
    req.body = value;
    next();
  };
}

module.exports = {
  validateSalesData,
  validateExpenseData,
  validate,
  schemas
};