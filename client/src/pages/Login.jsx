import React, { useState } from 'react';
import axios from '../axios.js';
import { useNavigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';



export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const {setUser} = useContext(AuthContext)


  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // 1) Perform the login
      await axios.post(
        '/auth/login',
        form
      );
      // 2) Immediately fetch the full user (including assignedTeacher)
      const {data: me} = await axios.get('/auth/me')
      setUser(me)
      setSuccess('Logged In!');
  
      // 3) Navigate based on role
      const route = me.role === 'teacher' ? '/teacher' : '/student'
      navigate(route, { replace: true });
  
    } catch (err) {
      setSuccess('');
      setError(err.response?.data?.message || 'Login failed');
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
            <button type='submit' className='btn-primary'>Log In</button>
            <button className="btn-ghost" onClick={() => navigate('/signup')}>
              Create An account
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
