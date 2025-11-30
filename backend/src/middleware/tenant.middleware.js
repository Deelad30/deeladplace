// tenant.middleware.js
// ensures req.user.tenant_id exists - simple enforcement helper
function requireTenant(req, res, next) {
  if (!req.user || !req.user.tenant_id) {
    return res.status(403).json({ error: 'Tenant context required' });
  }
  // attach tenant to req.tenantId for convenience
  req.tenantId = req.user.tenant_id || req.user.tenantId;
  next();
}

module.exports = { requireTenant };
