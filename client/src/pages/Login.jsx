// src/pages/Login.jsx
import React, { useState, useContext, useEffect } from 'react';
import axios from '../axios.js';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  // Clear any stale cookie so role-switching behaves
  useEffect(() => {
    axios.post('/auth/logout').catch(() => {});
    localStorage.removeItem('token')
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await axios.post('/auth/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      // Save token for Bearer fallback (mobile); cookie is also set by server
      if (res.data?.token) localStorage.setItem('token', res.data.token);

      const user = res.data?.user;
      if (!user) throw new Error('No user returned from login');

      setUser(user);
      setSuccess('Logged in!');

      // Route by the fresh login response (avoid /auth/me for this first hop)
      navigate(user.role === 'teacher' ? '/teacher' : '/student', { replace: true });
    } catch (err) {
      setSuccess('');
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">Log in to manage lessons and files</p>

        <form onSubmit={handleLogin} className="form-centered">
          <label>
            Email:
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password:
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </label>

          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}

          <div className="auth-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Log In'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => navigate('/signup')}>
              Create an account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
