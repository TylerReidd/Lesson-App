import React, { useState, useContext } from 'react';
import axios from '../axios.js';
import { AuthContext } from '../AuthContext';

export default function LinkTeacherForm() {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLink = async e => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        '/auth/me/teacher',
        { teacherEmail: email },
        { withCredentials: true }
      );
      console.log('linkTeacher response:', data);
      setUser(u => ({ ...u, assignedTeacher: data.assignedTeacher }));
      setError(null);
      setSuccess('Teacher linked!');   // add a success message
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Link failed');
      setSuccess(null);
    }
  };

  return (
    <form onSubmit={handleLink}>
      <h2>Link Your Teacher</h2>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Teacher's email"
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Link Teacher</button>
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
}
