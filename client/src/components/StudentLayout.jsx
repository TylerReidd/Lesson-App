import { Outlet} from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import {useState, useEffect} from 'react';

export default function StudentLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => (e.key === 'Escape' ? setMenuOpen(false) : null);
    if(menuOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <>
      <Navbar onMenu={() => setMenuOpen(!menuOpen)}
      isMenuOpen={menuOpen} />

      <div className="workspace">
        <Sidebar role='student' open={menuOpen} onClose={() => setMenuOpen(false)}/>

      <main onClick={() => setMenuOpen(false)}>
        <Outlet />
      </main>
      </div>
    </>
  );
}
