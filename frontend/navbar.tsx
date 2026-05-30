import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '◈' },
  { to: '/transactions', label: 'Transakcje', icon: '⇅' },
  { to: '/accounts', label: 'Konta', icon: '◎' },
];

export default function Navbar() {
  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        <span style={S.logo}>
          <span style={S.logoIcon}>₿</span>
          <span style={S.logoText}>budget<span style={S.logoAccent}>.</span></span>
        </span>
        <div style={S.links}>
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                ...S.link,
                ...(isActive ? S.linkActive : {}),
              })}
            >
              <span style={S.linkIcon}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap');
      `}</style>
    </nav>
  );
}

const C = {
  bg: '#0e0f11',
  surface: '#16181c',
  border: '#272a30',
  accent: '#c8f55a',
  text: '#f0f0ee',
  muted: '#6b7280',
};

const S: Record<string, React.CSSProperties> = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: 'rgba(14,15,17,0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: `1px solid ${C.border}`,
    fontFamily: '"DM Mono", monospace',
  },
  inner: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '0 24px',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
  },
  logoIcon: {
    fontSize: 18,
    color: C.accent,
  },
  logoText: {
    fontFamily: '"DM Serif Display", serif',
    fontSize: 20,
    color: C.text,
    letterSpacing: '-0.02em',
  },
  logoAccent: {
    color: C.accent,
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '6px 14px',
    borderRadius: 8,
    fontSize: 13,
    color: C.muted,
    textDecoration: 'none',
    border: '1px solid transparent',
    transition: 'color 0.15s, background 0.15s, border-color 0.15s',
  },
  linkActive: {
    color: C.accent,
    background: 'rgba(200,245,90,0.08)',
    borderColor: 'rgba(200,245,90,0.2)',
  },
  linkIcon: {
    fontSize: 14,
  },
};