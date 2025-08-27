// Sidebar.jsx
import { NavLink } from "react-router-dom";

const I = {
  dash: <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="6" fill="currentColor"/></svg>,
  users:<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z"/></svg>,
  vid:  <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M17 10V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3l4 3V7z"/></svg>,
  doc:  <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16l4-4h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>,
  q:    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15h-2v-2h2Zm2.07-7.75-.9.92A3.5 3.5 0 0 0 12 14h-1v-1a2.5 2.5 0 0 1 .73-1.77l1.24-1.26a1.5 1.5 0 1 0-2.12-2.12 1.49 1.49 0 0 0-.43 1.06H8a3.5 3.5 0 1 1 7 0 3.2 3.2 0 0 1-.93 2.24Z"/></svg>,
};

function NavList({ items }) {
  return (
    <div className="navgroup">
      {items.map(it => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.exact}
          className={({isActive}) => `navitem ${isActive ? 'active' : ''}`}
        >
          <span className="icon">{it.icon}</span>
          <span>{it.label}</span>
        </NavLink>
      ))}
    </div>
  );
}

export default function Sidebar({ role, open, onClose }) {
  const base = role === 'teacher' ? '/teacher' : '/student';
  const items = [
    { to: `${base}`, label:'Dashboard', icon:I.dash, exact:true },
    { to: `${base}/videos`, label:'Videos', icon:I.vid },
    { to: `${base}/assignments`, label:'Assignments', icon:I.doc },
    { to: `${base}/questions`, label:'Questions', icon:I.q },
    { to: '/privacy', label: 'Privay Policy',}
  ];

  return (
    <>
      {/* Desktop sidebar (hidden on mobile via CSS) */}
      <aside className="sidebar">
        <NavList items={items} />
      </aside>

      {/* Mobile drawer + backdrop */}
      <div
        className={`sidebar-drawer ${open ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <NavList items={items} />
      </div>
      <div
        className={`drawer-backdrop ${open ? 'show' : ''}`}
        onClick={onClose}
      />
    </>
  );
}
