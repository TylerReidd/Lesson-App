// src/pages/Signup.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from '../axios.js';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function Signup() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const dest = user.role === 'teacher' ? '/teacher/videos' : '/student/videos';
      navigate(dest, { replace: true });
    }
  }, [user, loading, navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/auth/signup', form);
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <form onSubmit={handleSubmit} className="form-group">
          <h2>Sign Up</h2>

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}

          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="input"
          />

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="input"
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="input"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="select"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          <button type="submit" className="btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
