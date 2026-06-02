import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DataTerminal from '../components/dashboard/DataTerminal';
import './Admin.css';

// Mock mission data
const mockMissions = [
  { id: 'M-001', name: 'ALPHA-1', status: 'active', packets: 12847, startedAt: '2024-10-15T09:30:00Z', altitude: 856.3 },
  { id: 'M-002', name: 'BETA-TEST', status: 'completed', packets: 45230, startedAt: '2024-10-10T14:00:00Z', altitude: 0 },
  { id: 'M-003', name: 'PRE-FLIGHT-3', status: 'draft', packets: 0, startedAt: '', altitude: 0 },
];

const mockContacts = [
  { id: 1, name: 'Prof. Sharma', email: 'sharma@university.edu', message: 'Interested in partnering for the ISRO competition...', time: '2h ago', read: false },
  { id: 2, name: 'Rahul K.', email: 'rahul@student.com', message: 'I would like to join the team as a firmware engineer...', time: '5h ago', read: false },
  { id: 3, name: 'Sponsor Lead', email: 'partners@aerotech.com', message: 'Re: Platinum sponsorship discussion follow-up', time: '1d ago', read: true },
  { id: 4, name: 'ESA Coordinator', email: 'cansat@esa.int', message: 'Registration confirmation for 2025 CanSat competition', time: '2d ago', read: true },
];

