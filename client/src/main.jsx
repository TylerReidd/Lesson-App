import React, {useState} from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './App.css'
import { AuthContext } from './AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

function AppProvider() {
  const [user, setUser] = useState(null)
  return (
    <AuthContext.Provider value={{user, setUser}}>
      <App />
    </AuthContext.Provider>
  )
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <ErrorBoundary>
    <AppProvider />
  </ErrorBoundary>
  </BrowserRouter>
);
