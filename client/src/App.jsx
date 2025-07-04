import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from './axios'; // use your configured axios instance

import Signup from './pages/Signup';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

// function App() {
//   return (
//     <div className="min-h-screen bg-red-500 flex items-center justify-center">
//       <h1 className="text-white text-3xl">🌵 Tailwind Is Working! 🌵</h1>
//     </div>
//   );
// }

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/auth/me', { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading…</div>;



  return (

    
    <Router>
      <Routes>
        <Route
          path="/signup"
          element={
            user
              ? <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />
              : <Signup />
          }
        />

        <Route
          path="/login"
          element={
            user
              ? <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />
              : <Login />
          }
        />

        <Route
          path="/student"
          element={
            user?.role === 'student'
              ? <StudentDashboard />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/teacher"
          element={
            user?.role === 'teacher'
              ? <TeacherDashboard />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={
                user
                  ? (user.role === 'teacher' ? '/teacher' : '/student')
                  : '/login'
              }
              replace
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
