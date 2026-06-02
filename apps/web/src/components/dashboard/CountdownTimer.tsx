import { useState, useEffect } from 'react';
import './CountdownTimer.css';

interface CountdownTimerProps {
  targetDate?: Date;
  label?: string;
}

export default function CountdownTimer({
  targetDate,
  label = 'UNTIL LAUNCH',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      if (targetDate) {
        const diff = targetDate.getTime() - Date.now();
        if (diff <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
          return;
        }
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      } else {
        // Demo mode: count down from 00:00:15 and loop
        setTimeLeft((prev) => {
          const totalSec = prev.hours * 3600 + prev.minutes * 60 + prev.seconds;
          if (totalSec <= 0) return { hours: 0, minutes: 10, seconds: 0 };
          const next = totalSec - 1;
          return {
            hours: Math.floor(next / 3600),
            minutes: Math.floor((next % 3600) / 60),
            seconds: next % 60,
          };
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="countdown" id="countdown-timer">
      <span className="countdown-label">T-MINUS</span>
      <div className="countdown-digits">
        <span className="countdown-segment">
          <span className="countdown-number">{pad(timeLeft.hours)}</span>
        </span>
        <span className="countdown-colon">:</span>
        <span className="countdown-segment">
          <span className="countdown-number">{pad(timeLeft.minutes)}</span>
        </span>
        <span className="countdown-colon">:</span>
        <span className="countdown-segment">
          <span className="countdown-number">{pad(timeLeft.seconds)}</span>
        </span>
      </div>
      <span className="countdown-sublabel">{label}</span>
    </div>
  );
}
