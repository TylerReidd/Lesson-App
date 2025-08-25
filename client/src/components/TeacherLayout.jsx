// TeacherLayout.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function TeacherLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close on ESC (mobile)
  useEffect(() => {
    const onKey = (e) => (e.key === "Escape" ? setMenuOpen(false) : null);
    if (menuOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <Navbar onMenu={() => setMenuOpen(true)} isMenuOpen={menuOpen} />

      <div className="workspace">

        <Sidebar role="teacher" open={menuOpen} onClose={() => setMenuOpen(false)} />

        <main onClick={() => setMenuOpen(false)}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
