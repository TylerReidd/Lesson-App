// Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";
import { AuthContext } from "../AuthContext.jsx";
import { useContext } from "react";

export default function Navbar(){
  const { user, setUser, logout } = useContext(AuthContext);
  const nav = useNavigate();
  const page = user?.role === 'teacher' ? 'Teacher Dashboard' : user ? 'Student Dashboard' : 'Welcome';

  const handleLogout = async () => {
    await logout()
    nav('/login', { replace:true });
  };

  const dashPath = user?.role === 'teacher' ? '/teacher' : '/student';

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to={dashPath} className="brand">Forte</Link>
        <div className="page-title"></div>
        <div className="spacer" />
        <ThemeToggle />
        {user
          ? <button className="button-primary" onClick={handleLogout}>Log out</button>
          : <Link className="button" to="/login">Log in</Link>
        }
      </div>
    </header>
  );
}
