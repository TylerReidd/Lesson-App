// // Navbar.jsx
// import { Link, useNavigate } from "react-router-dom";
// import ThemeToggle from "./ThemeToggle.jsx";
// import { AuthContext } from "../AuthContext.jsx";
// import { useContext } from "react";

// export default function Navbar({ onMenu, isMenuOpen }) {
//   const { user, logout } = useContext(AuthContext);
//   const nav = useNavigate();
//   const dashPath = user?.role === 'teacher' ? '/teacher' : '/student';

//   const handleLogout = async () => {
//     await logout();
//     nav('/login', { replace: true });
//   };

//   return (
//     <header className="topbar">
//       <div className="topbar-inner">
//         {/* Mobile hamburger */}
//         <button
//           className="hamburger"
//           onClick={onMenu}
//           aria-label="Open menu"
//           aria-expanded={isMenuOpen ? 'true' : 'false'}
//         >
//           {/* menu icon */}
//           <svg viewBox="0 0 24 24" aria-hidden="true">
//             <path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
//           </svg>
//         </button>

//         <Link to={dashPath} className="brand">Forte</Link>
//         <div className="spacer" />
//         <ThemeToggle />
//         {user
//           ? <button className="button-primary" onClick={handleLogout}>Log out</button>
//           : <Link className="button" to="/login">Log in</Link>
//         }
//       </div>
//     </header>
//   );
// }
// // Navbar.jsx
import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell.jsx";
import { AuthContext } from "../AuthContext.jsx";
import { useContext } from "react";

export default function Navbar({ onMenu, isMenuOpen }) {
  const { user } = useContext(AuthContext);
  const dashPath = user?.role === 'teacher' ? '/teacher' : '/student';
  const roleLabel = user?.role === "teacher" ? "Teacher workspace" : "Student workspace";

  return (
    <header className="topbar">
      <div className="topbar-inner">
        {/* Mobile hamburger */}
        <button
          className="hamburger"
          onClick={onMenu}
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
        >
          {/* menu icon */}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
          </svg>
        </button>

        <div className="brand-wrap">
          <Link to={dashPath} className="brand">Forte</Link>
          <span className="brand-meta">{roleLabel}</span>
        </div>
        <div className="spacer" />
        <NotificationBell />
      </div>
    </header>
  );
}
