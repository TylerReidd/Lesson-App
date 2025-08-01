import { Outlet, Link, useNavigate } from "react-router-dom";
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
    <div className="container">
      <nav className="navbar card">
        <ul className="video-list">
          <li><Link to="/teacher/videos">Videos</Link></li>
          <li><Link to="/teacher/assignments">Assignments</Link></li>
          <li><Link to="/teacher/questions">Q&A</Link></li>
        </ul>
        <button onClick={handleLogout} className="button-logout">
          Logout
        </button>
      </nav>
      <main>
        <Outlet /> {/* renders the current teacher page */}
      </main>
    </div>
  );
}