function SystemHealthPanel() {
  const [health, setHealth] = useState({
    cpu: 23,
    memory: 41,
    mqttConnected: true,
    dbLatency: 3.2,
    wsClients: 12,
    uptime: '4d 7h 23m',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setHealth((prev) => ({
        ...prev,
        cpu: Math.max(5, Math.min(80, prev.cpu + (Math.random() - 0.5) * 6)),
        memory: Math.max(20, Math.min(70, prev.memory + (Math.random() - 0.5) * 3)),
        dbLatency: +(Math.max(1, prev.dbLatency + (Math.random() - 0.5) * 1)).toFixed(1),
        wsClients: Math.max(1, prev.wsClients + Math.floor((Math.random() - 0.5) * 3)),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-health-grid">
      <div className="health-item">
        <div className="health-bar-wrap">
          <div className="health-bar" style={{ width: `${health.cpu}%`, background: health.cpu > 60 ? '#ff3366' : '#00d4ff' }} />
        </div>
        <div className="health-info">
          <span className="health-label">CPU</span>
          <span className="health-value">{health.cpu.toFixed(0)}%</span>
        </div>
      </div>
      <div className="health-item">
        <div className="health-bar-wrap">
          <div className="health-bar" style={{ width: `${health.memory}%`, background: '#ff8c00' }} />
        </div>
        <div className="health-info">
          <span className="health-label">MEMORY</span>
          <span className="health-value">{health.memory.toFixed(0)}%</span>
        </div>
      </div>
      <div className="health-stat">
        <span className="health-stat-value" style={{ color: health.mqttConnected ? '#00ff88' : '#ff3366' }}>
          {health.mqttConnected ? '● CONNECTED' : '● DISCONNECTED'}
        </span>
        <span className="health-label">MQTT BROKER</span>
      </div>
      <div className="health-stat">
        <span className="health-stat-value">{health.dbLatency}ms</span>
        <span className="health-label">DB LATENCY</span>
      </div>
      <div className="health-stat">
        <span className="health-stat-value">{health.wsClients}</span>
        <span className="health-label">WS CLIENTS</span>
      </div>
      <div className="health-stat">
        <span className="health-stat-value">{health.uptime}</span>
        <span className="health-label">UPTIME</span>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'missions' | 'contacts' | 'logs'>('overview');
  const [mockGeneratorActive, setMockGeneratorActive] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="admin-page page-container" id="admin-dashboard">
      {/* Admin Header */}
      <section className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-title">
            <span className="admin-title-icon">🛡</span>
            MISSION CONTROL
          </h1>
          <p className="admin-subtitle">
            Authenticated as <strong className="text-primary">{user.username}</strong> • {user.role.toUpperCase()}
          </p>
        </div>
        <div className="admin-header-right">
          <button className="btn btn-ghost" onClick={logout} id="admin-logout">
            LOGOUT →
          </button>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        {(['overview', 'missions', 'contacts', 'logs'] as const).map((tab) => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && '📊 '}
            {tab === 'missions' && '🚀 '}
            {tab === 'contacts' && '📬 '}
            {tab === 'logs' && '⌨ '}
            {tab.toUpperCase()}
            {tab === 'contacts' && (
              <span className="tab-badge">{mockContacts.filter((c) => !c.read).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <div className="admin-overview">
            {/* System Health */}
            <div className="card admin-card">
              <div className="card-header">
                <div>
                  <div className="card-title">SYSTEM HEALTH</div>
                  <div className="card-subtitle">Server Infrastructure</div>
                </div>
                <span className="admin-status-badge admin-status-badge--online">
                  ALL SYSTEMS NOMINAL
                </span>
              </div>
              <SystemHealthPanel />
            </div>

            {/* Quick Stats */}
            <div className="admin-stats-row">
              <div className="card admin-stat-card">
                <div className="admin-stat-number text-primary">12,847</div>
                <div className="admin-stat-label">TOTAL PACKETS</div>
              </div>
              <div className="card admin-stat-card">
                <div className="admin-stat-number text-secondary-accent">3</div>
                <div className="admin-stat-label">MISSIONS</div>
              </div>
              <div className="card admin-stat-card">
                <div className="admin-stat-number text-success">1</div>
                <div className="admin-stat-label">ACTIVE FLIGHTS</div>
              </div>
              <div className="card admin-stat-card">
                <div className="admin-stat-number" style={{ color: '#aa66ff' }}>{mockContacts.filter((c) => !c.read).length}</div>
                <div className="admin-stat-label">UNREAD MSGS</div>
              </div>
            </div>

            {/* Mock Data Controls */}
            <div className="card admin-card">
              <div className="card-header">
                <div>
                  <div className="card-title">MOCK DATA GENERATOR</div>
                  <div className="card-subtitle">Simulate CanSat Descent</div>
                </div>
              </div>
              <div className="mock-controls">
                <p className="mock-desc">
                  Starts a simulated 10-minute CanSat flight with realistic ISA atmosphere
                  model, GPS drift, and sensor noise. Data is broadcast via Socket.IO in real-time.
                </p>
                <div className="mock-actions">
                  <button
                    className={`btn ${mockGeneratorActive ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => setMockGeneratorActive(!mockGeneratorActive)}
                    id="mock-toggle"
                  >
                    {mockGeneratorActive ? '⬜ STOP GENERATOR' : '▶ START GENERATOR'}
                  </button>
                  <span className={`mock-status ${mockGeneratorActive ? 'active' : ''}`}>
                    {mockGeneratorActive ? '● Generating at 10Hz...' : '○ Idle'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== MISSIONS TAB ===== */}
        {activeTab === 'missions' && (
          <div className="admin-missions">
            <div className="card admin-card">
              <div className="card-header">
                <div>
                  <div className="card-title">MISSION REGISTRY</div>
                  <div className="card-subtitle">All Missions</div>
                </div>
                <button className="btn btn-primary" id="create-mission-btn">+ NEW MISSION</button>
              </div>
              <div className="mission-table">
                <div className="mission-table-header">
                  <span>ID</span>
                  <span>NAME</span>
                  <span>STATUS</span>
                  <span>PACKETS</span>
                  <span>STARTED</span>
                  <span>ACTIONS</span>
                </div>
                {mockMissions.map((m) => (
                  <div key={m.id} className="mission-table-row">
                    <span className="font-mono text-muted">{m.id}</span>
                    <span className="mission-name">{m.name}</span>
                    <span>
                      <span className={`mission-status-badge mission-status--${m.status}`}>
                        {m.status.toUpperCase()}
                      </span>
                    </span>
                    <span className="font-mono">{m.packets.toLocaleString()}</span>
                    <span className="text-muted">{m.startedAt ? new Date(m.startedAt).toLocaleDateString() : '—'}</span>
                    <span className="mission-actions">
                      <button className="btn btn-ghost mission-action-btn">View</button>
                      {m.status === 'active' && (
                        <button className="btn btn-ghost mission-action-btn" style={{ color: '#ff3366' }}>Stop</button>
                      )}
                      {m.status === 'draft' && (
                        <button className="btn btn-primary mission-action-btn">Launch</button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Telemetry Export */}
            <div className="card admin-card">
              <div className="card-header">
                <div>
                  <div className="card-title">DATA EXPORT</div>
                  <div className="card-subtitle">Download Telemetry Logs</div>
                </div>
              </div>
              <div className="export-controls">
                <div className="export-row">
                  <span className="export-label">Mission ALPHA-1 • 12,847 packets • 2.4 MB</span>
                  <div className="export-btns">
                    <button className="btn btn-ghost">CSV</button>
                    <button className="btn btn-ghost">JSON</button>
                    <button className="btn btn-primary">DOWNLOAD ALL</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== CONTACTS TAB ===== */}
        {activeTab === 'contacts' && (
          <div className="admin-contacts">
            <div className="card admin-card">
              <div className="card-header">
                <div>
                  <div className="card-title">CONTACT MESSAGES</div>
                  <div className="card-subtitle">{mockContacts.length} total • {mockContacts.filter((c) => !c.read).length} unread</div>
                </div>
              </div>
              <div className="contact-list">
                {mockContacts.map((c) => (
                  <div key={c.id} className={`contact-row ${!c.read ? 'unread' : ''}`}>
                    <div className="contact-indicator">
                      {!c.read && <span className="contact-unread-dot" />}
                    </div>
                    <div className="contact-info">
                      <div className="contact-header-row">
                        <span className="contact-name">{c.name}</span>
                        <span className="contact-time">{c.time}</span>
                      </div>
                      <span className="contact-email">{c.email}</span>
                      <p className="contact-preview">{c.message}</p>
                    </div>
                    <div className="contact-actions">
                      <button className="btn btn-ghost">Reply</button>
                      <button className="btn btn-ghost" style={{ color: '#ff3366' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== LOGS TAB ===== */}
        {activeTab === 'logs' && (
          <div className="admin-logs">
            <div className="card admin-card admin-terminal-card">
              <div className="card-header">
                <div>
                  <div className="card-title">RAW TELEMETRY STREAM</div>
                  <div className="card-subtitle">Live MQTT Ingestion Log</div>
                </div>
                <span className="admin-status-badge admin-status-badge--online">STREAMING</span>
              </div>
              <div className="admin-terminal-container">
                <DataTerminal />
              </div>
            </div>

            {/* Server Logs */}
            <div className="card admin-card">
              <div className="card-header">
                <div>
                  <div className="card-title">SERVER AUDIT LOG</div>
                  <div className="card-subtitle">Recent Events</div>
                </div>
              </div>
              <div className="audit-log">
                {[
                  { time: '13:02:19', event: 'Auth login success', user: 'admin@cansatorbital.com', type: 'auth' },
                  { time: '13:01:45', event: 'Telemetry batch insert', user: 'system', type: 'data' },
                  { time: '13:01:30', event: 'MQTT packet received (QoS 1)', user: 'broker', type: 'mqtt' },
                  { time: '13:00:12', event: 'Socket.IO client connected', user: '10.125.99.17', type: 'ws' },
                  { time: '12:58:44', event: 'Token refresh issued', user: 'admin@cansatorbital.com', type: 'auth' },
                  { time: '12:55:00', event: 'Telemetry compression complete', user: 'system', type: 'data' },
                  { time: '12:50:33', event: 'Health check passed', user: 'monitor', type: 'system' },
                ].map((log, i) => (
                  <div key={i} className="audit-row">
                    <span className="audit-time font-mono">{log.time}</span>
                    <span className={`audit-type audit-type--${log.type}`}>{log.type.toUpperCase()}</span>
                    <span className="audit-event">{log.event}</span>
                    <span className="audit-user font-mono text-muted">{log.user}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
