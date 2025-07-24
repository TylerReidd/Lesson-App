// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from './axios';

export const AuthContext = createContext({
  user: null,
  setUser: () =>{},
  loading: true,
});

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/auth/me')           // axios instance already has withCredentials:true
      .then(r => setUser(r.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {loading? <div>Loading..</div> : children}
    </AuthContext.Provider>
  );
}
