"use client";

import Image from "next/image";
import Header from "@/components/Header";
import SingleMatchCountdown from "@/components/SingleMatchCountdown";
import MatchProgressBar from "@/components/MatchProgressBar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabaseClient";
import Swal from 'sweetalert2';

interface Match {
  id: string;
  user_id: string;
  opponent_id?: string;
  opponent_epic_username?: string;
  winner_id?: string;
  opponent_name?: string;
  match_date: string;
  result: string | null;
  betting_amount: number;
  created_at: string;
  game_mode: string;
  is_public: boolean;
  first_to: number;
  platform: string;
  region: string;
  team_size: number;
  match_type?: string;
  entry_fee?: number;
  prize?: string;
  status?: string;
  expires_at?: string;
}

const gameModeTitles: { [key: string]: string } = {
  boxfights: 'Box Fight',
  buildfights: 'Build Fight',
  realistic: 'Realistic',
  zerobuild: 'Zero Build',
  zonewars: 'Zone Wars',
  killrace: 'Kill Race',
  creative: 'Creative',
  battleroyale: 'Battle Royale'
};

const platformNames: { [key: string]: string } = {
  pc: 'PC',
  console: 'Console',
  mobile: 'Mobile',
  any: 'Any Platform'
};

const regionNames: { [key: string]: string } = {
  nae: 'NA East',
  naw: 'NA West',
  nac: 'NA Central',
  eu: 'Europe',
  asia: 'Asia',
  oce: 'Oceania',
  br: 'Brazil'
};

