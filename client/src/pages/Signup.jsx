// src/pages/Signup.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import axios from '../axios.js';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      // 1) Create account → server returns { token, user }
      const res = await axios.post('/auth/signup', form);

      // 2) Store token so axios sends Authorization: Bearer on mobile
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
      }

      // 3) Fetch canonical user (works via cookie on desktop or Bearer on mobile)
      const { data: me } = await axios.get('/auth/me');
      const user = me?.user ?? me;
      setUser(user);

      setSuccess(res.data?.message || 'Account created!');
      // 4) Route by role
      const route = user?.role === 'teacher' ? '/teacher' : '/student';
      navigate(route, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setSubmitting(false);
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

          <label>Email:
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

          <label>Password:
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
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Sign Up'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => navigate('/login')}>
              I already have an account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
