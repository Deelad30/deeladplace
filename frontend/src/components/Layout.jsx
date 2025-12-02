import React, { useContext } from 'react';
import Sidebar from './SideBar';
import Navbar from './Navbar';
import { AuthContext } from '../context/AuthContext';

export default function Layout({ children }){
  const { user } = useContext(AuthContext);
  return (
    <div className="app-layout">
      <div className="sidebar"><Sidebar user={user} /></div>
      <div className="main">
        <Navbar user={user} />
        <div style={{marginTop:12}}>{children}</div>
      </div>
    </div>
  );
}
