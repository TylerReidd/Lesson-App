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
    <form onSubmit={handleLink} className="form student-link-card">
      <div className="dashboard-copy">
        <h2 className="h2">Link your teacher</h2>
        <p className="muted">Use your teacher&apos;s account email to connect your workspace.</p>
      </div>

      <label className="field">
        <span>Teacher email</span>
        <input
          className="input"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="teacher@example.com"
          required
        />
      </label>

      {error && <p className="form-note error">{error}</p>}
      {success && <p className="form-note success">{success}</p>}

      <div className="students-actions">
        <button type="submit" className="button-primary">Link Teacher</button>
      </div>
    </form>
  );
}
