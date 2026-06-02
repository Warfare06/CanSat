import { useState, useEffect, Suspense } from 'react';
import CountdownTimer from '../components/dashboard/CountdownTimer';
import SensorGauge from '../components/charts/SensorGauge';
import TrajectoryChart from '../components/charts/TrajectoryChart';
import DataTerminal from '../components/dashboard/DataTerminal';
import CanSat3D from '../components/three/CanSat3D';
import './Overview.css';

// Simulated live telemetry state
function useMockTelemetry() {
  const [telemetry, setTelemetry] = useState({
    pressure: 1013.2,
    temperature: 21.5,
    humidity: 45.2,
    altitude: 856.3,
    pitch: 4.3,
    yaw: 12.1,
    roll: 25.0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        pressure: +(prev.pressure + (Math.random() - 0.5) * 1.5).toFixed(1),
        temperature: +(prev.temperature + (Math.random() - 0.5) * 0.3).toFixed(1),
        humidity: +(Math.max(20, Math.min(80, prev.humidity + (Math.random() - 0.5) * 2))).toFixed(1),
        altitude: +(Math.max(0, prev.altitude + (Math.random() - 0.6) * 5)).toFixed(1),
        pitch: +(prev.pitch + (Math.random() - 0.5) * 2).toFixed(1),
        yaw: +(prev.yaw + (Math.random() - 0.5) * 3).toFixed(1),
        roll: +(prev.roll + (Math.random() - 0.5) * 2).toFixed(1),
      }));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return telemetry;
}

export default function Overview() {
  const telemetry = useMockTelemetry();

  return (
    <div className="overview-page">
      {/* ===== HERO SECTION ===== */}
      <section className="hero-section" id="hero-section">
        <div className="hero-inner">
          {/* Left: Title */}
          <div className="hero-left">
            <h1 className="hero-title">
              <span className="hero-title-line1">ASTRA MAVEN</span>
              <span className="hero-title-line2">CANSAT MISSION</span>
            </h1>
          </div>

          {/* Center: 3D Model + Countdown */}
          <div className="hero-center">
            <CountdownTimer />
            <div className="hero-3d-container">
              <Suspense fallback={<div className="hero-3d-loading">Loading 3D Model...</div>}>
                <CanSat3D />
              </Suspense>
            </div>
          </div>

          {/* Right: Sensor Gauges Panel */}
          <div className="hero-right">
            <div className="card hero-gauges-card">
              <div className="card-header">
                <div>
                  <div className="card-title">SENSOR GAUGES</div>
                </div>
                <span className="card-icon">⚙</span>
              </div>
              <div className="hero-gauges-grid">
                <SensorGauge
                  value={telemetry.pressure}
                  min={300}
                  max={1100}
                  label="Pressure"
                  unit="hPa"
                  color="#00d4ff"
                  size={120}
                />
                <SensorGauge
                  value={telemetry.temperature}
                  min={-40}
                  max={85}
                  label="Temp"
                  unit="°C"
                  color="#ff8c00"
                  size={120}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DATA PANELS GRID ===== */}
      <section className="data-panels" id="data-panels">
        <div className="data-grid">
          {/* Panel 1: Live Trajectory */}
          <div className="card data-panel" id="panel-trajectory">
            <div className="card-header">
              <div>
                <div className="card-title">LIVE TRAJECTORY</div>
                <div className="card-subtitle">Live Ascent & Descent Trajectory</div>
              </div>
              <span className="card-icon">📈</span>
            </div>
            <div className="panel-chart-container">
              <TrajectoryChart />
            </div>
          </div>

          {/* Panel 2: Sensor Gauges Detail */}
          <div className="card data-panel" id="panel-sensors">
            <div className="card-header">
              <div>
                <div className="card-title">SENSOR GAUGES</div>
                <div className="card-subtitle">Real-time Readings</div>
              </div>
              <span className="card-icon">🔧</span>
            </div>
            <div className="panel-gauges-grid">
              <SensorGauge
                value={telemetry.pressure}
                min={300}
                max={1100}
                label="Pressure"
                unit="hPa"
                color="#00d4ff"
                size={100}
              />
              <SensorGauge
                value={telemetry.temperature}
                min={-40}
                max={85}
                label="Temp"
                unit="°C"
                color="#ff8c00"
                size={100}
              />
              <SensorGauge
                value={telemetry.humidity}
                min={0}
                max={100}
                label="Humidity"
                unit="%"
                color="#00ff88"
                size={100}
              />
              <SensorGauge
                value={telemetry.altitude}
                min={0}
                max={2000}
                label="Altitude"
                unit="m"
                color="#ff3366"
                size={100}
              />
            </div>
          </div>

          {/* Panel 3: Spatial Orientation */}
          <div className="card data-panel" id="panel-orientation">
            <div className="card-header">
              <div>
                <div className="card-title">SPATIAL ORIENTATION</div>
                <div className="card-subtitle">CanSat Orientation</div>
              </div>
              <span className="card-icon">🧭</span>
            </div>
            <div className="orientation-display">
              <div className="orientation-axis">
                <div className="orientation-ring">
                  <svg viewBox="0 0 100 100" className="orientation-svg">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                    <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                    <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                    <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                    {/* Pitch indicator */}
                    <line
                      x1="30" y1="50" x2="70" y2="50"
                      stroke="#00d4ff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      transform={`rotate(${telemetry.pitch}, 50, 50)`}
                    />
                    <text x="50" y="96" textAnchor="middle" fill="#7a8599" fontSize="6" fontFamily="Orbitron">PITCH</text>
                  </svg>
                  <div className="orientation-value text-primary">{telemetry.pitch}°</div>
                </div>
                <div className="orientation-ring">
                  <svg viewBox="0 0 100 100" className="orientation-svg">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                    <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                    <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                    <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                    {/* Roll indicator */}
                    <line
                      x1="30" y1="50" x2="70" y2="50"
                      stroke="#ff8c00"
                      strokeWidth="2"
                      strokeLinecap="round"
                      transform={`rotate(${telemetry.roll}, 50, 50)`}
                    />
                    <text x="50" y="96" textAnchor="middle" fill="#7a8599" fontSize="6" fontFamily="Orbitron">ROLL</text>
                  </svg>
                  <div className="orientation-value text-secondary-accent">{telemetry.roll}°</div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 4: Raw Data Terminal */}
          <div className="card data-panel" id="panel-terminal">
            <div className="card-header">
              <div>
                <div className="card-title">RAW DATA TERMINAL</div>
                <div className="card-subtitle">Raw Data Stream</div>
              </div>
              <span className="card-icon">⌨</span>
            </div>
            <DataTerminal />
          </div>
        </div>
      </section>

      {/* ===== BOTTOM BAR: GPS + Mission Status ===== */}
      <section className="bottom-bar" id="bottom-bar">
        <div className="card mission-status-bar">
          <div className="status-item">
            <span className="status-label">MISSION STATUS</span>
            <span className="status-value text-success">● DESCENDING</span>
          </div>
          <div className="status-item">
            <span className="status-label">SIGNAL</span>
            <span className="status-value text-primary">-45 dBm</span>
          </div>
          <div className="status-item">
            <span className="status-label">BATTERY</span>
            <span className="status-value text-secondary-accent">3.72V (85%)</span>
          </div>
          <div className="status-item">
            <span className="status-label">GPS</span>
            <span className="status-value font-mono text-primary">13.0827°N, 80.2707°E</span>
          </div>
          <div className="status-item">
            <span className="status-label">PACKETS</span>
            <span className="status-value font-mono text-success">12,847 RX</span>
          </div>
        </div>
      </section>
    </div>
  );
}
