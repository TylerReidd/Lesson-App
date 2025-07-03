import React, { useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [form,    setForm]    = useState({ name:'', email:'', password:'', role:'student' });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const navigate             = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/auth/signup', form);
      // console.log(res.data); // --> { message: 'User created successfully', user: {…} }
      setSuccess(res.data.message);
      // optionally delay redirect so they see the message
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Sign Up</h2>

      {error   && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <input
        name="name"
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
  );
}
