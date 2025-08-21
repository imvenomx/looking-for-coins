"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import Swal from 'sweetalert2';

interface LinkedAccount {
  provider: string;
  username: string;
  email: string;
  linked_at: string;
  profile_data: any;
}

export default function LinkedAccounts() {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinkedAccounts();

    // Listen for focus events to refresh when user returns from OAuth
    const handleFocus = () => {
      fetchLinkedAccounts();
    };

    // Listen for custom event to refresh linked accounts
    const handleLinkedAccountsChanged = () => {
      fetchLinkedAccounts();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('linkedAccountsChanged', handleLinkedAccountsChanged);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('linkedAccountsChanged', handleLinkedAccountsChanged);
    };
  }, []);

  const fetchLinkedAccounts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const response = await fetch('/api/linked-accounts', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Linked accounts response:', data);
          setLinkedAccounts(data.linkedAccounts || []);
        } else {
          console.error('Failed to fetch linked accounts:', response.status, response.statusText);
        }
      }
    } catch (error) {
      console.error('Failed to fetch linked accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkEpicGames = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'warning',
          title: 'Please log in to link your Epic Games account',
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
          background: '#1a1a1a',
          color: '#fff',
          iconColor: '#ffc107'
        });
        return;
      }

      // Call the Epic OAuth endpoint to get redirect URL
      const response = await fetch('/api/auth/epic', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { redirectUrl } = await response.json();
        window.location.href = redirectUrl;
      } else {
        throw new Error('Failed to get Epic Games OAuth URL');
      }
    } catch (error) {
      console.error('Failed to initiate Epic Games linking:', error);
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'error',
        title: 'Failed to start Epic Games linking',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#fff',
        iconColor: '#dc3545'
      });
    }
  };

  const handleUnlinkAccount = async (provider: string) => {
    const result = await Swal.fire({
      title: 'Unlink Account',
      text: `Are you sure you want to unlink your ${provider.replace('_', ' ')} account?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, unlink it',
      background: '#1a1a1a',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const response = await fetch('/api/linked-accounts', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ provider })
          });

          if (response.ok) {
            await fetchLinkedAccounts(); // Refresh the list
            Swal.fire({
              toast: true,
              position: 'bottom-end',
              icon: 'success',
              title: 'Account unlinked successfully',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: '#1a1a1a',
              color: '#fff',
              iconColor: '#28a745'
            });
          } else {
            throw new Error('Failed to unlink account');
          }
        }
      } catch (error) {
        console.error('Failed to unlink account:', error);
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'error',
          title: 'Failed to unlink account',
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
          background: '#1a1a1a',
          color: '#fff',
          iconColor: '#dc3545'
        });
      }
    }
  };

  const getAccountByProvider = (provider: string) => {
    return linkedAccounts.find(account => account.provider === provider);
  };

  const formatProviderName = (provider: string) => {
    switch (provider) {
      case 'epic_games':
        return 'Epic Games';
      case 'twitch':
        return 'Twitch';
      case 'twitter':
        return 'Twitter';
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="sec-content">
        <div className="text-center py-4">
          <i className="fas fa-spinner fa-spin fa-2x"></i>
          <p className="mt-3">Loading linked accounts...</p>
        </div>
      </div>
    );
  }

  const epicAccount = getAccountByProvider('epic_games');
  const twitchAccount = getAccountByProvider('twitch');
  const twitterAccount = getAccountByProvider('twitter');

  return (
    <div className="sec-content">
      <div className="socials">
        {/* Twitch Account */}
        <div className="single-social">
          <h3><i className="fa-brands fa-twitch"></i>Twitch account</h3>
          {twitchAccount ? (
            <>
              <span className="linked">@{twitchAccount.username}</span>
              <span 
                className="votecancel"
                onClick={() => handleUnlinkAccount('twitch')}
                style={{ cursor: 'pointer' }}
              >
                Unlink account
              </span>
            </>
          ) : (
            <>
              <span className="linked">Click to link</span>
              <span className="linkaccount">Link account</span>
            </>
          )}
        </div>

        {/* Epic Games Account */}
        <div className="single-social">
          <h3><img src="/assets/img/epicgames.png" alt="Epic account" />Epic account</h3>
          {epicAccount ? (
            <>
              <span className="linked">@{epicAccount.username}</span>
              <span 
                className="votecancel"
                onClick={() => handleUnlinkAccount('epic_games')}
                style={{ cursor: 'pointer' }}
              >
                Unlink account
              </span>
            </>
          ) : (
            <>
              <span className="linked">Click to link</span>
              <span 
                className="linkaccount"
                onClick={handleLinkEpicGames}
                style={{ cursor: 'pointer' }}
              >
                Link account
              </span>
            </>
          )}
        </div>

        {/* Twitter Account */}
        <div className="single-social">
          <h3><i className="fa-brands fa-x-twitter"></i>Twitter account</h3>
          {twitterAccount ? (
            <>
              <span className="linked">@{twitterAccount.username}</span>
              <span 
                className="votecancel"
                onClick={() => handleUnlinkAccount('twitter')}
                style={{ cursor: 'pointer' }}
              >
                Unlink account
              </span>
            </>
          ) : (
            <>
              <span className="linked">Click to link</span>
              <span className="linkaccount">Link account</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
