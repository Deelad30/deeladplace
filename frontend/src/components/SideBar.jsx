import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ user }){
  const role = user?.role || 'admin';
  return (
    <div>
      <h3 style={{marginBottom:12}}>Deelad</h3>
      <nav style={{display:'flex', flexDirection:'column', gap:8}}>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/purchases/material">Purchases</NavLink>
        <NavLink to="/stock/movements">Stock</NavLink>

        {role !== 'cashier' && <>
          <NavLink to="/sic/raw">SIC Raw</NavLink>
          <NavLink to="/sic/products">SIC Product</NavLink>
        </>}

        <NavLink to="/pos/sales">POS</NavLink>
        <NavLink to="/pos/close-shift">Shift Close</NavLink>

        <hr style={{border:'0.5px solid rgba(255,255,255,0.08)'}}/>

        <NavLink to="/reports/variance/raw">Raw Variance</NavLink>
        <NavLink to="/reports/variance/product">Product Variance</NavLink>
        <NavLink to="/reports/profitability">Profitability</NavLink>
        <NavLink to="/reports/sales">Sales Register</NavLink>
      </nav>
    </div>
  );
}
