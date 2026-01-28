import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { Bell, Menu, X, LogOut, User, MessageSquare, Home } from 'lucide-react';

const Header: React.FC = () => {
  const { patient, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadNotificationCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.leftSection}>
          <Link to={isAuthenticated ? '/dashboard' : '/'} style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#0057B8" />
                <path d="M8 16H24M16 8V24" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <span style={styles.logoText}>DemoPatientPortal</span>
          </Link>

          {isAuthenticated && (
            <nav style={styles.nav}>
              <Link
                to="/dashboard"
                style={{
                  ...styles.navLink,
                  ...(isActive('/dashboard') ? styles.navLinkActive : {}),
                }}
              >
                <Home size={18} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/messages"
                style={{
                  ...styles.navLink,
                  ...(isActive('/messages') ? styles.navLinkActive : {}),
                }}
              >
                <MessageSquare size={18} />
                <span>Messages</span>
              </Link>
            </nav>
          )}
        </div>

        {isAuthenticated && patient && (
          <div style={styles.rightSection}>
            <Link to="/notifications" style={styles.notificationBtn}>
              <Bell size={22} />
              {unreadCount > 0 && (
                <span style={styles.notificationBadge}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <div style={styles.profileContainer}>
              <button
                style={styles.profileBtn}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div style={styles.avatar}>
                  {patient.FirstName.charAt(0)}
                  {patient.LastName.charAt(0)}
                </div>
                <span style={styles.profileName}>
                  {patient.FirstName} {patient.LastName}
                </span>
              </button>

              {isProfileMenuOpen && (
                <div style={styles.profileMenu}>
                  <div style={styles.profileMenuHeader}>
                    <strong>{patient.FirstName} {patient.LastName}</strong>
                    <span style={styles.profileEmail}>{patient.Email}</span>
                  </div>
                  <div style={styles.profileMenuDivider} />
                  <Link to="/profile" style={styles.profileMenuItem} onClick={() => setIsProfileMenuOpen(false)}>
                    <User size={18} />
                    <span>My Profile</span>
                  </Link>
                  <button style={styles.profileMenuItem} onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            <button
              style={styles.mobileMenuBtn}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <div style={styles.authButtons}>
            <Link to="/login" style={styles.loginBtn}>Sign In</Link>
            <Link to="/register" style={styles.registerBtn}>Register</Link>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && isAuthenticated && (
        <div style={styles.mobileMenu}>
          <Link to="/dashboard" style={styles.mobileMenuItem} onClick={() => setIsMobileMenuOpen(false)}>
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/messages" style={styles.mobileMenuItem} onClick={() => setIsMobileMenuOpen(false)}>
            <MessageSquare size={20} />
            <span>Messages</span>
          </Link>
          <Link to="/notifications" style={styles.mobileMenuItem} onClick={() => setIsMobileMenuOpen(false)}>
            <Bell size={20} />
            <span>Notifications</span>
            {unreadCount > 0 && <span style={styles.mobileBadge}>{unreadCount}</span>}
          </Link>
          <div style={styles.mobileMenuDivider} />
          <button style={styles.mobileMenuItem} onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E5E5E5',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '70px',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
  },
  logoIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#0057B8',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    color: '#666666',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '0.9375rem',
    fontWeight: 500,
    transition: 'all 150ms ease',
  },
  navLinkActive: {
    color: '#0057B8',
    backgroundColor: '#E8F4FD',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  notificationBtn: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    color: '#666666',
    textDecoration: 'none',
    transition: 'all 150ms ease',
  },
  notificationBadge: {
    position: 'absolute' as const,
    top: '2px',
    right: '2px',
    minWidth: '18px',
    height: '18px',
    padding: '0 4px',
    backgroundColor: '#DC3545',
    color: '#FFFFFF',
    fontSize: '0.6875rem',
    fontWeight: 600,
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContainer: {
    position: 'relative' as const,
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#0057B8',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  profileName: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: '#333333',
  },
  profileMenu: {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    width: '240px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    zIndex: 1001,
  },
  profileMenuHeader: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  profileEmail: {
    fontSize: '0.875rem',
    color: '#666666',
  },
  profileMenuDivider: {
    height: '1px',
    backgroundColor: '#E5E5E5',
  },
  profileMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.875rem 1rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#333333',
    fontSize: '0.9375rem',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  },
  mobileMenuBtn: {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#333333',
    cursor: 'pointer',
  },
  authButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  loginBtn: {
    padding: '0.5rem 1rem',
    color: '#0057B8',
    fontWeight: 500,
    textDecoration: 'none',
  },
  registerBtn: {
    padding: '0.5rem 1.25rem',
    backgroundColor: '#0057B8',
    color: '#FFFFFF',
    fontWeight: 500,
    borderRadius: '8px',
    textDecoration: 'none',
  },
  mobileMenu: {
    display: 'none',
    flexDirection: 'column' as const,
    padding: '1rem',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E5E5E5',
  },
  mobileMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.875rem 1rem',
    color: '#333333',
    textDecoration: 'none',
    fontSize: '1rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px',
  },
  mobileMenuDivider: {
    height: '1px',
    backgroundColor: '#E5E5E5',
    margin: '0.5rem 0',
  },
  mobileBadge: {
    marginLeft: 'auto',
    minWidth: '24px',
    height: '24px',
    padding: '0 6px',
    backgroundColor: '#DC3545',
    color: '#FFFFFF',
    fontSize: '0.75rem',
    fontWeight: 600,
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default Header;
