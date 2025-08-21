"use client";
import { useEffect, useState } from "react";

interface MatchProgressBarProps {
  status: string;
  opponentReady?: boolean;
  matchStarted?: boolean;
  matchFinished?: boolean;
}

const statusConfig = {
  waiting: { width: 0, activeIndex: 0 },
  joined: { width: 25, activeIndex: 1 },
  ready: { width: 25, activeIndex: 1 },
  playing: { width: 50, activeIndex: 2 },
  finished: { width: 80, activeIndex: 3 },
  submitted: { width: 100, activeIndex: 4 }
};

export default function MatchProgressBar({ status, opponentReady = false, matchStarted = false, matchFinished = false }: MatchProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.waiting;
    
    // Override progress based on match state
    if (matchFinished || status === 'finished') {
      setProgress(100);
      setActiveIndex(4);
    } else if (matchStarted || status === 'playing') {
      setProgress(50);
      setActiveIndex(2);
    } else if (status === 'waiting' && opponentReady) {
      setProgress(25);
      setActiveIndex(1);
    } else if (status === 'waiting' && !opponentReady) {
      setProgress(0);
      setActiveIndex(0);
    } else {
      setProgress(config.width);
      setActiveIndex(config.activeIndex);
    }
  }, [status, opponentReady, matchStarted, matchFinished]);

  const steps = [
    { label: "Waiting", description: "Waiting for an opponent to accept this match." },
    { label: "Ready Up", description: "All players must ready up to start competing." },
    { label: "Playing", description: "Start competing now." },
    { label: "Submitting", description: "Submit your results to conclude the match." },
    { label: "Finished", description: "The match has ended." }
  ];

  return (
    <div className="match-status-bar">
      <div className="progress">
        <div className="bar2">
          <div 
            className="bar__fill" 
            style={{ 
              width: `${progress}%`,
              transition: 'width 0.5s ease-in-out'
            }}
          ></div>
        </div>
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`point ${index <= activeIndex ? 'point--active' : ''}`}
          >
            <div className="bullet"></div>
            <label className="label">{step.label}</label>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
