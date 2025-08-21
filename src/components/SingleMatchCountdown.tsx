"use client";
import { useState, useEffect } from "react";

interface SingleMatchCountdownProps {
  expiresAt: string;
  onExpired?: () => void;
  stopped?: boolean;
}

export default function SingleMatchCountdown({ expiresAt, onExpired, stopped }: SingleMatchCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState('');

  const calculateTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;
    
    if (diff <= 0) return '00:00';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Calculate initial time
    setTimeRemaining(calculateTimeRemaining(expiresAt));

    // Don't start interval if stopped
    if (stopped) {
      return;
    }

    // Set up interval to update every second
    const interval = setInterval(() => {
      const newTime = calculateTimeRemaining(expiresAt);
      setTimeRemaining(newTime);
      
      // If time has expired, clear the interval and call onExpired
      if (newTime === '00:00') {
        clearInterval(interval);
        if (onExpired) {
          onExpired();
        }
      }
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [expiresAt, onExpired, stopped]);

  return (
    <div className="timer-area">
      <i className="fas fa-stopwatch"></i>
      <h5>Expires in<br/><span>{timeRemaining || '30:00'}</span></h5>
    </div>
  );
}
