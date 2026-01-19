const request = require('supertest');
const express = require('express');
const { buildSalesFilters, validateDateRange } = require('../src/utils/filterBuilder');

describe('Filter Builder Utility', () => {
  describe('buildSalesFilters', () => {
    const tenantId = 1;

    test('should build filters with start date only', () => {
      const result = buildSalesFilters(tenantId, { start: '2024-01-01' });
      
      expect(result.params).toEqual([1, '2024-01-01 00:00:00']);
      expect(result.whereSql).toBe('AND ps.created_at >= $2::timestamptz');
      expect(result.paramIndex).toBe(3);
    });

    test('should build filters with end date only', () => {
      const result = buildSalesFilters(tenantId, { end: '2024-12-31' });
      
      expect(result.params).toEqual([1, '2024-12-31 23:59:59.999']);
      expect(result.whereSql).toBe('AND ps.created_at <= $2::timestamptz');
      expect(result.paramIndex).toBe(3);
    });

    test('should build filters with date range', () => {
      const result = buildSalesFilters(tenantId, {
        start: '2024-01-01',
        end: '2024-12-31'
      });
      
      expect(result.params).toEqual([
        1,
        '2024-01-01 00:00:00',
        '2024-12-31 23:59:59.999'
      ]);
      expect(result.whereSql).toContain('ps.created_at >= $2::timestamptz');
      expect(result.whereSql).toContain('ps.created_at <= $3::timestamptz');
      expect(result.paramIndex).toBe(4);
    });

    test('should build filters with vendor_id', () => {
      const result = buildSalesFilters(tenantId, { vendor_id: 5 });
      
      expect(result.params).toEqual([1, 5]);
      expect(result.whereSql).toBe('AND ps.vendor_id = $2');
      expect(result.paramIndex).toBe(3);
    });

    test('should build filters with payment_type', () => {
      const result = buildSalesFilters(tenantId, { payment_type: 'cash' });
      
      expect(result.params).toEqual([1, 'cash']);
      expect(result.whereSql).toBe('AND ps.payment_method = $2');
      expect(result.paramIndex).toBe(3);
    });

    test('should build combined filters', () => {
      const result = buildSalesFilters(tenantId, {
        start: '2024-01-01',
        end: '2024-12-31',
        vendor_id: 5,
        payment_type: 'card'
      });
      
      expect(result.params).toEqual([
        1,
        '2024-01-01 00:00:00',
        '2024-12-31 23:59:59.999',
        5,
        'card'
      ]);
      expect(result.whereSql).toContain('AND');
      expect(result.paramIndex).toBe(6);
    });

    test('should return empty whereSql when no filters', () => {
      const result = buildSalesFilters(tenantId, {});
      
      expect(result.params).toEqual([1]);
      expect(result.whereSql).toBe('');
      expect(result.paramIndex).toBe(2);
    });

    test('should use custom table alias', () => {
      const result = buildSalesFilters(tenantId, {
        start: '2024-01-01',
        tableAlias: 'sales'
      });
      
      expect(result.whereSql).toContain('sales.created_at');
    });
  });

  describe('validateDateRange', () => {
    test('should validate when no dates provided', () => {
      const result = validateDateRange(null, null);
      expect(result.isValid).toBe(true);
    });

    test('should validate valid date range', () => {
      const result = validateDateRange('2024-01-01', '2024-12-31');
      expect(result.isValid).toBe(true);
    });

    test('should invalidate when start is after end', () => {
      const result = validateDateRange('2024-12-31', '2024-01-01');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should validate when only start date provided', () => {
      const result = validateDateRange('2024-01-01', null);
      expect(result.isValid).toBe(true);
    });

    test('should validate when only end date provided', () => {
      const result = validateDateRange(null, '2024-12-31');
      expect(result.isValid).toBe(true);
    });
  });
});
