const express = require("express");
const router = express.Router();
const controller = require("../controllers/profit.controller");
const sicController = require("../controllers/sic.controller");
const auth = require("../middleware/auth.middleware");
const { requireTenant } = require('../middleware/tenant.middleware');

router.get("/product-profitability", auth, requireTenant, controller.getProductProfitability);
router.get("/net-profit", auth, requireTenant, controller.getNetProfit);
router.get("/raw-sic", auth, requireTenant, sicController.getRawSICReport);
router.get("/product-sic", auth, requireTenant, sicController.getProductSICReport);

module.exports = router;
