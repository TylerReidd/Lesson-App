import {
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from './axios'; // use your configured axios instance
import Signup from './pages/Signup';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';



function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

  useEffect(() => {
    axios
      .get('/auth/me', { withCredentials: true })
      .then(res => {
        console.log('[App] /auth/me ', res.data.user )
        setUser(res.data.user)})
      .catch(err => {
        console.log('[App] /auth/me error or 401')
        setUser(null)
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if(loading) return;
    if (user === null) {
      navigate( '/login', {replace: true})
    } else {
      const home = user.role === 'teacher' ? '/teacher' : '/student';
      if (location.pathname !== home) {
        navigate(home, {replace: true})
      }
    }
  }, [loading, user, navigate, location.pathname])

  if (loading) return <div>Loading…</div>;

  return (
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
          element={<Login onLogin={user => setUser(user)} />}
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
         element={<TeacherDashboard onLogout={() => setUser(null)} />}
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

    
  );
}

export default App;
