const router = require('express').Router();
const ctrl = require('../controllers/purchase.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, ctrl.getPurchases);
router.post('/', auth, ctrl.createPurchase);

module.exports = router;
