import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import { Notification } from '../types';
import {
  Bell,
  MessageSquare,
  Calendar,
  AlertCircle,
  Check,
  CheckCheck,
  Trash2,
  Clock,
} from 'lucide-react';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.NotificationId === notificationId ? { ...n, IsRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, IsRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await apiService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.NotificationId !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NewMessage':
        return <MessageSquare size={20} color="#0057B8" />;
      case 'Appointment':
        return <Calendar size={20} color="#059669" />;
      case 'Reminder':
        return <AlertCircle size={20} color="#D97706" />;
      default:
        return <Bell size={20} color="#666666" />;
    }
  };

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.IsRead) : notifications;

  const unreadCount = notifications.filter((n) => !n.IsRead).length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Notifications</h1>
          {unreadCount > 0 && (
            <span style={styles.unreadBadge}>{unreadCount} unread</span>
          )}
        </div>
        <div style={styles.headerRight}>
          {unreadCount > 0 && (
            <button style={styles.markAllBtn} onClick={handleMarkAllAsRead}>
              <CheckCheck size={18} />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      <div style={styles.filterTabs}>
        <button
          style={{
            ...styles.filterTab,
            ...(filter === 'all' ? styles.filterTabActive : {}),
          }}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          style={{
            ...styles.filterTab,
            ...(filter === 'unread' ? styles.filterTabActive : {}),
          }}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div style={styles.notificationsList}>
        {isLoading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={styles.emptyState}>
            <Bell size={64} color="#E5E5E5" />
            <h3>No notifications</h3>
            <p>
              {filter === 'unread'
                ? "You're all caught up!"
                : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.NotificationId}
              style={{
                ...styles.notificationCard,
                backgroundColor: notification.IsRead ? '#FFFFFF' : '#F0F9FF',
              }}
            >
              <div style={styles.notificationIcon}>
                {getNotificationIcon(notification.Type)}
              </div>
              <div style={styles.notificationContent}>
                <div style={styles.notificationHeader}>
                  <h3 style={styles.notificationTitle}>{notification.Title}</h3>
                  <span style={styles.notificationTime}>
                    <Clock size={14} />
                    {formatDate(notification.CreatedAt)}
                  </span>
                </div>
                <p style={styles.notificationMessage}>{notification.Message}</p>
                {notification.Type === 'NewMessage' && notification.RelatedMessageId && (
                  <Link to="/messages" style={styles.viewMessageLink}>
                    View message →
                  </Link>
                )}
              </div>
              <div style={styles.notificationActions}>
                {!notification.IsRead && (
                  <button
                    style={styles.actionBtn}
                    onClick={() => handleMarkAsRead(notification.NotificationId)}
                    title="Mark as read"
                  >
                    <Check size={18} />
                  </button>
                )}
                <button
                  style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                  onClick={() => handleDelete(notification.NotificationId)}
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#1A1A1A',
    margin: 0,
  },
  unreadBadge: {
    padding: '0.375rem 0.75rem',
    backgroundColor: '#0057B8',
    color: '#FFFFFF',
    fontSize: '0.8125rem',
    fontWeight: 500,
    borderRadius: '9999px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  markAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    backgroundColor: '#FFFFFF',
    color: '#0057B8',
    border: '1px solid #0057B8',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  filterTabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid #E5E5E5',
    paddingBottom: '0.5rem',
  },
  filterTab: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: '#666666',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9375rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  filterTabActive: {
    backgroundColor: '#E8F4FD',
    color: '#0057B8',
  },
  notificationsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    color: '#666666',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E5E5E5',
    borderTopColor: '#0057B8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center' as const,
  },
  notificationCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1.25rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
  },
  notificationIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: '#F5F5F5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
    gap: '1rem',
  },
  notificationTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1A1A1A',
    margin: 0,
  },
  notificationTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.8125rem',
    color: '#999999',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  },
  notificationMessage: {
    fontSize: '0.9375rem',
    color: '#666666',
    margin: 0,
    lineHeight: 1.5,
  },
  viewMessageLink: {
    display: 'inline-block',
    marginTop: '0.75rem',
    fontSize: '0.875rem',
    color: '#0057B8',
    fontWeight: 500,
    textDecoration: 'none',
  },
  notificationActions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  actionBtn: {
    width: '36px',
    height: '36px',
    backgroundColor: '#F5F5F5',
    border: 'none',
    borderRadius: '8px',
    color: '#666666',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 150ms ease',
  },
  deleteBtn: {
    color: '#DC3545',
  },
};

export default Notifications;
