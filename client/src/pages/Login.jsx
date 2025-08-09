// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      // 1) Login: get { token, user }
      const res = await axios.post('/auth/login', form);

      // 2) Save token immediately so axios interceptor adds Authorization: Bearer
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
      }

      // 3) Fetch full user (works on desktop cookies or mobile Bearer)
      const { data: me } = await axios.get('/auth/me');
      const user = me?.user ?? me;
      setUser(user);
      setSuccess('Logged In!');

      // 4) Route by role
      const route = user?.role === 'teacher' ? '/teacher' : '/student';
      navigate(route, { replace: true });
    } catch (err) {
      setSuccess('');
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='auth-page'>
      <div className="auth-card">
        <h1 className='auth-title'>Welcome Back</h1>
        <p className="auth-sub">Log in to manage lessons and files</p>

        <form onSubmit={handleLogin} className='form-centered'>
          <label>Email:
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              autoComplete='email'
              required
            />
          </label>

          <label>Password:
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </label>

          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}

          <div className="auth-actions">
            <button type='submit' className='btn-primary' disabled={submitting}>
              {submitting ? 'Logging in…' : 'Log In'}
            </button>
            {/* prevent accidental form submit */}
            <button type="button" className="btn-ghost" onClick={() => navigate('/signup')}>
              Create An account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
