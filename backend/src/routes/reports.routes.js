const router = require("express").Router();
const rawVar = require("../controllers/varianceRaw.controller");
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const reports = require('../controllers/salesReportController');

router.get("/variance/raw-materials", auth, requireTenant, rawVar.getRawMaterialVariance);
router.get(
  "/variance/products", auth, requireTenant,
  require("../controllers/varianceProduct.controller").getProductVariance
);
router.get(
  "/profitability", auth, requireTenant,
  require("../controllers/profit.controller").getProfitReport
);

router.get(
  "/sales", auth, requireTenant,
  require("../controllers/salesReportController").getSalesReport
);

router.get('/sales-overview', auth, requireTenant, reports.getSalesOverview);
router.get('/sales-reports', auth, requireTenant, reports.getSalesPaginated);
router.get('/sales-summary',  auth, requireTenant, reports.getSalesSummary);
router.get('/top-products',   auth, requireTenant, reports.getTopProducts);
router.get('/payment-summary',auth, requireTenant, reports.getPaymentSummary);

module.exports = router;

