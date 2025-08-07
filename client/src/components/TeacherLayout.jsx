import { Outlet, Link, useNavigate, NavLink } from "react-router-dom";
import axios from "../axios.js";

export default function TeacherLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="student-layout">
      <nav className="top-tab-bar card">
        <NavLink to='videos'
        className={({isActive}) => 
          isActive ? 'tab active' : 'tab'
          }
        >
            Videos 
          </NavLink>

          <NavLink 
            to='assignments'
            className={({isActive}) => 
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
        
        <button onClick={handleLogout} className=" tab button-logout">
          Logout
        </button>
      </nav>

      <main className="content">
        <Outlet /> {/* renders the current teacher page */}
      </main>
    </div>
  );
}
