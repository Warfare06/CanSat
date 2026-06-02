import { useEffect, useRef } from 'react';
import './SensorGauge.css';

interface SensorGaugeProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  color?: string;
  size?: number;
}

export default function SensorGauge({
  value,
  min,
  max,
  label,
  unit,
  color = '#00d4ff',
  size = 140,
}: SensorGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animatedValue = useRef(min);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 12;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const totalAngle = endAngle - startAngle;

    let animFrame: number;
    const targetValue = Math.max(min, Math.min(max, value));

    function draw() {
      ctx!.clearRect(0, 0, size, size);

      // Ease toward target
      animatedValue.current += (targetValue - animatedValue.current) * 0.08;
      const progress = (animatedValue.current - min) / (max - min);
      const currentAngle = startAngle + totalAngle * progress;

      // Background arc
      ctx!.beginPath();
      ctx!.arc(cx, cy, radius, startAngle, endAngle);
      ctx!.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx!.lineWidth = 6;
      ctx!.lineCap = 'round';
      ctx!.stroke();

      // Value arc with gradient
      if (progress > 0.001) {
        const gradient = ctx!.createLinearGradient(0, size, size, 0);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, adjustBrightness(color, 1.3));
        ctx!.beginPath();
        ctx!.arc(cx, cy, radius, startAngle, currentAngle);
        ctx!.strokeStyle = gradient;
        ctx!.lineWidth = 6;
        ctx!.lineCap = 'round';
        ctx!.stroke();

        // Glow effect
        ctx!.beginPath();
        ctx!.arc(cx, cy, radius, startAngle, currentAngle);
        ctx!.strokeStyle = color + '40';
        ctx!.lineWidth = 14;
        ctx!.lineCap = 'round';
        ctx!.stroke();
      }

      // Tick marks
      for (let i = 0; i <= 10; i++) {
        const tickAngle = startAngle + (totalAngle / 10) * i;
        const isMajor = i % 5 === 0;
        const innerR = radius - (isMajor ? 14 : 10);
        const outerR = radius - 8;
        const x1 = cx + Math.cos(tickAngle) * innerR;
        const y1 = cy + Math.sin(tickAngle) * innerR;
        const x2 = cx + Math.cos(tickAngle) * outerR;
        const y2 = cy + Math.sin(tickAngle) * outerR;

        ctx!.beginPath();
        ctx!.moveTo(x1, y1);
        ctx!.lineTo(x2, y2);
        ctx!.strokeStyle = isMajor ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)';
        ctx!.lineWidth = isMajor ? 2 : 1;
        ctx!.stroke();
      }

      // Needle dot at current position
      const dotX = cx + Math.cos(currentAngle) * radius;
      const dotY = cy + Math.sin(currentAngle) * radius;
      ctx!.beginPath();
      ctx!.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx!.fillStyle = color;
      ctx!.shadowColor = color;
      ctx!.shadowBlur = 10;
      ctx!.fill();
      ctx!.shadowBlur = 0;

      if (Math.abs(animatedValue.current - targetValue) > 0.01) {
        animFrame = requestAnimationFrame(draw);
      }
    }

    animFrame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrame);
  }, [value, min, max, color, size]);

  function adjustBrightness(hex: string, factor: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.min(255, Math.round(r * factor))}, ${Math.min(255, Math.round(g * factor))}, ${Math.min(255, Math.round(b * factor))})`;
  }

  return (
    <div className="sensor-gauge" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="sensor-gauge-canvas"
      />
      <div className="sensor-gauge-overlay">
        <span className="gauge-value" style={{ fontSize: size * 0.16, color }}>
          {value.toFixed(1)}
        </span>
        <span className="gauge-unit" style={{ fontSize: size * 0.08 }}>
          {unit}
        </span>
        <span className="gauge-label" style={{ fontSize: size * 0.065 }}>
          {label}
        </span>
      </div>
    </div>
  );
}
