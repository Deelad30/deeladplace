/**
 * Sales Filter Builder Utility
 * 
 * Centralized filter building for sales queries to eliminate code duplication.
 * Used by salesReportController endpoints: getSalesPaginated, getSalesOverview,
 * getSalesSummary, getTopProducts, getPaymentSummary.
 */

/**
 * Builds SQL filter conditions and parameters for sales queries
 * 
 * @param {number} tenantId - The tenant ID (always required)
 * @param {Object} options - Filter options
 * @param {string} [options.start] - Start date (YYYY-MM-DD format)
 * @param {string} [options.end] - End date (YYYY-MM-DD format)
 * @param {number} [options.vendor_id] - Vendor ID filter
 * @param {string} [options.payment_type] - Payment method filter
 * @param {string} [options.tableAlias='ps'] - Table alias for queries (default: 'ps')
 * 
 * @returns {Object} Object containing:
 *   - params: Array of parameter values for SQL query
 *   - whereSql: SQL WHERE clause fragment (starts with AND)
 *   - paramIndex: Next parameter index to use
 * 
 * @example
 * const filters = buildSalesFilters(tenantId, { start: '2024-01-01', vendor_id: 5 });
 * const sql = `SELECT * FROM pos_sales ps WHERE tenant_id = $1 ${filters.whereSql}`;
 * db.query(sql, filters.params);
 */
function buildSalesFilters(tenantId, options = {}) {
  const {
    start,
    end,
    vendor_id,
    payment_type,
    tableAlias = 'ps'
  } = options;

  const params = [tenantId];
  const filters = [];
  let paramIndex = 2;

  // Date range filters - using Africa/Lagos timezone for user-facing days
  if (start) {
    params.push(start);
    filters.push(`(${tableAlias}.created_at AT TIME ZONE 'Africa/Lagos')::date >= $${paramIndex++}::date`);
  }

  if (end) {
    params.push(end);
    filters.push(`(${tableAlias}.created_at AT TIME ZONE 'Africa/Lagos')::date <= $${paramIndex++}::date`);
  }

  // Vendor filter
  if (vendor_id) {
    params.push(vendor_id);
    filters.push(`${tableAlias}.vendor_id = $${paramIndex++}`);
  }

  // Payment method filter
  if (payment_type) {
    params.push(payment_type);
    filters.push(`${tableAlias}.payment_method = $${paramIndex++}`);
  }

  // User/Staff filter
  if (options.user_id) {
    params.push(options.user_id);
    filters.push(`${tableAlias}.user_id = $${paramIndex++}`);
  }

  // Build WHERE clause fragment
  const whereSql = filters.length ? `AND ${filters.join(' AND ')}` : '';

  return {
    params,
    whereSql,
    paramIndex
  };
}

/**
 * Validates date range for filters
 * 
 * @param {string} start - Start date
 * @param {string} end - End date
 * @returns {Object} Validation result with isValid and error message
 */
function validateDateRange(start, end) {
  if (!start && !end) {
    return { isValid: true };
  }

  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate > endDate) {
      return {
        isValid: false,
        error: 'Start date must be before or equal to end date'
      };
    }
  }

  return { isValid: true };
}

module.exports = {
  buildSalesFilters,
  validateDateRange
};
