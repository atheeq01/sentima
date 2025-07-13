import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/components.css';

const Navbar = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div className="navbar">
      <h2>Student Feedback System</h2>
      <button onClick={logout} className="logout-btn">Logout</button>
    </div>
  );
};

export default Navbar;