// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from './axios.js';

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

function setToken(t) {
  if (t) localStorage.setItem('token', t);
}
function clearToken() {
  localStorage.removeItem('token');
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    try {
      const res = await axios.get('/auth/me/full');
      // your /auth/me returns {id, role, ...}; normalize to user obj
      setUser(res.data?.user ?? res.data ?? null);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    (async () => {
      await refreshMe();
      setLoading(false);
    })();
  }, []);

  // ---- NEW: methods ----
  async function login(email, password) {
    const res = await axios.post('/auth/login', { email, password });
    if (res.data?.token) setToken(res.data.token); // Bearer for mobile
    setUser(res.data.user);
    return res.data.user;
  }

  async function signup({ name, email, password, role = 'student' }) {
    const res = await axios.post('/auth/signup', { name, email, password, role });
    if (res.data?.token) setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  async function logout() {
    try { await axios.post('/auth/logout'); } catch {}
    clearToken();
    setUser(null);
  }

  if (loading) return <div>Loading…</div>;

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
