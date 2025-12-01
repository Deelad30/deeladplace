const router = require("express").Router();
const rawVar = require("../controllers/varianceRaw.controller");
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');

router.get("/variance/raw-materials", auth, requireTenant, rawVar.getRawMaterialVariance);

module.exports = router;
