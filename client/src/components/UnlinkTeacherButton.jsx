// src/components/UnlinkTeacherButton.jsx
import React, { useContext, useState } from 'react';
import axios from '../axios.js';
import { AuthContext } from '../AuthContext';

export default function UnlinkTeacherButton({ onUnlinked }) {
  const { user, setUser } = useContext(AuthContext);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Only hide for non-students. Students always see the button.
  if (user?.role !== 'student') return null;

  const unlink = async () => {
    setBusy(true);
    setMsg('');
    setErr('');
    try {
      const { data } = await axios.delete('/auth/me/teacher', { withCredentials: true });
      setUser(data?.user ?? null);
      setMsg('Teacher unlinked.');
      onUnlinked?.();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to unlink.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <button className="button" onClick={unlink} disabled={busy}>
        {busy ? 'Unlinking…' : 'Unlink Teacher'}
      </button>
      {msg && <div style={{ color: 'green', marginTop: 6 }}>{msg}</div>}
      {err && <div style={{ color: 'red', marginTop: 6 }}>{err}</div>}
    </div>
  );
}
