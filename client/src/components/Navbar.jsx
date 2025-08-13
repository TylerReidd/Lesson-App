import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import axios from "../axios.js";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      try { localStorage.removeItem('token'); } catch {}
      setUser(null);
      navigate("/login", { replace: true });
    } catch {
      // ignore
    }
  };

  // You can tweak these links as needed
  const links = user?.role === "teacher"
    ? [
        { to: "/teacher", label: "Dashboard" },
        { to: "/teacher/videos", label: "Videos" },
        { to: "/teacher/assignments", label: "Assignments" },
        { to: "/teacher/questions", label: "Questions" },
      ]
    : [
        { to: "/student", label: "Dashboard" },
        { to: "/student/videos", label: "Videos" },
        { to: "/student/assignments", label: "Assignments" },
        { to: "/student/questions", label: "Questions" },
      ];

  return (
    <header className="top-tab-bar">
      <div className="nav-inner">
        <Link to={user ? (user.role === "teacher" ? "/teacher" : "/student") : "/"} className="brand">
         Forte
        </Link>

        {/* Hamburger (visible on mobile) */}
        <button
          className="hamburger"
          aria-label="Toggle menu"
          aria-expanded={open ? "true" : "false"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>

        {/* Links */}
        <nav className={`nav-links ${open ? "open" : ""}`} onClick={() => setOpen(false)}>
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="tab">
              {l.label}
            </Link>
          ))}
          {user ? (
            <button className="button-logout" onClick={handleLogout}>Log out</button>
          ) : (
            <Link to="/login" className="tab">Log in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
