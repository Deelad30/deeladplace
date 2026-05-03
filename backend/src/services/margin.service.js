const db = require('../config/database');
const Compute = require('./compute.service');
const emailService = require('../utils/logger'); // Will replace with actual emailService
const logger = require('../utils/logger');

/**
 * Recalculate margins for all products using a specific material.
 * @param {string} materialId 
 * @param {string} tenantId 
 * @param {number} newUnitCost 
 * @param {string} userId 
 */
async function recalculateMarginsForMaterial(materialId, tenantId, newUnitCost, userId) {
    try {
        // 1. Find all products that use this material
        const productsRes = await db.query(
            `SELECT DISTINCT product_id FROM recipes WHERE material_id = $1 AND tenant_id = $2`,
            [materialId, tenantId]
        );

        const productIds = productsRes.rows.map(r => r.product_id);
        if (productIds.length === 0) return;

        logger.info(`Recalculating margins for ${productIds.length} products due to material ${materialId} cost change.`);

        for (const productId of productIds) {
            // 2. Fetch current product data to get the existing selling price
            const productRes = await db.query(
                `SELECT name, selling_price, tcop FROM products WHERE id = $1 AND tenant_id = $2`,
                [productId, tenantId]
            );
            if (productRes.rows.length === 0) continue;
            const product = productRes.rows[0];

            // 3. Recompute cost with new material cost
            // Note: Compute.computeProductCost already fetches latest material costs from material_purchases.
            // Since we've already inserted the new cost into material_purchases before calling this, 
            // it will pick up the new cost.
            const actual = await Compute.computeProductCost(productId, tenantId, {
                sellingPrice: product.selling_price
            });

            const oldMarginPercent = ((product.selling_price - product.tcop) / product.selling_price) * 100;
            const newMarginPercent = actual.margin_percent * 100;

            // 4. Update product table (KEEP selling_price, update tcop and margin_price)
            await db.query(
                `UPDATE products 
                 SET tcop = $1, 
                     margin_price = $2,
                     updated_at = NOW()
                 WHERE id = $3 AND tenant_id = $4`,
                [actual.TCOP, product.selling_price - actual.TCOP, productId, tenantId]
            );

            // 5. Save to standard_costs for history
            await db.query(
                `INSERT INTO standard_costs
                 (tenant_id, product_id, recipe_cost, packaging_cost, labour_cost, opex_cost, COGS, TCOP, margin_percent, selling_price)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
                [
                    tenantId,
                    productId,
                    actual.recipe_cost,
                    actual.packaging_cost,
                    actual.labour_cost,
                    actual.opex_cost,
                    actual.COGS,
                    actual.TCOP,
                    actual.margin_percent,
                    product.selling_price
                ]
            );

            // 6. Trigger Margin Alert
            // We'll import emailService properly once we update it
            const emailServiceActual = require('../utils/emailService');
            const userRes = await db.query('SELECT email, name FROM users WHERE id = $1', [userId]);
            const user = userRes.rows[0];

            if (user && user.email) {
                // a. Send Email
                await emailServiceActual.sendMarginAlert(user, {
                    product_name: product.name,
                    old_margin: oldMarginPercent.toFixed(1),
                    new_margin: newMarginPercent.toFixed(1),
                    material_name: await getMaterialName(materialId, tenantId),
                    new_cost: newUnitCost
                });

                // b. Create In-App Notification
                const notificationService = require('./notification.service');
                await notificationService.createNotification({
                    tenant_id: tenantId,
                    type: 'margin_alert',
                    title: `Margin Alert: ${product.name}`,
                    message: `Price change for ${await getMaterialName(materialId, tenantId)} affected your profit margin (${oldMarginPercent.toFixed(1)}% → ${newMarginPercent.toFixed(1)}%).`,
                    data: {
                        product_id: productId,
                        material_id: materialId,
                        old_margin: oldMarginPercent.toFixed(1),
                        new_margin: newMarginPercent.toFixed(1)
                    }
                });
            }
        }
    } catch (err) {
        logger.error('Failed to recalculate margins', { error: err.message, materialId, tenantId });
    }
}

async function getMaterialName(id, tenantId) {
    const res = await db.query('SELECT name FROM raw_materials WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
    return res.rows[0]?.name || 'Unknown Material';
}

module.exports = { recalculateMarginsForMaterial };
