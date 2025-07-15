import React from "react";
import { Link } from "react-router-dom";
import "../styles/components.css";

const Navbar = () => {
  return (
    <div className="navbar">
      <h2>Student Feedback System</h2>
      <div className="nav-links">
        <Link to="/" className="logout-btn">Home</Link>
      </div>
    </div>
  );
};

export default Navbar;
