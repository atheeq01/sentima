import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/components.css';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="sidebar">
      <h3>{user.name}</h3>
      <p>{user.role.toUpperCase()}</p>
      
      {user.role === 'student' && (
        <nav className="sidebar-nav">
          <h4>Course Levels</h4>
          <ul>
            <li><a href="#level-1" onClick={(e) => handleScroll(e, 'level-1')}>Level 1</a></li>
            <li><a href="#level-2" onClick={(e) => handleScroll(e, 'level-2')}>Level 2</a></li>
            <li><a href="#level-3" onClick={(e) => handleScroll(e, 'level-3')}>Level 3</a></li>
            <li><a href="#level-4" onClick={(e) => handleScroll(e, 'level-4')}>Level 4</a></li>
          </ul>
        </nav>
      )}

      <button onClick={logout} className="logout-button">Logout</button>
    </div>
  );
};
export default Sidebar;
