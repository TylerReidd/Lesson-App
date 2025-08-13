import React, { useState, useContext } from 'react';
import axios from '../axios.js';
import { AuthContext } from '../AuthContext';

export default function LinkTeacherForm({onLinked}) {
  const {user, setUser} = useContext(AuthContext)
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (user?.role !== 'student' || user?.assignedTeacher) {
    return null;
  }

  const handleLink = async e => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        '/auth/me/teacher',
        { teacherEmail: email },
        { withCredentials: true }
      );
      const me = data?.user
      ? data.user
      : (await axios.get('/auth/me/full', {withCredentials: true})).data?.user
      console.log('linkTeacher response:', data);
      onLinked?.(me)
      setUser(me);
      setError(null);
      setSuccess('Teacher linked!');
      setEmail('')
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
