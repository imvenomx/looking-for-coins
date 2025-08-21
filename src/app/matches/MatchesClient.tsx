"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from '@/utils/supabaseClient';
import CountdownTimer from '@/components/CountdownTimer';
import Swal from 'sweetalert2';
import CreateMatchModal from "@/components/CreateMatchModal";
import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";

interface Match {
  id: string;
  user_id: string;
  opponent_name: string;
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

export default function MatchesClient() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [hasEpicAccount, setHasEpicAccount] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedGamemode, setSelectedGamemode] = useState<string>('all');

  useEffect(() => {
    fetchMatches();
    if (user) {
      fetchUserBalance();
      fetchEpicAccountStatus();
    }
  }, [user]);

  const fetchUserBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user?.id)
        .single();
      
      if (error) {
        console.error('Error fetching balance:', error);
        return;
      }
      
      const balance = parseFloat(data?.balance || 0);
      console.log('Fetched user balance directly from DB:', balance);
      setUserBalance(balance);
    } catch (error) {
      console.error('Failed to fetch user balance:', error);
    }
  };

  const fetchEpicAccountStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const response = await fetch('/api/linked-accounts', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        if (response.ok) {
          const { linkedAccounts } = await response.json();
          const epicAccount = linkedAccounts?.find((account: any) => account.provider === 'epic_games');
          setHasEpicAccount(!!epicAccount);
        }
      }
    } catch (error) {
      console.error('Failed to fetch Epic account status:', error);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchExpired = async () => {
    try {
      console.log('handleMatchExpired called');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        console.log('Calling expired matches API');
        // Call the expired matches cleanup API
        const response = await fetch('/api/matches/expired', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Expired matches API response:', result);
        } else {
          console.error('Expired matches API failed:', response.status, response.statusText);
        }
        
        // Refresh matches list after cleanup
        console.log('Refreshing matches list');
        fetchMatches();
      } else {
        console.log('No session found, only refreshing matches');
        fetchMatches();
      }
    } catch (error) {
      console.error('Error handling expired matches:', error);
      // Still refresh matches list even if cleanup failed
      fetchMatches();
    }
  };

  const handleJoinMatch = (match: Match) => {
    if (!hasEpicAccount) {
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'warning',
        title: 'Epic Games Account Required',
        text: 'Please link your Epic Games account in your profile to join matches',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#fff',
        iconColor: '#ffc107',
        didOpen: (toast) => {
          toast.style.display = 'flex';
          toast.style.flexDirection = 'column';
          toast.style.alignItems = 'center';
          toast.style.textAlign = 'center';
          toast.style.width = 'auto';
          toast.style.maxWidth = 'none';
          
          // Adjust spacing
          const icon = toast.querySelector('.swal2-icon') as HTMLElement;
          const title = toast.querySelector('.swal2-title') as HTMLElement;
          const content = toast.querySelector('.swal2-html-container') as HTMLElement;
          
          if (icon) icon.style.marginBottom = '16px';
          if (title) title.style.marginBottom = '8px';
          if (content) content.style.marginTop = '0px';
        }
      });
      return;
    }
    setSelectedMatch(match);
    setShowJoinModal(true);
  };

  const handleCreateMatch = () => {
    if (!hasEpicAccount) {
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'warning',
        title: 'Epic Games Account Required',
        text: 'Please link your Epic Games account in your profile to create matches',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#fff',
        iconColor: '#ffc107',
        didOpen: (toast) => {
          toast.style.display = 'flex';
          toast.style.flexDirection = 'column';
          toast.style.alignItems = 'center';
          toast.style.textAlign = 'center';
          toast.style.width = 'auto';
          toast.style.maxWidth = 'none';
          
          // Adjust spacing
          const icon = toast.querySelector('.swal2-icon') as HTMLElement;
          const title = toast.querySelector('.swal2-title') as HTMLElement;
          const content = toast.querySelector('.swal2-html-container') as HTMLElement;
          
          if (icon) icon.style.marginBottom = '16px';
          if (title) title.style.marginBottom = '8px';
          if (content) content.style.marginTop = '0px';
        }
      });
      return;
    }
    setShowModal(true);
  };

  const confirmJoinMatch = async () => {
    if (!selectedMatch) return;
    
    const entryFee = parseFloat(selectedMatch.entry_fee || selectedMatch.betting_amount || 0);
    
    console.log('Balance check:', {
      userBalance,
      entryFee,
      selectedMatch: selectedMatch,
      comparison: userBalance < entryFee
    });
    
    if (userBalance < entryFee) {
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'error',
        title: 'Not enough balance',
        text: `You need $${entryFee.toFixed(2)} to join this match. Your balance: $${userBalance.toFixed(2)}`,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#fff',
        iconColor: '#dc3545'
      });
      setShowJoinModal(false);
      return;
    }

    try {
      // Call join match API
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/matches/${selectedMatch.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join match');
      }

      // Show success message
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: 'Match joined!',
        text: `Entry fee $${entryFee.toFixed(2)} deducted. New balance: $${result.newBalance.toFixed(2)}`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#fff',
        iconColor: '#28a745'
      });

      // Redirect to match page
      window.location.href = `/match/${selectedMatch.id}`;

    } catch (error) {
      console.error('Join match error:', error);
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'error',
        title: 'Failed to join match',
        text: error instanceof Error ? error.message : 'Please try again',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#fff',
        iconColor: '#dc3545'
      });
    }
    
    setShowJoinModal(false);
  };

  return (
    <>
      <Header 
        showVideoBackground={false}
        title="Matches"
        subtitle="Live Ongoing Matches"
        description="Compete in a variety of gamemodes such as box fights, build fights, and zone wars!"
        icon="fas fa-gamepad"
      />
      <CreateMatchModal 
        open={showModal} 
        onClose={() => {
          setShowModal(false);
          fetchMatches(); // Refresh matches when modal closes
        }} 
      />
      <div className="content">
        {/* Matches Section */}
        <section className="matches">
          <div className="container">
            <div className="matchlist">
              <div className="matches-settings">
                <div className="matches-filter">
                  <h4>Filter by :</h4>
                  <div className="selects-loop">
                    <select name="statuts" defaultValue="default">
                      <option value="default" disabled >Open AND Locked</option>
                      <option value="open">Open</option>
                      <option value="locked">Locked</option>
                    </select>
                    <select name="platform" defaultValue="default">
                      <option value="default" disabled >Platform</option>
                      <option value="any">Any</option>
                      <option value="pc">PC</option>
                      <option value="console">Console</option>
                    </select>
                    <select name="region" defaultValue="default">
                      <option value="default" disabled>Region</option>
                      <option value="nae">NAE</option>
                      <option value="nac">NAC</option>
                      <option value="me">Middle East</option>
                      <option value="oce">OCE</option>
                      <option value="eu">Europe</option>
                      <option value="naw">NAW</option>
                      <option value="br">BR</option>
                    </select>
                    <select name="gamemodes" defaultValue="default">
                      <option value="default" disabled>Gamemodes</option>
                      <option value="boxfights">Box Fights</option>
                      <option value="bf">Build Fights</option>
                      <option value="realistic">Realistic</option>
                      <option value="zb">Zero Build</option>
                      <option value="zonewars">Zonewars</option>
                      <option value="zbkr">ZB Kill Race</option>
                      <option value="killrace">Kill Race</option>
                      <option value="esl">ESL</option>
                    </select>
                  </div>
                </div>
                <div className="create-match">
                  <span 
                    onClick={handleCreateMatch}
                    className={!hasEpicAccount ? 'disabled' : ''}
                    style={{ 
                      opacity: !hasEpicAccount ? 0.5 : 1,
                      cursor: !hasEpicAccount ? 'not-allowed' : 'pointer'
                    }}
                    title={!hasEpicAccount ? 'Link your Epic Games account in profile to create matches' : ''}
                  >
                    <i className="fas fa-plus"></i> Create Match
                  </span>
                </div>
              </div>
              <div className="matchesloop">
                  <div className="row">
                    {loading ? (
                      <div className="text-center nomatch py-5">
                        <i className="fas fa-spinner fa-spin fa-2x"></i>
                        <p className="mt-3">Loading matches...</p>
                      </div>
                    ) : matches.length === 0 ? (
                      <div className="text-center nomatch py-5">
                        <i className="fas fa-gamepad fa-3x mb-3 opacity-50"></i>
                        <h4>No matches available</h4>
                        <p>Be the first to create a match!</p>
                      </div>
                    ) : (
                      matches.filter(match => match.status === 'waiting' || match.status === 'finished' || !match.status).map((match) => (
                        <div key={match.id} className={`singlematch ${match.status === 'finished' ? 'finished-match' : ''}`}>
                          <h2>
                            {match.team_size}v{match.team_size} {gameModeTitles[match.game_mode] || match.game_mode}
                            {match.status === 'finished' && (
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
                                Finished
                              </span>
                            )}
                          </h2>
                          <div className="matchcontent">
                            {match.status !== 'finished' && (
                              <CountdownTimer 
                                expiresAt={match.expires_at || new Date(Date.now() + 30 * 60 * 1000).toISOString()} 
                                onExpired={handleMatchExpired}
                              />
                            )}
                            <div className="joindetails">
                              <div className="matchdetails">
                                <div className="single-det">
                                  <label>Region</label>
                                  <span>{regionNames[match.region] || match.region}</span>
                                </div>
                                <div className="single-det">
                                  <label>Platform</label>
                                  <span>{platformNames[match.platform] || match.platform}</span>
                                </div>
                                <div className="single-det">
                                  <label>First To</label>
                                  <span>{match.first_to}</span>
                                </div>
                                <div className="single-det">
                                  <label>Host</label>
                                  <span>HOST</span>
                                </div>
                                <div className="single-det">
                                  <label>Entry Fee</label>
                                  <span>${(match.entry_fee || match.betting_amount).toFixed(2)}</span>
                                </div>
                                <div className="single-det bet">
                                  <label>Prize</label>
                                  <span>${match.prize || ((match.entry_fee || match.betting_amount) * 2 * 0.85).toFixed(2)}</span>
                                </div>
                              </div>
                              <span className={`viewopponent${user?.id === match.user_id || user?.id === match.opponent_id ? ' hidden' : ''}`}>
                                {user?.id !== match.user_id && user?.id !== match.opponent_id && (
                                  <>
                                    <i className="fa-solid fa-eye"></i>
                                    {match.opponent_name === 'Waiting for opponent' ? 'Snipe the opponent' : 'View opponent'}
                                  </>
                                )}
                              </span>
                              {match.status === 'finished' ? (
                                <Link href={`/match/${match.id}`} className="joinmatch mt-1" style={{ backgroundColor: '#28a745' }}>
                                  View Results
                                </Link>
                              ) : user?.id === match.user_id || user?.id === match.opponent_id ? (
                                <Link href={`/match/${match.id}`} className="joinmatch mt-1">
                                  View match
                                </Link>
                              ) : (
                                match.opponent_name === 'Waiting for opponent' ? (
                                  <div 
                                    onClick={() => handleJoinMatch(match)} 
                                    className={`joinmatch mt-1 ${!hasEpicAccount ? 'disabled' : ''}`}
                                    style={{ 
                                      cursor: !hasEpicAccount ? 'not-allowed' : 'pointer',
                                      opacity: !hasEpicAccount ? 0.5 : 1
                                    }}
                                    title={!hasEpicAccount ? 'Link your Epic Games account in profile to join matches' : ''}
                                  >
                                    Join the match
                                  </div>
                                ) : (
                                  <Link href={`/match/${match.id}`} className="joinmatch mt-1">
                                    View match
                                  </Link>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
            </div>
          </div>
        </section>

        {/* Discord Section */}
                <section className="discordsec">
                  <div className="container">
                    <div className="sec-title">
                      <span className="purple"><i className="fab fa-discord"></i> Discord</span>
                      <h2>Join Our Community</h2>
                      <p>Connect with other players, get updates, and participate in tournaments through our Discord server.</p>
                    </div>
                    <div className="discord-area">
                      <div className="dscover">
                        <Image src="/assets/img/lfcpdp.png" alt="Discord"  width={400} height={200} />
                      </div>
                      <div className="dscontent">
                        <h2>Looking For Coins <i className="fas fa-check-circle" aria-hidden="true"></i></h2>
                        <a href="#" className="discord-btn">
                          <i className="fab fa-discord"></i> Join Discord
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
      </div>
      {/* Join Match Confirmation Modal */}
      {showJoinModal && selectedMatch && (
        <div 
          className="modal fade show" 
          style={{ 
            display: 'block', 
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999
          }}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            style={{
              position: 'relative',
              width: 'auto',
              margin: '1.75rem auto',
              maxWidth: '500px',
              display: 'flex',
              alignItems: 'center',
              minHeight: 'calc(100% - 3.5rem)'
            }}
          >
            <div 
              className="modal-content" 
              style={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid #333',
                borderRadius: '0.375rem',
                boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
                width: '100%'
              }}
            >
              <div className="modal-header" style={{ borderBottom: '1px solid #333', padding: '1rem' }}>
                <h5 className="modal-title" style={{ color: '#fff', margin: 0 }}>Join Match</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowJoinModal(false)}
                  style={{ 
                    filter: 'invert(1)',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer'
                  }}
                ></button>
              </div>
              <div className="modal-body" style={{ color: '#fff', padding: '1rem' }}>
                <div className="text-center mb-4">
                  <h4 style={{ marginBottom: '1rem' }}>Are you sure you want to join this match?</h4>
                  <div className="mt-3">
                    <p style={{ margin: '0.5rem 0' }}><strong>Game Mode:</strong> {gameModeTitles[selectedMatch.game_mode] || selectedMatch.game_mode}</p>
                    <p style={{ margin: '0.5rem 0' }}><strong>Entry Fee:</strong> ${(selectedMatch.entry_fee || selectedMatch.betting_amount).toFixed(2)}</p>
                    <p style={{ margin: '0.5rem 0' }}><strong>Prize:</strong> ${selectedMatch.prize || ((selectedMatch.entry_fee || selectedMatch.betting_amount) * 2 * 0.85).toFixed(2)}</p>
                    <p style={{ margin: '0.5rem 0' }}><strong>Your Balance:</strong> ${userBalance.toFixed(2)}</p>
                  </div>
                  {userBalance < (selectedMatch.entry_fee || selectedMatch.betting_amount) && (
                    <div 
                      className="alert alert-danger mt-3"
                      style={{
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        marginTop: '1rem'
                      }}
                    >
                      <i className="fas fa-exclamation-triangle"></i> Insufficient balance to join this match
                    </div>
                  )}
                </div>
              </div>
              <div 
                className="modal-footer" 
                style={{ 
                  borderTop: '1px solid #333', 
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem'
                }}
              >
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowJoinModal(false)}
                  style={{
                    backgroundColor: '#6c757d',
                    borderColor: '#6c757d',
                    color: '#fff',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={confirmJoinMatch}
                  disabled={userBalance < (selectedMatch.entry_fee || selectedMatch.betting_amount)}
                  style={{
                    backgroundColor: userBalance < (selectedMatch.entry_fee || selectedMatch.betting_amount) ? '#6c757d' : '#0d6efd',
                    borderColor: userBalance < (selectedMatch.entry_fee || selectedMatch.betting_amount) ? '#6c757d' : '#0d6efd',
                    color: '#fff',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid transparent',
                    cursor: userBalance < (selectedMatch.entry_fee || selectedMatch.betting_amount) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {userBalance < (selectedMatch.entry_fee || selectedMatch.betting_amount) ? 'Insufficient Balance' : 'Join Match'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
