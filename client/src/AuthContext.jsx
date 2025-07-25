// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from './axios';

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  loading: true,
});



export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const {data} = await axios.get('/auth/me', {withCredentials: true})
        setUser(data.user)
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, []);

  if (loading) {
    return <div>Loading…</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
