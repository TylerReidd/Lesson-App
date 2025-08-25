import React, {useState} from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './App.css'

import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './AuthContext';

createRoot(document.getElementById('root')).render(

  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>

);
