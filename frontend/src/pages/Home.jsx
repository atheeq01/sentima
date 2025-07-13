import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components.css';

const Home = () => (
  <div className="home-page">
    <h1>Welcome to the Student Review System</h1>
    <p><Link to="/login">Login</Link> or <Link to="/register">Register as Student</Link></p>
  </div>
);

export default Home;