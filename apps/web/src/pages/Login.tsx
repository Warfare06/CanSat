import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to admin
  if (isAuthenticated) {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    setLoading(false);

    if (success) {
      navigate('/admin');
    } else {
      setError('Invalid credentials. Access denied.');
    }
  };

  return (
    <div className="login-page" id="login-page">
      {/* Background grid effect */}
      <div className="login-grid-bg" />

      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <div className="login-lock-icon">
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
              <rect x="12" y="28" width="40" height="28" rx="4" stroke="#00d4ff" strokeWidth="2"/>
              <path d="M22 28V20C22 14.477 26.477 10 32 10V10C37.523 10 42 14.477 42 20V28" stroke="#ff8c00" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="32" cy="40" r="4" fill="#00d4ff"/>
              <line x1="32" y1="44" x2="32" y2="50" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="login-title">MISSION CONTROL</h1>
          <p className="login-subtitle">Administrator Authentication Required</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" id="admin-login-form">
          <div className="login-field">
            <label htmlFor="login-email" className="login-label">IDENTIFIER</label>
            <input
              id="login-email"
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="warfareyt2@gmail.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password" className="login-label">ACCESS KEY</label>
            <input
              id="login-password"
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="login-error" id="login-error">
              <span className="login-error-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            id="login-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="login-spinner" />
            ) : (
              <>AUTHENTICATE →</>
            )}
          </button>
        </form>

        {/* Security info */}
        <div className="login-security">
          <div className="login-security-row">
            <span className="login-security-icon">🔒</span>
            <span>256-bit TLS Encrypted</span>
          </div>
          <div className="login-security-row">
            <span className="login-security-icon">⏱</span>
            <span>15-min session timeout</span>
          </div>
          <div className="login-security-row">
            <span className="login-security-icon">🛡</span>
            <span>Rate-limited to 10 attempts</span>
          </div>
        </div>

        <p className="login-demo-hint">
          Credentials: warfareyt2@gmail.com / Abbi@123
        </p>
      </div>
    </div>
  );
}