export default function MatchPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [hostProfile, setHostProfile] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [opponentProfile, setOpponentProfile] = useState<any>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [epicUsername, setEpicUsername] = useState<string>('');
  const [hostEpicUsername, setHostEpicUsername] = useState<string>('');
  const [opponentEpicUsername, setOpponentEpicUsername] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [matchStarted, setMatchStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<'host' | 'opponent' | ''>('');
  const [submittingResult, setSubmittingResult] = useState(false);
  const [resultStatus, setResultStatus] = useState<'waiting' | 'finished' | 'disputed'>('waiting');
  const [hasSubmittedResult, setHasSubmittedResult] = useState(false);

  useEffect(() => {
    document.body.classList.add("single-match");
    
    const fetchMatch = async () => {
      try {
        const response = await fetch(`/api/matches/${params.id}`);
        if (!response.ok) {
          throw new Error('Match not found');
        }
        const data = await response.json();
        setMatch(data.match);
        setOpponentReady(data.match.opponent_ready || false);
        
        // Set host and opponent profiles from API response
        if (data.match.host) {
          setHostProfile(data.match.host);
          setProfileLoading(false);
        }
        if (data.match.opponent) {
          setOpponentProfile(data.match.opponent);
        }
        
        // Set Epic usernames from API response
        
        if (data.match.host_epic_username) {
          setHostEpicUsername(data.match.host_epic_username);
          // Always set epicUsername to host Epic username when user is the host
          if (user?.id === data.match.user_id) {
            setEpicUsername(data.match.host_epic_username);
          }
        } else {
          setHostEpicUsername('No Epic Account');
          if (user?.id === data.match.user_id) {
            setEpicUsername('No Epic Account');
          }
        }
        
        if (data.match.opponent_epic_username) {
          setOpponentEpicUsername(data.match.opponent_epic_username);
        } else {
          setOpponentEpicUsername('No Epic Account');
        }

        // Set match started state based on status
        if (data.match.status === 'playing') {
          setMatchStarted(true);
        }
        
        if (data.match.status === 'finished') {
          setResultStatus('finished');
          setGameOver(true);
        } else if (data.match.status === 'disputed') {
          setResultStatus('disputed');
          setGameOver(true);
        }
        
        // Check if current user has already submitted a result
        const currentUserId = user?.id;
        if (currentUserId === data.match.user_id && data.match.host_result) {
          setHasSubmittedResult(true);
        } else if (currentUserId === data.match.opponent_id && data.match.opponent_result) {
          setHasSubmittedResult(true);
        }
      } catch (err) {
        console.error('Failed to load match:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();

    // Set up polling for real-time updates
    const interval = setInterval(fetchMatch, 3000); // Poll every 3 seconds
    setPollingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [params.id]);

  // Epic username is now fetched from the match API response

  // Opponent data is now fetched from the match API response

  // Host data is now fetched from the match API response


  const handleMatchExpired = () => {
    setIsExpired(true);
  };

  const handleReadyToggle = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      
      const newReadyState = !isReady;
      
      // Update ready state in database (you'll need to add a ready column to matches table)
      const response = await fetch(`/api/matches/${params.id}/ready`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ ready: newReadyState })
      });
      
      if (response.ok) {
        setIsReady(newReadyState);
        setOpponentReady(newReadyState);
      }
    } catch (error) {
      console.error('Failed to update ready state:', error);
    }
  };

  const handleSubmitResult = async () => {
    if (!selectedWinner) return;
    
    setSubmittingResult(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      
      const response = await fetch(`/api/matches/${params.id}/submit-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ winner: selectedWinner })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setHasSubmittedResult(true);
        if (data.status === 'finished') {
          setResultStatus('finished');
          setShowResultModal(false);
          setGameOver(true);
          
          // Show congratulations modal if current user won
          if (data.match.winner_id === user?.id) {
            const prizeAmount = parseFloat(data.match.prize) || 0;
            Swal.fire({
              title: 'Congratulations!',
              html: `<div style="color: #fff; font-size: 18px; text-align: center;">
                       <p style="margin-bottom: 15px;">🎉 You won!</p>
                       <p style="color: #28a745; font-weight: bold; font-size: 24px;">
                         Prize: $${prizeAmount.toFixed(2)}
                       </p>
                     </div>`,
              icon: 'success',
              background: '#1a1a1a',
              color: '#fff',
              iconColor: '#28a745',
              confirmButtonColor: '#28a745',
              confirmButtonText: 'Awesome!',
              allowOutsideClick: false
            });
            
            // Trigger balance refresh in navbar
            window.dispatchEvent(new CustomEvent('balanceUpdate'));
          }
        } else if (data.status === 'disputed') {
          setResultStatus('disputed');
          setShowResultModal(false);
          setHasSubmittedResult(true);
        } else {
          // Result submitted but waiting for other party
          setShowResultModal(false);
        }
        // Update match state
        setMatch(data.match);
      }
    } catch (error) {
      console.error('Failed to submit result:', error);
    } finally {
      setSubmittingResult(false);
    }
  };

  const copyUsername = async (username: string) => {
    try {
      await navigator.clipboard.writeText(username);
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: `Copied "${username}" to clipboard`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#fff',
        iconColor: '#28a745'
      });
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = username;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: `Copied "${username}" to clipboard`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#fff',
        iconColor: '#28a745'
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `Created Today at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`;
    } else {
      return `Created ${date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })} at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`;
    }
  };

  if (loading) {
    return (
      <>
        <Header showVideoBackground={false} />
        <div className="profilehero">
          <div className="match-details">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!match) {
    return (
      <>
        <Header showVideoBackground={false} />
        <div className="profilehero">
          <div className="match-details">
            <div className="text-center" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2>Match Not Found</h2>
              <p>The match you are looking for does not exist.</p>
              <button onClick={() => router.push('/matches')} className="btn btn-primary mt-3">
                Back to Matches
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header showVideoBackground={false} />
      <div className="profilehero">
      <div className="match-details">
                <span className="match-date">{formatDate(match.created_at)}</span>
                <h2 className="match-title">{match.team_size}v{match.team_size} {gameModeTitles[match.game_mode] || match.game_mode}</h2>
                <div className="price-tools">
                    <div className="entry">Entry <br></br><span><img src="/assets/img/logo.png"/> {(match.entry_fee || match.betting_amount).toFixed(2)}</span></div>
                    <i className="fas fa-chevron-right"></i>
                    <div className="prize">Prize <br></br><span><img src="/assets/img/logo.png"/> +{match.prize || ((match.entry_fee || match.betting_amount) * 2 * 0.85).toFixed(2)}</span></div>
                </div>
                <div className="match-meta">
                    <div className="single-meta">
                        <div className="meta-icon"><i className="fas fa-gamepad"></i></div>
                        <div className="meta-det">
                            <p>Platform</p>
                            <h3>{platformNames[match.platform] || match.platform}</h3>
                        </div>
                    </div>
                    <div className="single-meta">
                        <div className="meta-icon"><i className="fas fa-globe"></i></div>
                        <div className="meta-det">
                            <p>Region</p>
                            <h3>{regionNames[match.region] || match.region}</h3>
                        </div>
                    </div>
                    <div className="single-meta">
                        <div className="meta-icon"><i className="fas fa-dice"></i></div>
                        <div className="meta-det">
                            <p>Game Mode</p>
                            <h3>{gameModeTitles[match.game_mode] || match.game_mode}</h3>
                        </div>
                    </div>
                    <div className="single-meta">
                        <div className="meta-icon"><i className="fas fa-medal"></i></div>
                        <div className="meta-det">
                            <p>First to</p>
                            <h3>{match.first_to} Wins</h3>
                        </div>
                    </div>
                </div>
                <MatchProgressBar status={match.status || 'waiting'} opponentReady={opponentReady} matchStarted={matchStarted} matchFinished={resultStatus === 'finished'} />
            </div>
      </div>
      <div className="content">
            <section className="single-match-area">
                <div className="container">
                        <div className="match-dash">
                            <div className="match-players">
                                <div className="match-single-player">
                                    <div className="team-pin">
                                        <div className="teamname">
                                            <h6>Creating team</h6>
                                            <span>TEAM STIFF</span>
                                        </div>
                                    </div>
                                    <div className="player-card">
                                        <div className="player-avatar">
                                            {profileLoading ? (
                                              <div style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '50%',
                                                backgroundColor: '#333',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                animation: 'pulse 2s infinite'
                                              }}>
                                                <div style={{
                                                  width: '30px',
                                                  height: '30px',
                                                  border: '2px solid #555',
                                                  borderTop: '2px solid #007bff',
                                                  borderRadius: '50%',
                                                  animation: 'spin 1s linear infinite'
                                                }}></div>
                                              </div>
                                            ) : (
                                              <img 
                                                src={hostProfile?.profile_picture_url ? hostProfile.profile_picture_url : '/assets/img/banana.jpg'} 
                                                alt="Host Avatar"
                                                onError={(e) => {
                                                  const target = e.target as HTMLImageElement;
                                                  target.src = '/assets/img/banana.jpg';
                                                }}
                                              />
                                            )}
                                        </div>
                                        <div className="player-meta">
                                            {profileLoading ? (
                                              <div style={{
                                                height: '24px',
                                                width: '150px',
                                                backgroundColor: '#333',
                                                borderRadius: '4px',
                                                marginBottom: '8px',
                                                animation: 'pulse 2s infinite'
                                              }}></div>
                                            ) : (
                                              <h3>
                                              {hostProfile?.discord_username || hostProfile?.full_name || 'Host'}{user?.id === match?.user_id ? ' (Me)' : ''}
                                              {match?.status === 'finished' && match?.winner_id === match?.user_id && (
                                                <span style={{
                                                  backgroundColor: '#28a745',
                                                  color: '#fff',
                                                  padding: '4px 8px',
                                                  borderRadius: '4px',
                                                  fontSize: '12px',
                                                  fontWeight: 'bold',
                                                  marginLeft: '10px',
                                                  textTransform: 'uppercase'
                                                }}>
                                                  Winner
                                                </span>
                                              )}
                                            </h3>
                                            )}
                                            {profileLoading ? (
                                              <div style={{
                                                height: '18px',
                                                width: '120px',
                                                backgroundColor: '#333',
                                                borderRadius: '4px',
                                                animation: 'pulse 2s infinite'
                                              }}></div>
                                            ) : (
                                              <p>Playing as <span>{hostEpicUsername || 'No Epic Account'}</span><i 
                                                className="far fa-clone"
                                                style={{ cursor: 'pointer', marginLeft: '8px' }}
                                                onClick={() => copyUsername(hostEpicUsername || 'No Epic Account')}
                                                title="Copy username"
                                              ></i></p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="match-single-player">
                                    <div className="team-pin">
                                        <div className="teamname">
                                            <h6>Joining team</h6>
                                            <span>{match?.opponent_name === 'Waiting for opponent' ? 'WAITING FOR OPPONENT' : 'OPPONENT JOINED'}</span>
                                        </div>
                                    </div>
                                    <div className="player-card">
                                        {!match?.opponent_id || !opponentProfile ? (
                                            <div className="placeholder-content">
                                                <div className="placeholder-content_item"></div>
                                                <div className="placeholder-content_item"></div>
                                                <div className="placeholder-content_item"></div>
                                                <div className="placeholder-content_item"></div>
                                                <div className="placeholder-content_item"></div>
                                                <div className="placeholder-content_item"></div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="player-avatar">
                                                    <img 
                                                      src={opponentProfile?.profile_picture_url ? opponentProfile.profile_picture_url : '/assets/img/banana.jpg'} 
                                                      alt="Opponent Avatar"
                                                      onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = '/assets/img/banana.jpg';
                                                      }}
                                                    />
                                                </div>
                                                <div className="player-meta">
                                                    <h3>
                                                      {opponentProfile?.discord_username || opponentProfile?.full_name || 'Opponent'}{user?.id === match?.opponent_id ? ' (Me)' : ''}
                                                      {match?.status === 'finished' && match?.winner_id === match?.opponent_id && (
                                                        <span style={{
                                                          backgroundColor: '#28a745',
                                                          color: '#fff',
                                                          padding: '4px 8px',
                                                          borderRadius: '4px',
                                                          fontSize: '12px',
                                                          fontWeight: 'bold',
                                                          marginLeft: '10px',
                                                          textTransform: 'uppercase'
                                                        }}>
                                                          Winner
                                                        </span>
                                                      )}
                                                    </h3>
                                                    <p>Playing as <span>{opponentEpicUsername || 'No Epic Account'}</span>
                                                        <i 
                                                            className="far fa-clone" 
                                                            style={{ cursor: 'pointer', marginLeft: '8px' }}
                                                            onClick={() => copyUsername(opponentEpicUsername || 'No Epic Account')}
                                                            title="Copy username"
                                                        ></i>
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="match-control">
                                <div className="match-countdown">
                                    {match?.status !== 'finished' && (
                                      <SingleMatchCountdown 
                                        expiresAt={match.expires_at || new Date(Date.now() + 30 * 60 * 1000).toISOString()} 
                                        onExpired={handleMatchExpired}
                                        stopped={matchStarted}
                                      />
                                    )}
                                    {/* Ready button for opponent (non-host) */}
                                    {user?.id !== match?.user_id && match?.opponent_name !== 'Waiting for opponent' && (
                                        <div className="ready-button-container" style={{ marginTop: '20px', textAlign: 'center' }}>
                                            <button
                                                onClick={matchStarted && !hasSubmittedResult && resultStatus !== 'finished' ? () => setShowResultModal(true) : handleReadyToggle}
                                                disabled={resultStatus === 'finished' || hasSubmittedResult || resultStatus === 'disputed'}
                                                className={`shareresults ready-button ${isReady ? 'ready' : 'not-ready'}`}
                                                style={{
                                                    padding: '15px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    cursor: (resultStatus === 'finished' || hasSubmittedResult || resultStatus === 'disputed') ? 'not-allowed' : 'pointer',
                                                    fontSize: '16px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: resultStatus === 'finished' ? '#6c757d' : (resultStatus === 'disputed' ? '#ff6b35' : (hasSubmittedResult ? '#ffc107' : (matchStarted ? '#dc3545' : (isReady ? '#28a745' : '#007bff')))),
                                                    color: resultStatus === 'finished' ? '#999' : '#fff',
                                                    transition: 'all 0.3s ease',
                                                    opacity: (resultStatus === 'finished' || hasSubmittedResult || resultStatus === 'disputed') ? 0.6 : 1,
                                                    width: '100%',
                                                    display: 'block'
                                                }}
                                            >
                                                {resultStatus === 'finished' ? 'Game Finished' : (resultStatus === 'disputed' ? 'Waiting for moderator to join' : (hasSubmittedResult ? 'Waiting for opponent...' : (matchStarted ? 'Submit Results' : (isReady ? 'Ready!' : 'Ready?'))))}
                                            </button>
                                        </div>
                                    )}
                                    {user?.id === match?.user_id && (
                                        <>
                                            {!matchStarted && !gameOver && (
                                                <div className="votecancel" style={{ marginBottom: '10px' }}>
                                                    <span 
                                                        className="shareresults"
                                                        style={{ 
                                                            cursor: opponentReady ? 'pointer' : 'not-allowed',
                                                            opacity: opponentReady ? 1 : 0.5,
                                                            backgroundColor: opponentReady ? '#28a745' : '#6c757d',
                                                            padding: '15px',
                                                            borderRadius: '6px',
                                                            display: 'block',
                                                            marginBottom: '10px',
                                                            width: '100%'
                                                        }}
                                                        onClick={async () => {
                                                            if (!opponentReady) return;
                                                            
                                                            try {
                                                                const { data: { session } } = await supabase.auth.getSession();
                                                                if (!session?.access_token) return;
                                                                
                                                                const response = await fetch(`/api/matches/${params.id}/start`, {
                                                                    method: 'POST',
                                                                    headers: {
                                                                        'Content-Type': 'application/json',
                                                                        'Authorization': `Bearer ${session.access_token}`
                                                                    }
                                                                });
                                                                
                                                                const responseData = await response.json();
                                                                
                                                                if (response.ok) {
                                                                    setMatchStarted(true);
                                                                    setMatch(responseData.match);
                                                                }
                                                            } catch (error) {
                                                                console.error('Failed to start match:', error);
                                                            }
                                                        }}
                                                    >
                                                        Start Match
                                                    </span>
                                                </div>
                                            )}
                                            {((matchStarted && !gameOver) || resultStatus === 'disputed') && (
                                                <div className="votecancel">
                                                    <span 
                                                        className="votecancel"
                                                        style={{
                                                            cursor: (hasSubmittedResult || resultStatus === 'disputed') ? 'not-allowed' : 'pointer',
                                                            color: '#fff',
                                                            backgroundColor: resultStatus === 'disputed' ? '#ff6b35' : (hasSubmittedResult ? '#ffc107' : '#dc3545'),
                                                            padding: '15px',
                                                            borderRadius: '6px',
                                                            display: 'block',
                                                            marginBottom: '10px',
                                                            opacity: (hasSubmittedResult || resultStatus === 'disputed') ? 0.6 : 1,
                                                            width: '100%'
                                                        }}
                                                        onClick={() => {
                                                            if (!hasSubmittedResult && resultStatus !== 'disputed') {
                                                                setShowResultModal(true);
                                                            }
                                                        }}
                                                    >
                                                        {resultStatus === 'disputed' ? 'Waiting for moderator to join' : (hasSubmittedResult ? 'Waiting for opponent...' : 'Submit Results')}
                                                    </span>
                                                </div>
                                            )}
                                            {resultStatus !== 'disputed' && (
                                            <div className="votecancel">
                                                <span 
                                                    className="votecancel"
                                                    style={{ 
                                                        cursor: match?.status === 'finished' ? 'not-allowed' : 'pointer',
                                                        opacity: match?.status === 'finished' ? 0.6 : 1,
                                                        backgroundColor: match?.status === 'finished' ? '#6c757d' : '#dc3545',
                                                        color: match?.status === 'finished' ? '#999' : '#fff'
                                                    }}
                                                    onClick={async () => {
                                                        if (match?.status === 'finished') return;
                                                        
                                                        if (confirm('Are you sure you want to cancel this match?')) {
                                                        try {
                                                            const { data: { session } } = await supabase.auth.getSession();
                                                            if (!session?.access_token) {
                                                                Swal.fire({
                                                                    toast: true,
                                                                    position: 'bottom-end',
                                                                    icon: 'warning',
                                                                    title: 'Please log in to cancel match',
                                                                    showConfirmButton: false,
                                                                    timer: 4000,
                                                                    timerProgressBar: true,
                                                                    background: '#1a1a1a',
                                                                    color: '#fff',
                                                                    iconColor: '#ffc107'
                                                                });
                                                                return;
                                                            }

                                                            const res = await fetch(`/api/matches/${match.id}`, { 
                                                                method: 'DELETE',
                                                                headers: {
                                                                    'Authorization': `Bearer ${session.access_token}`
                                                                }
                                                            });
                                                            
                                                            if (res.ok) {
                                                                const data = await res.json();
                                                                Swal.fire({
                                                                    toast: true,
                                                                    position: 'bottom-end',
                                                                    icon: 'success',
                                                                    title: `Match cancelled! ${data.refundAmount} coins refunded to your balance.`,
                                                                    showConfirmButton: false,
                                                                    timer: 4000,
                                                                    timerProgressBar: true,
                                                                    background: '#1a1a1a',
                                                                    color: '#fff',
                                                                    iconColor: '#28a745'
                                                                });
                                                                router.push('/matches');
                                                            } else {
                                                                const errorData = await res.json();
                                                                Swal.fire({
                                                                    toast: true,
                                                                    position: 'bottom-end',
                                                                    icon: 'error',
                                                                    title: `Failed to cancel match: ${errorData.error}`,
                                                                    showConfirmButton: false,
                                                                    timer: 4000,
                                                                    timerProgressBar: true,
                                                                    background: '#1a1a1a',
                                                                    color: '#fff',
                                                                    iconColor: '#dc3545'
                                                                });
                                                            }
                                                        } catch (error) {
                                                            console.error('Error cancelling match:', error);
                                                            Swal.fire({
                                                                toast: true,
                                                                position: 'bottom-end',
                                                                icon: 'error',
                                                                title: 'Failed to cancel match. Please try again.',
                                                                showConfirmButton: false,
                                                                timer: 4000,
                                                                timerProgressBar: true,
                                                                background: '#1a1a1a',
                                                                color: '#fff',
                                                                iconColor: '#dc3545'
                                                            });
                                                        }
                                                    }
                                                }}
                                            >
                                                {match?.status === 'finished' ? 'Game Finished' : 'Cancel Match'}
                                            </span>
                                        </div>
                                        )}
                                        </>
                                    )}

                                {/* Result Submission Modal */}
                                {showResultModal && (
                                    <div style={{
                                        position: 'fixed',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        zIndex: 1000
                                    }}>
                                        <div style={{
                                            backgroundColor: '#1a1a1a',
                                            padding: '30px',
                                            borderRadius: '10px',
                                            border: '2px solid #333',
                                            maxWidth: '500px',
                                            width: '90%',
                                            textAlign: 'center'
                                        }}>
                                            {resultStatus === 'disputed' ? (
                                                <>
                                                    <div style={{ marginBottom: '20px' }}>
                                                        <div style={{
                                                            width: '50px',
                                                            height: '50px',
                                                            border: '3px solid #f3f3f3',
                                                            borderTop: '3px solid #007bff',
                                                            borderRadius: '50%',
                                                            animation: 'spin 1s linear infinite',
                                                            margin: '0 auto 20px'
                                                        }}></div>
                                                    </div>
                                                    <h3 style={{ color: '#fff', marginBottom: '20px' }}>Results Conflict Detected</h3>
                                                    <p style={{ color: '#ccc', marginBottom: '20px' }}>
                                                        There was a conflict in submitting results. A moderator will join you shortly to resolve it.
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <h3 style={{ color: '#fff', marginBottom: '20px' }}>Submit the Results</h3>
                                                    <p style={{ color: '#ccc', marginBottom: '30px' }}>Who won this match?</p>
                                                    
                                                    <div style={{ marginBottom: '30px', textAlign: 'left' }}>
                                                        <label style={{ display: 'block', marginBottom: '15px', color: '#fff', cursor: 'pointer' }}>
                                                            <input
                                                                type="radio"
                                                                name="winner"
                                                                value="host"
                                                                checked={selectedWinner === 'host'}
                                                                onChange={(e) => setSelectedWinner(e.target.value as 'host' | 'opponent')}
                                                                style={{ marginRight: '10px' }}
                                                            />
                                                            {hostProfile?.discord_username || hostProfile?.full_name || 'Host'} {match?.user_id === user?.id ? '(Me)' : '(Host)'}
                                                        </label>
                                                        <label style={{ display: 'block', color: '#fff', cursor: 'pointer' }}>
                                                            <input
                                                                type="radio"
                                                                name="winner"
                                                                value="opponent"
                                                                checked={selectedWinner === 'opponent'}
                                                                onChange={(e) => setSelectedWinner(e.target.value as 'host' | 'opponent')}
                                                                style={{ marginRight: '10px' }}
                                                            />
                                                            {opponentProfile?.discord_username || opponentProfile?.full_name || 'Opponent'} {match?.opponent_id === user?.id ? '(Me)' : '(Opponent)'}
                                                        </label>
                                                    </div>
                                                    
                                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={handleSubmitResult}
                                                            disabled={!selectedWinner || submittingResult}
                                                            style={{
                                                                padding: '12px 24px',
                                                                backgroundColor: selectedWinner && !submittingResult ? '#28a745' : '#6c757d',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: selectedWinner && !submittingResult ? 'pointer' : 'not-allowed',
                                                                fontSize: '16px'
                                                            }}
                                                        >
                                                            {submittingResult ? 'Submitting...' : 'Submit Result'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setShowResultModal(false);
                                                                setSelectedWinner('');
                                                            }}
                                                            disabled={submittingResult}
                                                            style={{
                                                                padding: '12px 24px',
                                                                backgroundColor: '#6c757d',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: submittingResult ? 'not-allowed' : 'pointer',
                                                                fontSize: '16px'
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="match-tools">
                                    <a href="#" className="joindis"><i className="fab fa-discord"></i> Join our discord</a>

                                    <div className="match-rules">
                                      <div className="match-tabs">
                                        <span className="active">Realistic Rules</span>
                                        <span>Chat</span>
                                      </div>
                                        </div>
                                        <div className="tab-content">
                                            <div className="rules" id="rules">
                                                <div className="single-rule">
                                                    <label>MAP</label>
                                                    <p>2896-7886-8847 (1v1 Box Fight)</p>
                                                </div>
                                                <div className="single-rule">
                                                    <label>MODE</label>
                                                    <p>Default Loot (Unless agreed upon in chat)</p>
                                                </div>
                                                <div className="single-rule">
                                                    <label>TEAMS</label>
                                                    <p>TEAM STIFF VS </p>
                                                </div>
                                            </div>
                                            <div id="chat">
                                                <div className="chat-area"></div>
                                                <div className="chat-tools">
                                                    <textarea name="chat" placeholder="Type to chat ..." className="chatting"></textarea>
                                                    <span className="sendmsg">Send</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                </div>
            </section>
        </div>
      <section className="footer-pre">
        <div className="footer__pre"></div>
      </section>
    </>
  );
}