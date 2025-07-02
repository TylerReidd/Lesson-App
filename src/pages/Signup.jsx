import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student' });
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/signup', form);
      // optional: auto-login and redirect
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };


  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </select>
      <button type="submit">Signup</button>
    </form>
  );
}

export default Signup;