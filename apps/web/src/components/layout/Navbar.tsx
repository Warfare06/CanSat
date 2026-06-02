import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const navItems = [
  { path: '/', label: 'Overview' },
  { path: '/the-cansat', label: 'The CanSat' },
  { path: '/technology', label: 'Technology' },
  { path: '/sensors', label: 'Sensors' },
  { path: '/team', label: 'Team' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  return (
    <header className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo" aria-label="CanSat Home">
          <div className="navbar-logo-icon">
            <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
              <ellipse cx="32" cy="32" rx="28" ry="10" stroke="url(#nav-grad)" strokeWidth="1.5" transform="rotate(-20 32 32)" opacity="0.7"/>
              <rect x="22" y="18" width="20" height="28" rx="4" stroke="#00d4ff" strokeWidth="2"/>
              <line x1="32" y1="18" x2="32" y2="10" stroke="#ff8c00" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="32" cy="8" r="2.5" fill="#ff8c00"/>
              <defs>
                <linearGradient id="nav-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff"/>
                  <stop offset="100%" stopColor="#ff8c00"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="navbar-logo-text">
            <span className="navbar-brand">CANSAT</span>
            <span className="navbar-subtitle">ORBITAL TEAM</span>
          </div>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="navbar-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          <div className="live-badge" id="live-data-badge">
            <span className="live-badge-text">LIVE DATA</span>
            <span className="status-dot status-dot--live"></span>
          </div>

          {/* Admin / Login */}
          {isAuthenticated && isAdmin ? (
            <div className="navbar-admin-group">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `nav-link admin-link ${isActive ? 'active' : ''}`
                }
              >
                🛡 ADMIN
              </NavLink>
              <button className="navbar-logout-btn" onClick={logout} title="Logout">
                ✕
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="nav-link login-link" id="nav-login-btn">
              🔐 LOGIN
            </NavLink>
          )}

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? 'active' : ''}`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
        {isAuthenticated && isAdmin ? (
          <>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              🛡 Admin Dashboard
            </NavLink>
            <button
              className="mobile-nav-link"
              onClick={() => { logout(); setMobileMenuOpen(false); }}
              style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#ff3366' }}
            >
              Logout
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? 'active' : ''}`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            🔐 Admin Login
          </NavLink>
        )}
      </div>
    </header>
  );
}
