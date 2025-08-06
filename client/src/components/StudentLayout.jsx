import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
      <nav className="top-tab-bar card">
        <NavLink
          to="videos"
          className={({ isActive }) =>
            isActive ? 'tab active' : 'tab'
          }
        >
          🎥 Videos
        </NavLink>
        <NavLink
          to="assignments"
          className={({ isActive }) =>
            isActive ? 'tab active' : 'tab'
          }
        >
          📄 Assignments
        </NavLink>
        <NavLink
          to="questions"
          className={({ isActive }) =>
            isActive ? 'tab active' : 'tab'
          }
        >
          ❓ Q&A
        </NavLink>
        <button
          className="tab button-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>

      {/* Main content area where nested routes render */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
