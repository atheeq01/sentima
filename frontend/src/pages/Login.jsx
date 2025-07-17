import React, { useState, useContext } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import "../styles/components.css";

import '../styles/pages.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await login(email, password);

     
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  return (
    <div className="page-container">
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <p onClick={() => navigate('/register')}>Don't have an account? Register</p>
        <Link to="/" className="logout-btn">Home</Link>
      </form>

    </div>
  );
};

export default Login;
