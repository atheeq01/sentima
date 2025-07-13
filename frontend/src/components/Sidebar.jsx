import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/components.css';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="sidebar">
      <h3>{user.name}</h3>
      <p>{user.role.toUpperCase()}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
export default Sidebar;