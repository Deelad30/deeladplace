import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
export default function Navbar(){
  const { logout, user } = useContext(AuthContext);
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <div>Welcome, {user?.name || 'User'}</div>
      <div>
        <button className="btn" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
