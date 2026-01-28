import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { Conversation, Notification } from '../types';
import {
  MessageSquare,
  Bell,
  Calendar,
  FileText,
  Heart,
  Clock,
  ChevronRight,
  Mail,
  AlertCircle,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { patient } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [conversationsRes, notificationsRes] = await Promise.all([
        apiService.getConversations(),
        apiService.getNotifications(),
      ]);

      if (conversationsRes.success && conversationsRes.data) {
        setConversations(conversationsRes.data.slice(0, 3));
      }
      if (notificationsRes.success && notificationsRes.data) {
        setNotifications(notificationsRes.data.slice(0, 5));
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const unreadMessages = conversations.reduce((sum, conv) => sum + (conv.UnreadCount || 0), 0);
  const unreadNotifications = notifications.filter((n) => !n.IsRead).length;

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Welcome Section */}
      <section style={styles.welcomeSection}>
        <div style={styles.welcomeContent}>
          <h1 style={styles.welcomeTitle}>
            {getGreeting()}, {patient?.FirstName}!
          </h1>
          <p style={styles.welcomeSubtitle}>
            Welcome to your patient portal. Here's an overview of your health information.
          </p>
        </div>
        <div style={styles.welcomeActions}>
          <Link to="/messages" style={styles.primaryAction}>
            <MessageSquare size={20} />
            <span>New Message</span>
          </Link>
        </div>
      </section>

      {error && (
        <div style={styles.errorAlert}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Stats */}
      <section style={styles.statsSection}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#E8F4FD' }}>
            <Mail size={24} color="#0057B8" />
          </div>
          <div style={styles.statContent}>
            <span style={styles.statValue}>{unreadMessages}</span>
            <span style={styles.statLabel}>Unread Messages</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#FEF3C7' }}>
            <Bell size={24} color="#D97706" />
          </div>
          <div style={styles.statContent}>
            <span style={styles.statValue}>{unreadNotifications}</span>
            <span style={styles.statLabel}>New Notifications</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#D1FAE5' }}>
            <Calendar size={24} color="#059669" />
          </div>
          <div style={styles.statContent}>
            <span style={styles.statValue}>0</span>
            <span style={styles.statLabel}>Upcoming Appointments</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#FCE7F3' }}>
            <Heart size={24} color="#DB2777" />
          </div>
          <div style={styles.statContent}>
            <span style={styles.statValue}>Good</span>
            <span style={styles.statLabel}>Health Status</span>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div style={styles.mainGrid}>
        {/* Recent Messages */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              <MessageSquare size={20} />
              <span>Recent Messages</span>
            </h2>
            <Link to="/messages" style={styles.viewAllLink}>
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div style={styles.cardBody}>
            {conversations.length === 0 ? (
              <div style={styles.emptyState}>
                <Mail size={40} color="#999999" />
                <p>No messages yet</p>
                <Link to="/messages" style={styles.emptyStateLink}>
                  Start a conversation
                </Link>
              </div>
            ) : (
              <div style={styles.messageList}>
                {conversations.map((conv) => (
                  <Link
                    key={conv.ConversationId}
                    to={`/messages?conversation=${conv.ConversationId}`}
                    style={styles.messageItem}
                  >
                    <div style={styles.messageAvatar}>
                      {conv.ProviderName?.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div style={styles.messageContent}>
                      <div style={styles.messageHeader}>
                        <span style={styles.messageSender}>{conv.ProviderName}</span>
                        <span style={styles.messageTime}>
                          {conv.LastMessageDate && formatDate(conv.LastMessageDate)}
                        </span>
                      </div>
                      <p style={styles.messageSubject}>{conv.Subject}</p>
                      <p style={styles.messagePreview}>
                        {conv.LastMessage?.substring(0, 60)}
                        {conv.LastMessage && conv.LastMessage.length > 60 ? '...' : ''}
                      </p>
                    </div>
                    {conv.UnreadCount && conv.UnreadCount > 0 && (
                      <span style={styles.unreadBadge}>{conv.UnreadCount}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Notifications */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              <Bell size={20} />
              <span>Notifications</span>
            </h2>
            <Link to="/notifications" style={styles.viewAllLink}>
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div style={styles.cardBody}>
            {notifications.length === 0 ? (
              <div style={styles.emptyState}>
                <Bell size={40} color="#999999" />
                <p>No notifications</p>
              </div>
            ) : (
              <div style={styles.notificationList}>
                {notifications.map((notif) => (
                  <div
                    key={notif.NotificationId}
                    style={{
                      ...styles.notificationItem,
                      backgroundColor: notif.IsRead ? 'transparent' : '#F0F9FF',
                    }}
                  >
                    <div
                      style={{
                        ...styles.notificationDot,
                        backgroundColor: notif.IsRead ? '#E5E5E5' : '#0057B8',
                      }}
                    />
                    <div style={styles.notificationContent}>
                      <p style={styles.notificationTitle}>{notif.Title}</p>
                      <p style={styles.notificationMessage}>{notif.Message}</p>
                      <span style={styles.notificationTime}>
                        <Clock size={12} />
                        {formatDate(notif.CreatedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Quick Actions */}
      <section style={styles.quickActionsSection}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.quickActionsGrid}>
          <Link to="/messages" style={styles.quickActionCard}>
            <div style={{ ...styles.quickActionIcon, backgroundColor: '#E8F4FD' }}>
              <MessageSquare size={28} color="#0057B8" />
            </div>
            <h3 style={styles.quickActionTitle}>Message Your Doctor</h3>
            <p style={styles.quickActionDesc}>Send a secure message to your healthcare team</p>
          </Link>
          <div style={styles.quickActionCard}>
            <div style={{ ...styles.quickActionIcon, backgroundColor: '#D1FAE5' }}>
              <Calendar size={28} color="#059669" />
            </div>
            <h3 style={styles.quickActionTitle}>Schedule Appointment</h3>
            <p style={styles.quickActionDesc}>Book your next visit with a provider</p>
          </div>
          <div style={styles.quickActionCard}>
            <div style={{ ...styles.quickActionIcon, backgroundColor: '#FEF3C7' }}>
              <FileText size={28} color="#D97706" />
            </div>
            <h3 style={styles.quickActionTitle}>View Test Results</h3>
            <p style={styles.quickActionDesc}>Access your lab results and reports</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '1rem',
    color: '#666666',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E5E5E5',
    borderTopColor: '#0057B8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  welcomeSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  welcomeContent: {},
  welcomeTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#1A1A1A',
    marginBottom: '0.5rem',
  },
  welcomeSubtitle: {
    fontSize: '1rem',
    color: '#666666',
  },
  welcomeActions: {
    display: 'flex',
    gap: '1rem',
  },
  primaryAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#0057B8',
    color: '#FFFFFF',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'background-color 150ms ease',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#666666',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #E5E5E5',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1A1A1A',
    margin: 0,
  },
  viewAllLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.875rem',
    color: '#0057B8',
    textDecoration: 'none',
    fontWeight: 500,
  },
  cardBody: {
    padding: '1rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: '#999999',
    gap: '0.75rem',
  },
  emptyStateLink: {
    color: '#0057B8',
    textDecoration: 'none',
    fontWeight: 500,
  },
  messageList: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  messageItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'background-color 150ms ease',
    cursor: 'pointer',
  },
  messageAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#0057B8',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: 600,
    flexShrink: 0,
  },
  messageContent: {
    flex: 1,
    minWidth: 0,
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem',
  },
  messageSender: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: '#1A1A1A',
  },
  messageTime: {
    fontSize: '0.75rem',
    color: '#999999',
  },
  messageSubject: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#333333',
    margin: '0 0 0.25rem 0',
  },
  messagePreview: {
    fontSize: '0.8125rem',
    color: '#666666',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  unreadBadge: {
    minWidth: '22px',
    height: '22px',
    padding: '0 6px',
    backgroundColor: '#0057B8',
    color: '#FFFFFF',
    fontSize: '0.75rem',
    fontWeight: 600,
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationList: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  notificationItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '8px',
  },
  notificationDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginTop: '6px',
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: '#1A1A1A',
    margin: '0 0 0.25rem 0',
  },
  notificationMessage: {
    fontSize: '0.8125rem',
    color: '#666666',
    margin: '0 0 0.5rem 0',
  },
  notificationTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    color: '#999999',
  },
  quickActionsSection: {
    marginTop: '1rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1A1A1A',
    marginBottom: '1rem',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
  },
  quickActionCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    padding: '2rem 1.5rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    textDecoration: 'none',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    cursor: 'pointer',
  },
  quickActionIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  quickActionTitle: {
    fontSize: '1.0625rem',
    fontWeight: 600,
    color: '#1A1A1A',
    marginBottom: '0.5rem',
  },
  quickActionDesc: {
    fontSize: '0.875rem',
    color: '#666666',
    margin: 0,
  },
};

export default Dashboard;
