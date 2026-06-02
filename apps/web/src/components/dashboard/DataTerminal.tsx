import { useState, useEffect, useRef } from 'react';
import './DataTerminal.css';

interface TerminalLine {
  id: number;
  timestamp: string;
  data: string;
  type: 'info' | 'data' | 'success' | 'warning';
}

export default function DataTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const lineCounter = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const ts = now.toLocaleTimeString('en-US', { hour12: false }) + '.' + now.getMilliseconds().toString().padStart(3, '0');

      const sampleLines: Omit<TerminalLine, 'id' | 'timestamp'>[] = [
        { data: `RX PKT #${1200 + lineCounter.current} | P:${(1013 + Math.random() * 2 - 1).toFixed(1)}hPa T:${(21 + Math.random() * 2).toFixed(1)}°C ALT:${(800 + Math.random() * 50).toFixed(1)}m`, type: 'data' },
        { data: `GPS FIX: ${(13.0827 + Math.random() * 0.001).toFixed(6)},${(80.2707 + Math.random() * 0.001).toFixed(6)} SAT:${8 + Math.floor(Math.random() * 3)}`, type: 'info' },
        { data: `IMU: Ax:${(Math.random() * 0.1 - 0.05).toFixed(3)}g Ay:${(Math.random() * 0.1 - 0.05).toFixed(3)}g Az:${(9.8 + Math.random() * 0.1).toFixed(3)}g`, type: 'data' },
        { data: `RSSI: -${42 + Math.floor(Math.random() * 10)}dBm | BATT: ${(3.7 + Math.random() * 0.3).toFixed(2)}V (${85 + Math.floor(Math.random() * 10)}%)`, type: 'success' },
        { data: `STATE: DESCENDING | SEQ: ${lineCounter.current * 10 + Math.floor(Math.random() * 10)}`, type: 'warning' },
      ];

      const sample = sampleLines[lineCounter.current % sampleLines.length];
      lineCounter.current++;

      setLines((prev) => {
        const newLine: TerminalLine = {
          id: lineCounter.current,
          timestamp: ts,
          ...sample,
        };
        const updated = [...prev, newLine];
        return updated.slice(-50); // Keep last 50 lines
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="data-terminal" id="raw-data-terminal">
      <div className="terminal-content" ref={terminalRef}>
        {lines.map((line) => (
          <div key={line.id} className={`terminal-line terminal-line--${line.type}`}>
            <span className="terminal-ts">{line.timestamp}</span>
            <span className="terminal-arrow">{'>'}</span>
            <span className="terminal-data">{line.data}</span>
          </div>
        ))}
        <span className="terminal-cursor">_</span>
      </div>
    </div>
  );
}
