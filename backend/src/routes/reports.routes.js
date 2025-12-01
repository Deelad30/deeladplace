const router = require("express").Router();
const rawVar = require("../controllers/varianceRaw.controller");
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');

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



module.exports = router;
