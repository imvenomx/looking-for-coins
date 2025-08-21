
"use client";

import Image from "next/image";
import Header from "@/components/Header";
import LinkedAccounts from "@/components/LinkedAccounts";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Swal from 'sweetalert2';

export default function MyAccount() {

  const openTab2 = (event: React.MouseEvent, tabName: string) => {
    const i: any = document.getElementsByClassName("teams-area");
    for (let index = 0; index < i.length; index++) {
      const element: any = i[index];
      element.style.display = "none";
    }
    const active: any = document.getElementsByClassName("main-tabs");
    for (let index = 0; index < active.length; index++) {
      const element: any = active[index];
      element.className = element.className.replace(" active", "");
    }
    const tabElement = document.getElementById(tabName);
    if (tabElement) {
      tabElement.style.display = "block";
    }
    event.currentTarget.className = "active";
    
  };

  const [userId, setUserId] = useState<string | null>(null);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [wl, setWL] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [previewPicture, setPreviewPicture] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setError("You must be logged in to view your account.");
        setLoading(false);
        return;
      }
      setUserId(data.user.id);
      
      // Fetch user profile data
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const response = await fetch('/api/profile', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          if (response.ok) {
            const { profile } = await response.json();
            if (profile) {
              // Use Discord username (capitalized) as fallback for full name
              const discordUsername = profile.discord_username || profile.name || '';
              const capitalizedDiscordUsername = discordUsername ? 
                discordUsername.charAt(0).toUpperCase() + discordUsername.slice(1) : '';
              
              setFullName(profile.full_name || capitalizedDiscordUsername || 'Anwar VeNomX');
              setEmail(profile.email || '');
              setProfilePicture(profile.profile_picture_url || '/assets/img/banana.jpg');
              setPreviewPicture(profile.profile_picture_url || '/assets/img/banana.jpg');
            } else {
              // No profile found, set defaults
              setFullName('Anwar VeNomX');
              setProfilePicture('/assets/img/banana.jpg');
              setPreviewPicture('/assets/img/banana.jpg');
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        // Set defaults on error
        setFullName('Anwar VeNomX');
        setProfilePicture('/assets/img/banana.jpg');
        setPreviewPicture('/assets/img/banana.jpg');
      } finally {
        setProfileLoading(false);
      }
    };
    getUser();

    // Check for OAuth callback messages
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'epic_linked') {
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: 'Epic Games account linked successfully!',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#fff',
        iconColor: '#28a745'
      });
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Trigger a custom event to refresh linked accounts
      window.dispatchEvent(new CustomEvent('linkedAccountsChanged'));
    } else if (error) {
      let errorMessage = 'Failed to link Epic Games account';
      switch (error) {
        case 'epic_auth_failed':
          errorMessage = 'Epic Games authentication failed';
          break;
        case 'token_exchange_failed':
          errorMessage = 'Failed to exchange authorization code';
          break;
        case 'user_info_failed':
          errorMessage = 'Failed to get user information from Epic Games';
          break;
        case 'save_failed':
          errorMessage = 'Failed to save linked account';
          break;
        case 'not_authenticated':
          errorMessage = 'Please log in first before linking accounts';
          break;
      }
      
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'error',
        title: errorMessage,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#fff',
        iconColor: '#dc3545'
      });
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('winner_id, user_id, opponent_id, status')
        .or(`user_id.eq.${userId},opponent_id.eq.${userId}`)
        .eq('status', 'finished');
      
      if (error) {
        setError("Failed to fetch match stats.");
        setLoading(false);
        return;
      }
      
      let winCount = 0;
      let lossCount = 0;
      
      data?.forEach((match: { winner_id: string; user_id: string; opponent_id: string; status: string }) => {
        if (match.winner_id === userId) {
          winCount++;
        } else if (match.winner_id && (match.user_id === userId || match.opponent_id === userId)) {
          lossCount++;
        }
      });
      
      setWins(winCount);
      setLosses(lossCount);
      setWL(lossCount === 0 ? winCount : parseFloat((winCount / lossCount).toFixed(2)));
      setLoading(false);
    };
    fetchStats();
  }, [userId]);

  return (
    <>
      <Header 
        showVideoBackground={false}
      />

    <div className="profilehero">
      <div className="profile-details">
        <div className="profile-img">
          {profileLoading ? (
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: '#333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s infinite'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                border: '3px solid #555',
                borderTop: '3px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : (
            <img src={profilePicture || '/assets/img/banana.jpg'} alt="Profile" />
          )}
        </div>
        <div className="profile-det">
          {profileLoading ? (
            <div style={{
              height: '40px',
              width: '200px',
              backgroundColor: '#333',
              borderRadius: '6px',
              marginBottom: '10px',
              animation: 'pulse 2s infinite'
            }}></div>
          ) : (
            <h2>{fullName || 'Anwar VeNomX'}</h2>
          )}
          <div className="player-stats">
            {loading ? (
              <span>Loading stats...</span>
            ) : error ? (
              <span style={{ color: 'red' }}>{error}</span>
            ) : (
              <>
                <h6><span>Wins:</span> {wins}</h6>/
                <h6><span>Loss:</span> {losses}</h6>/
                <h6><span>WL: </span> {wl}</h6>/
                <h6><span>Win Streak:</span> 0</h6>
              </>
            )}
          </div>
          <div className="player-actions">
            <span 
              onClick={() => setShowEditModal(true)}
              style={{ cursor: 'pointer' }}
            >
              <i className="fa-regular fa-user"></i> Edit profile
            </span>
            <span><i className="fa-solid fa-coins"></i> Deposit</span>
            <span><i className="fa-solid fa-money-bill-transfer"></i> Widthdraw</span>
          </div>
        </div>
      </div>
    </div>
      <div className="content">
      <section className="my-account-area">
                <div className="container">
                        <div className="main-tabs">
                            <span className="active" onClick={(event) => openTab2(event, 'teams')}>Teams</span>
                            <span onClick={(event) => openTab2(event, 'socials')}>Linked Accounts</span>
                            <span onClick={(event) => openTab2(event, 'matches')}>Match History</span>
                            <span onClick={(event) => openTab2(event, 'deposits')}>Deposits</span>
                            <span onClick={(event) => openTab2(event, 'withdrawls')}>Withdrawls</span>
                        </div>
                        <div className="main-content">
                            <div className="teams-area" id="teams" style={{ display: "block" }}>
                                <div className="mini-title">
                                    <h3><i className="fa-solid fa-people-group"></i> My teams</h3>
                                    <span className="create-team">Create a team</span>
                                </div>
                            </div>
                            <div className="teams-area" id="socials" style={{ display: "none" }}>
                                <div className="mini-title">
                                    <h3><i className="fa-solid fa-globe"></i> Linked Accounts</h3>
                                </div>
                                <LinkedAccounts />
                            </div>
                            <div className="teams-area" id="matches" style={{ display: "none" }}>
                                <div className="mini-title">
                                    <h3><i className="fa-solid fa-clock-rotate-left"></i>Matches History</h3>
                                </div>
                            </div>
                            <div className="teams-area" id="deposits" style={{ display: "none" }}>
                                <div className="mini-title">
                                    <h3><i className="fa-solid fa-coins"></i> Deposits History</h3>
                                </div>
                            </div>
                            <div className="teams-area" id="withdrawls">
                                <div className="mini-title">
                                    <h3><i className="fa-solid fa-money-bill-transfer"></i> Withdrawls History</h3>
                                </div>
                            </div>
                        </div>
                </div>
            </section>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: '#1a1a1a',
            padding: '30px',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px',
            border: '1px solid #333'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#fff', margin: 0 }}>Edit Profile</h3>
              <span 
                onClick={() => setShowEditModal(false)}
                style={{
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ×
              </span>
            </div>
            
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>Full Name</label>
                <input 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>Email Address</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>Profile Picture</label>
                
                {/* File Upload */}
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    // Validate file size (5MB max)
                    if (file.size > 5 * 1024 * 1024) {
                      Swal.fire({
                        toast: true,
                        position: 'bottom-end',
                        icon: 'error',
                        title: 'File size must be less than 5MB',
                        showConfirmButton: false,
                        timer: 4000,
                        timerProgressBar: true,
                        background: '#1a1a1a',
                        color: '#fff',
                        iconColor: '#dc3545'
                      });
                      return;
                    }
                    
                    // Store the file for later upload
                    setSelectedFile(file);
                    
                    // Create preview URL
                    const previewUrl = URL.createObjectURL(file);
                    setPreviewPicture(previewUrl);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '16px',
                    marginBottom: '15px'
                  }}
                />
                
                {/* Preview */}
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src={previewPicture} 
                    alt="Profile Preview" 
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '2px solid #444'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/img/banana.jpg';
                    }}
                  />
                  <div style={{ color: '#888', fontSize: '12px', marginTop: '5px' }}>
                    Recommended: 512x512 pixels, square format
                  </div>
                  {selectedFile && (
                    <div style={{ color: '#007bff', fontSize: '12px', marginTop: '5px' }}>
                      New image selected: {selectedFile.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer" style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              marginTop: '20px'
            }}>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  // Reset preview to current profile picture
                  setPreviewPicture(profilePicture);
                  setSelectedFile(null);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#666',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setSaving(true);
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.access_token) {
                      Swal.fire({
                        toast: true,
                        position: 'bottom-end',
                        icon: 'warning',
                        title: 'Please log in to save your profile',
                        showConfirmButton: false,
                        timer: 4000,
                        timerProgressBar: true,
                        background: '#1a1a1a',
                        color: '#fff',
                        iconColor: '#ffc107'
                      });
                      setSaving(false);
                      return;
                    }

                    let finalProfilePictureUrl = profilePicture;
                    
                    // Upload new image if one was selected
                    if (selectedFile) {
                      setUploading(true);
                      const formData = new FormData();
                      formData.append('file', selectedFile);
                      
                      const uploadResponse = await fetch('/api/upload/profile-picture', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${session.access_token}`
                        },
                        body: formData
                      });
                      
                      if (uploadResponse.ok) {
                        const { url } = await uploadResponse.json();
                        finalProfilePictureUrl = url;
                      } else {
                        const { error } = await uploadResponse.json();
                        Swal.fire({
                          toast: true,
                          position: 'bottom-end',
                          icon: 'error',
                          title: `Failed to upload image: ${error}`,
                          showConfirmButton: false,
                          timer: 4000,
                          timerProgressBar: true,
                          background: '#1a1a1a',
                          color: '#fff',
                          iconColor: '#dc3545'
                        });
                        setSaving(false);
                        setUploading(false);
                        return;
                      }
                      setUploading(false);
                    }

                    // Save profile data
                    const response = await fetch('/api/profile', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                      },
                      body: JSON.stringify({
                        full_name: fullName,
                        email: email,
                        profile_picture_url: finalProfilePictureUrl
                      })
                    });
                    
                    if (response.ok) {
                      // Update the actual profile picture URL
                      setProfilePicture(finalProfilePictureUrl);
                      setPreviewPicture(finalProfilePictureUrl);
                      setSelectedFile(null);
                      setShowEditModal(false);
                      Swal.fire({
                        toast: true,
                        position: 'bottom-end',
                        icon: 'success',
                        title: 'Profile saved successfully!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        background: '#1a1a1a',
                        color: '#fff',
                        iconColor: '#28a745'
                      });
                    } else {
                      const errorData = await response.json();
                      console.error('Save profile error:', errorData);
                      Swal.fire({
                        toast: true,
                        position: 'bottom-end',
                        icon: 'error',
                        title: `Failed to save profile: ${errorData.details || errorData.error}`,
                        showConfirmButton: false,
                        timer: 4000,
                        timerProgressBar: true,
                        background: '#1a1a1a',
                        color: '#fff',
                        iconColor: '#dc3545'
                      });
                    }
                  } catch (err) {
                    Swal.fire({
                      toast: true,
                      position: 'bottom-end',
                      icon: 'error',
                      title: 'Failed to save profile',
                      showConfirmButton: false,
                      timer: 4000,
                      timerProgressBar: true,
                      background: '#1a1a1a',
                      color: '#fff',
                      iconColor: '#dc3545'
                    });
                  } finally {
                    setSaving(false);
                    setUploading(false);
                  }
                }}
                disabled={saving || uploading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: saving || uploading ? '#666' : '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: saving || uploading ? 'not-allowed' : 'pointer',
                  fontSize: '16px'
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <section className="footer-pre">
        <div className="footer__pre"></div>
      </section>
    </>
  );
}
