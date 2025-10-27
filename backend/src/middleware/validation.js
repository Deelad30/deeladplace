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

module.exports = {
  validateSalesData,
  validateExpenseData
};