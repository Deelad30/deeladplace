const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const RecipeController = require('../controllers/recipe.controller');

router.post('/:productId/items', auth, requireTenant, RecipeController.addRecipeItem);
router.get('/:productId', auth, requireTenant, RecipeController.getRecipe);

module.exports = router;
