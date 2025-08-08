// src/pages/Signup.jsx
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import axios from '../axios.js';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/auth/signup', form);
      setSuccess(res.data.message);
      // Redirect to login after a short delay
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create Your Account</h1>
        <p className="auth-sub">Join and start learning</p>

        <form onSubmit={handleSubmit} className="form-centered">
          <h2>Sign Up</h2>
          
          <label>Name:
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name..."
              required
              className="input"
            />
          </label>
          <label>
            Email: 
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email..."
              required
              className="input"
            />
          </label>

          <label>
            Password: 
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="input"
            />
          </label>

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="select"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>


          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}

          <div className="auth-actions">
          <button type="submit" className="btn-primary">
            Sign Up
          </button>
          <button type='button' className='btn-ghost' onClick={() => navigate('/login')}>
            I already have an account
          </button>
            
          </div>
        </form>
      </div>
    </div>
  );
}
