// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import axios from 'axios';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import { useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/auth/me')
    .then(res => setUser(res.data.user))
    .catch(() => setUser(null))
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/signup"
          element={user ? <Navigate to={user.role==='teacher' ? '/teacher': 'student'} /> :<Signup />} />

        <Route 
          path="/login" 
          element={user ? <Navigate to={user.role==='teacher'? '/teacher':'student'} /> : <Login />} />


        <Route
          path="/student"
          element={user?.role==='student' ? <StudentDashboard /> : <Navigate to="/login" />}
        />

        <Route
          path="/teacher"
          e element={user?.role==='teacher'? <TeacherDashboard /> : <Navigate to="/login" />}
        />

        <Route path="*" element={<Navigate to={user? (user.role==='teacher'?'/teacher':'/student') : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
