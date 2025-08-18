// ThemeToggle.jsx
import { useEffect, useState } from 'react';
export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    // optional: persist
    try { localStorage.setItem('forte.dark', dark ? '1' : '0'); } catch {}
  }, [dark]);
  useEffect(() => {
    const saved = localStorage.getItem('forte.dark');
    if (saved) setDark(saved === '1');
  }, []);
  return (
    <button className="button" onClick={() => setDark(v => !v)}>
      {dark ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
