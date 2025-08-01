import {
  Routes,
  Route,
  BrowserRouter as Router,
  Navigate
} from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import axios from './axios'; // use your configured axios instance
import Signup from './pages/Signup';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import PrivateRoute from './components/PrivateRoute';
import { AuthContext } from './AuthContext';



function App() {
  const {user, setUser, loading} = useContext(AuthContext)




  return (
    <Router basename={import.meta.env.BASE_URL}>
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
          element={<Login /> }
        />

        <Route
          path="/student"
          element={
           <PrivateRoute user={user} role="student">
            <StudentDashboard onLogout={() => setUser(null)} />
           </PrivateRoute>
          }
        />

        <Route
          path="/teacher"
         element={
          <PrivateRoute user={user} role="teacher">
            <TeacherDashboard onLogout={() => setUser(null)} />
          </PrivateRoute>}
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
