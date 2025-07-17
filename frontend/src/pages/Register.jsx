import React, { useState, useContext } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/pages.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', student_id: '' });
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/');
    } catch {
      alert('Registration failed');
    }
  };

  return (
    <div className="page-container">
      <form className="form-card" onSubmit={handleSubmit}>
      <h2>Register</h2>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <input name="student_id" placeholder="Student ID" value={form.student_id} onChange={handleChange} required />
        <button type="submit">Register</button>
        <p onClick={()=>navigate('/login')}>Already have an account? Login</p>
        <Link to="/" className="logout-btn">Home</Link>
      </form>
    </div>
  );
};
export default Register;