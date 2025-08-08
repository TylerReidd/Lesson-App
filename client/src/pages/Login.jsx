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
    <div className='container'>
      <div className="card">
        <form onSubmit={handleLogin}>

          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}

          <div className='form-group'>
            <h2 style={{marginBottom: '10px'}}>Login</h2>
            <label htmlFor="email" className="block mb-1">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor="password" className>Password:</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            <button type="submit" className='button'>Login</button>
          </div>

          <p className="text-sm mt-4">
              Don’t have an account?{' '}
            <Link to="/signup" className="text-blue-500 underline">
              Sign up here
            </Link>
      </p>

        </form>

      </div>
    </div>
  );
}
