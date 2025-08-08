import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import axios from '../axios.js';

export default function StudentLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout', {}, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      console.error('Logout Failed', err);
    }
  };

  return (
    <div className="student-layout">
      {/* Top navigation bar */}
      <Navbar />

      {/* Main content area where nested routes render */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
