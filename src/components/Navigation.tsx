'use client';

import Link from 'next/link';
import Image from 'next/image';

import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';

export default function Navigation() {
  const { user, loading, signInWithDiscord, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const { profile, loading: profileLoading, refreshProfile } = useUserProfile(user);

  const handleUserTagClick = () => {
    setShowDropdown((prev) => !prev);
  };

  // Listen for balance update events
  useEffect(() => {
    const handleBalanceUpdate = () => {
      refreshProfile();
    };

    window.addEventListener('balanceUpdate', handleBalanceUpdate);
    return () => window.removeEventListener('balanceUpdate', handleBalanceUpdate);
  }, [refreshProfile]);

  return (
    <nav>
      <div className="logo">
        <Image src="/assets/img/logo.png" alt="LFC Logo" width={81} height={81} />
      </div>

      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/matches">Matches</Link></li>
        <li><Link href="/leaderboard">Leaderboard</Link></li>
        <li><Link href="/store">Store</Link></li>
        <li><a href="https://twitter.com/LFCCOINS" target="_blank" rel="noopener noreferrer">Contact</a></li>
      </ul>

      {!user ? (
        <div className="logintools">
          <button onClick={signInWithDiscord} disabled={loading}>
            {loading ? 'Loading...' : 'Register'}
          </button>
          <button onClick={signInWithDiscord} disabled={loading}>
            {loading ? 'Loading...' : 'Log In'}
          </button>
        </div>
      ) : (
        <div className="rightools">
          <div className="snipes">
            <Image src="/assets/img/target.svg" alt="Target" width={20} height={20} />
            <span>{profileLoading || !profile ? '...' : profile.snipes}</span> Snipes left
          </div>
          <div className="notifications">
            <i className="fas fa-bell"></i>
          </div>
          <div className="user-tag" onClick={handleUserTagClick} style={{ cursor: 'pointer' }}>
            <Image src="/assets/img/user.png" alt="User" width={40} height={40} />
            <div className="user-det">
              <span className="user-name">{user.user_metadata?.full_name || user.email || 'User'}</span>
              <span className="solde">
                <Image src="/assets/img/logo.png" alt="LFC Logo" width={20} height={20} />
                {profileLoading || !profile ? '...' : profile.balance.toFixed(2)}
              </span>
            </div>
            <i className="fas fa-chevron-down"></i>
            <ul className={`dropuser${showDropdown ? ' active' : ''}`}>
                <li><Link href="/my-account">My Account</Link></li>
                <li><a onClick={signOut}>Logout</a></li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}
