import React, { useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';


export default function Login({onLogin}) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const {setUser} = useContext(AuthContext)

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(
        '/auth/login',
        form,
        { withCredentials: true }
      );
      setSuccess(res.data.message);

      onLogin(res.data.user)

      const route = res.data.user.role === 'teacher' ? '/teacer' : '/student'

      navigate(route, {
        replace: true
      })

      const role = res.data.user.role;
      navigate(role === "teacher" ? "/teacher" : "/student", {
        replace: true
      });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <div>
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

        <div>
          <label htmlFor="password" className="block mb-1">Password:</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
        </div>

        <button
          type="submit">Login</button>
      </form>
    </div>
  );
}
