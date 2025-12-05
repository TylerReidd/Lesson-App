// ThemeToggle.jsx
import { useEffect, useState } from 'react';

const ICONS = {
  sun: (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 7a5 5 0 1 1-5 5 5 5 0 0 1 5-5Zm0-5 1.5 3h-3Zm0 20 1.5-3h-3ZM2 13l3-1.5v3Zm20 0-3-1.5v3ZM4.93 4.93l2.12 2.12-2.12-2.12Zm12.02 12.02 2.12 2.12-2.12-2.12Zm0-12.02 2.12 2.12-2.12-2.12ZM4.93 19.07l2.12-2.12-2.12 2.12Z"
      />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21 13.5A9.5 9.5 0 1 1 10.5 3a7.5 7.5 0 1 0 10.5 10.5Z"
      />
    </svg>
  ),
};

export default function ThemeToggle({ variant = 'button', className = '' }) {
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
  const label = dark ? 'Light mode' : 'Dark mode';
  const icon = dark ? ICONS.sun : ICONS.moon;
  const toggle = () => setDark(v => !v);

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        className={`navitem ${className}`.trim()}
        onClick={toggle}
      >
        <span className="icon">{icon}</span>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button type="button" className={`button ${className}`.trim()} onClick={toggle}>
      {label}
    </button>
  );
}
