
// src/components/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';
export default function Unauthorized(){
  return (
    <div style={{padding:40,textAlign:'center'}}>
      <h2>Access denied</h2>
      <p>You do not have permission to view this page.</p>
      <Link to="/">Go back</Link>
    </div>
  );
}
