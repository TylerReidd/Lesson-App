import {
  Routes,
  Route,
  BrowserRouter as Router,
  Navigate
} from 'react-router-dom';
import {  useContext } from 'react';
import Signup from './pages/Signup';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import { AuthContext } from './AuthContext';
import TeacherVideos from './components/TeacherVideos';
import TeacherAssignments from './components/TeacherAssignment';
import TeacherQuestions from './components/TeacherQuestions';
import StudentLayout from './components/StudentLayout';
import StudentVideos from './components/StudentVideos';
import StudentAssignments from './components/StudentAssignments';
import StudentQuestions from './components/StudentQuestions';
import TeacherLayout from './components/TeacherLayout';
import StudentDashboard from './pages/StudentDashboard';
import StudentVideosTabs from './components/StudentVideosTabs';


function App() {
  const {user, setUser, loading} = useContext(AuthContext)




  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route
          path="/signup"
          element={<Signup />}
        />
        
        <Route
          path="/login"
          element={<Login /> }
        />

        {/* Student page routes */}
        <Route
          path="/student"
          element={
           <PrivateRoute user={user} role="student">
            <StudentLayout />
           </PrivateRoute>
          }
        >
          <Route path='videos' element={<StudentVideos />} />
          <Route path='assignments' element={<StudentAssignments/>} />
          <Route path='questions' element={<StudentQuestions />} />
        </Route>
        
        {/* Teacher page Route */}
        <Route
         path="/teacher"
         element={
          <PrivateRoute user={user} role="teacher">
            <TeacherLayout />
          </PrivateRoute>}
        >
          <Route path='videos' element={<TeacherVideos />} />
          <Route path='assignments' element={<TeacherAssignments />} />
          <Route path='questions' element={<TeacherQuestions />} />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to={
                user
                  ? (user.role === 'teacher' ? '/teacher/videos' : '/student')
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
