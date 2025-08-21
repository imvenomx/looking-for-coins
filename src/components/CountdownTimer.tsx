"use client";
import { useState, useEffect } from "react";

interface CountdownTimerProps {
  expiresAt: string;
  onExpired?: () => void;
}

export default function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;
      
      if (diff <= 0) {
        setTimeRemaining('00:00');
        console.log('Match expired, calling onExpired callback');
        if (onExpired) {
          onExpired();
        }
        clearInterval(timer);
        return;
      }
      
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpired]);

  return (
    <div className="countdown">
      <div className="base-timer">
        <svg className="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <g className="base-timer__circle">
            <circle className="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
            <path id="base-timer-path-remaining" strokeDasharray="283" className="base-timer__path-remaining arc"
                  d="M 50, 50 m -45, 0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0"></path>
          </g>
        </svg>
        <div className="timer-label">Expire in <br/>
          <span id="base-timer-label" className="base-timer__label">
            {timeRemaining || '30:00'}
          </span>
        </div>
      </div>
    </div>
  );
}
