// Sidebar.jsx
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";
import { useContext } from "react";
import { AuthContext } from "../AuthContext.jsx";

const I = {
  dash: <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="6" fill="currentColor"/></svg>,
  users:<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z"/></svg>,
  vid:  <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M17 10V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3l4 3V7z"/></svg>,
  doc:  <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16l4-4h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>,
  q:    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15h-2v-2h2Zm2.07-7.75-.9.92A3.5 3.5 0 0 0 12 14h-1v-1a2.5 2.5 0 0 1 .73-1.77l1.24-1.26a1.5 1.5 0 1 0-2.12-2.12 1.49 1.49 0 0 0-.43 1.06H8a3.5 3.5 0 1 1 7 0 3.2 3.2 0 0 1-.93 2.24Z"/></svg>,
  logout: <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M13 3a1 1 0 0 1 1 1v2h-2V5H6v14h6v-1h2v2a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm5.59 7.17 1.41 1.41-4.95 4.95L14 15.38 16.38 13H11v-2h5.38L14 8.62l1.05-1.05Z"/></svg>,
};

function NavList({ items }) {
  return (
    <div className="navgroup">
      {items.map(it => {
        if (it.type === 'theme') {
          return <ThemeToggle key="theme-toggle" variant="sidebar" />;
        }

        if (it.action) {
          return (
            <button
              key={it.key || it.label}
              type="button"
              className="navitem"
              onClick={it.action}
            >
              {it.icon && <span className="icon">{it.icon}</span>}
              <span>{it.label}</span>
            </button>
          );
        }

        return (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.exact}
            className={({isActive}) => `navitem ${isActive ? 'active' : ''}`}
          >
            {it.icon && <span className="icon">{it.icon}</span>}
            <span>{it.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}

export default function Sidebar({ role, open, onClose }) {
  const { logout, user } = useContext(AuthContext);
  const nav = useNavigate();
  const location = useLocation();
  const base = role === 'teacher' ? '/teacher' : '/student';
  const roleLabel = role === "teacher" ? "Coach portal" : "Learner portal";
  const handleLogout = async () => {
    await logout();
    nav('/login', { replace: true });
  };
  const jumpToStudents = () => {
    const scroll = () => {
      const el = document.getElementById("students-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (location.pathname !== "/teacher") {
      nav("/teacher");
      window.setTimeout(scroll, 120);
    } else {
      scroll();
    }
    onClose?.();
  };

  const items = role === "teacher"
    ? [
        { to: `${base}`, label: "Dashboard", icon: I.dash, exact: true },
        { key: "students", label: "Students", icon: I.users, action: jumpToStudents },
        { to: "/privacy", label: "Privacy", icon: I.doc },
        { type: "theme" },
        { key: "logout", label: "Log out", icon: I.logout, action: handleLogout },
      ]
    : [
        { to: `${base}`, label: "Dashboard", icon: I.dash, exact: true },
        { to: `${base}/videos`, label: "Videos", icon: I.vid },
        { to: `${base}/assignments`, label: "Assignments", icon: I.doc },
        { to: `${base}/questions`, label: "Questions", icon: I.q },
        { to: "/privacy", label: "Privacy", icon: I.doc },
        { type: "theme" },
        { key: "logout", label: "Log out", icon: I.logout, action: handleLogout },
      ];

  const shell = (
    <>
      <div className="sidebar-brand">
        <span className="sidebar-kicker">Forte Studio</span>
        <div className="sidebar-name">{user?.name || "Workspace"}</div>
        <div className="sidebar-role">{roleLabel}</div>
      </div>

      <NavList items={items} />

      <div className="sidebar-panel">
        <div className="sidebar-panel-title">Quick jump</div>
        <p className="muted">Keep your teaching flow focused.</p>
        <Link to={base}>{role === "teacher" ? "Open dashboard" : "Open workspace"}</Link>
        {role === "teacher" ? (
          <button type="button" className="sidebar-link-button" onClick={jumpToStudents}>
            Jump to student list
          </button>
        ) : null}
        <Link to="/privacy">Privacy and security</Link>
      </div>
    </>
  );

  return (
    <>
      <aside className="sidebar">
        {shell}
      </aside>

      <div
        className={`sidebar-drawer ${open ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        {shell}
      </div>
      <div
        className={`drawer-backdrop ${open ? 'show' : ''}`}
        onClick={onClose}
      />
    </>
  );
}
