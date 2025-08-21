'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('users');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const menuItems = [
    { id: 'users', label: 'Users Management', icon: 'fas fa-users' },
    { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-bar' },
    { id: 'admins', label: 'Admins', icon: 'fas fa-user-shield' },
    { id: 'withdrawals', label: 'Withdrawal Requests', icon: 'fas fa-money-bill-wave' },
    { id: 'deposits', label: 'Deposits', icon: 'fas fa-coins' },
    { id: 'matches', label: 'Matches', icon: 'fas fa-gamepad' },
    { id: 'leaderboards', label: 'Leaderboards', icon: 'fas fa-trophy' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return (
          <div className="admin-content">
            <h2>Users Management</h2>
            <div className="content-placeholder">
              <p>User management functionality will be implemented here.</p>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-number">1,234</p>
                </div>
                <div className="stat-card">
                  <h3>Active Users</h3>
                  <p className="stat-number">856</p>
                </div>
                <div className="stat-card">
                  <h3>New Users (30d)</h3>
                  <p className="stat-number">123</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="admin-content">
            <h2>Analytics</h2>
            <div className="content-placeholder">
              <p>Analytics dashboard will be implemented here.</p>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Revenue</h3>
                  <p className="stat-number">$12,345</p>
                </div>
                <div className="stat-card">
                  <h3>Matches Played</h3>
                  <p className="stat-number">2,456</p>
                </div>
                <div className="stat-card">
                  <h3>Platform Fee</h3>
                  <p className="stat-number">$1,852</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'admins':
        return (
          <div className="admin-content">
            <h2>Admins</h2>
            <div className="content-placeholder">
              <p>Admin management functionality will be implemented here.</p>
            </div>
          </div>
        );
      case 'withdrawals':
        return (
          <div className="admin-content">
            <h2>Withdrawal Requests</h2>
            <div className="content-placeholder">
              <p>Withdrawal requests management will be implemented here.</p>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Pending Requests</h3>
                  <p className="stat-number">15</p>
                </div>
                <div className="stat-card">
                  <h3>Total Amount</h3>
                  <p className="stat-number">$2,340</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'deposits':
        return (
          <div className="admin-content">
            <h2>Deposits</h2>
            <div className="content-placeholder">
              <p>Deposits management will be implemented here.</p>
            </div>
          </div>
        );
      case 'matches':
        return (
          <div className="admin-content">
            <h2>Matches</h2>
            <div className="content-placeholder">
              <p>Matches management will be implemented here.</p>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Active Matches</h3>
                  <p className="stat-number">42</p>
                </div>
                <div className="stat-card">
                  <h3>Disputed Matches</h3>
                  <p className="stat-number">3</p>
                </div>
                <div className="stat-card">
                  <h3>Completed Today</h3>
                  <p className="stat-number">127</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'leaderboards':
        return (
          <div className="admin-content">
            <h2>Leaderboards</h2>
            <div className="content-placeholder">
              <p>Leaderboards management will be implemented here.</p>
            </div>
          </div>
        );
      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Dashboard</h2>
          <div className="admin-info">
            <i className="fas fa-user-circle"></i>
            <span>{user?.email || 'Admin'}</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => {
                if (isTransitioning) return;
                setIsTransitioning(true);
                setActiveSection(item.id);
                setTimeout(() => setIsTransitioning(false), 150);
              }}
              disabled={isTransitioning}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </button>
          ))}
          
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-header">
          <h1>LFC Admin Panel</h1>
          <div className="header-actions">
            <button className="btn-secondary">
              <i className="fas fa-bell"></i>
              Notifications
            </button>
            <button className="btn-primary">
              <i className="fas fa-plus"></i>
              Quick Action
            </button>
          </div>
        </div>
        
        <div className="admin-content-wrapper">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
