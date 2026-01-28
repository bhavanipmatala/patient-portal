import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { Conversation, Message, HealthcareProvider } from '../types';
import {
  Send,
  Search,
  Plus,
  MoreVertical,
  Trash2,
  Archive,
  Check,
  CheckCheck,
  X,
  MessageSquare,
  Clock,
  User,
} from 'lucide-react';

const Messages: React.FC = () => {
  const { patient } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [providers, setProviders] = useState<HealthcareProvider[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showConversationMenu, setShowConversationMenu] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New message form state
  const [newConversation, setNewConversation] = useState({
    providerId: 0,
    subject: '',
    initialMessage: '',
  });

  useEffect(() => {
    fetchConversations();
    fetchProviders();
  }, []);

  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find((c) => c.ConversationId === parseInt(conversationId));
      if (conv) {
        handleSelectConversation(conv);
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getConversations();
      if (response.success && response.data) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await apiService.getProviders();
      if (response.success && response.data) {
        setProviders(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const response = await apiService.getMessages(conversationId);
      if (response.success && response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setSearchParams({ conversation: conversation.ConversationId.toString() });
    await fetchMessages(conversation.ConversationId);
    
    // Mark as read
    if (conversation.UnreadCount && conversation.UnreadCount > 0) {
      await apiService.markConversationAsRead(conversation.ConversationId);
      setConversations((prev) =>
        prev.map((c) =>
          c.ConversationId === conversation.ConversationId ? { ...c, UnreadCount: 0 } : c
        )
      );
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      const response = await apiService.sendMessage(selectedConversation.ConversationId, newMessage);
      if (response.success && response.data) {
        const messageData = response.data;
        setMessages((prev) => [...prev, messageData]);
        setNewMessage('');
        
        // Update conversation's last message
        setConversations((prev) =>
          prev.map((c) =>
            c.ConversationId === selectedConversation.ConversationId
              ? { ...c, LastMessage: newMessage, LastMessageDate: new Date().toISOString() }
              : c
          )
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConversation.providerId || !newConversation.subject || !newConversation.initialMessage) {
      return;
    }

    try {
      const response = await apiService.createConversation(newConversation);
      if (response.success && response.data) {
        const conversationData = response.data;
        setConversations((prev) => [conversationData, ...prev]);
        setShowNewMessageModal(false);
        setNewConversation({ providerId: 0, subject: '', initialMessage: '' });
        handleSelectConversation(conversationData);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleArchiveConversation = async (conversationId: number) => {
    try {
      await apiService.archiveConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.ConversationId !== conversationId));
      if (selectedConversation?.ConversationId === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
        setSearchParams({});
      }
      setShowConversationMenu(null);
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await apiService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.MessageId !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.ProviderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.Subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Sidebar - Conversation List */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Messages</h2>
          <button style={styles.newMessageBtn} onClick={() => setShowNewMessageModal(true)}>
            <Plus size={20} />
          </button>
        </div>

        <div style={styles.searchContainer}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.conversationList}>
          {isLoading ? (
            <div style={styles.loadingState}>Loading conversations...</div>
          ) : filteredConversations.length === 0 ? (
            <div style={styles.emptyState}>
              <MessageSquare size={40} color="#999999" />
              <p>No conversations yet</p>
              <button
                style={styles.startConversationBtn}
                onClick={() => setShowNewMessageModal(true)}
              >
                Start a conversation
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.ConversationId}
                style={{
                  ...styles.conversationItem,
                  ...(selectedConversation?.ConversationId === conv.ConversationId
                    ? styles.conversationItemActive
                    : {}),
                }}
                onClick={() => handleSelectConversation(conv)}
              >
                <div style={styles.conversationAvatar}>
                  {conv.ProviderName?.split(' ').map((n) => n[0]).join('')}
                </div>
                <div style={styles.conversationContent}>
                  <div style={styles.conversationHeader}>
                    <span style={styles.conversationName}>{conv.ProviderName}</span>
                    <span style={styles.conversationTime}>
                      {conv.LastMessageDate && formatDate(conv.LastMessageDate)}
                    </span>
                  </div>
                  <p style={styles.conversationSubject}>{conv.Subject}</p>
                  <p style={styles.conversationPreview}>
                    {conv.LastMessage?.substring(0, 50)}
                    {conv.LastMessage && conv.LastMessage.length > 50 ? '...' : ''}
                  </p>
                </div>
                {conv.UnreadCount && conv.UnreadCount > 0 && (
                  <span style={styles.unreadBadge}>{conv.UnreadCount}</span>
                )}
                <button
                  style={styles.conversationMenuBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConversationMenu(
                      showConversationMenu === conv.ConversationId ? null : conv.ConversationId
                    );
                  }}
                >
                  <MoreVertical size={16} />
                </button>
                {showConversationMenu === conv.ConversationId && (
                  <div style={styles.conversationMenu}>
                    <button
                      style={styles.menuItem}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveConversation(conv.ConversationId);
                      }}
                    >
                      <Archive size={16} />
                      <span>Archive</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={styles.chatArea}>
        {selectedConversation ? (
          <>
            <div style={styles.chatHeader}>
              <div style={styles.chatHeaderInfo}>
                <div style={styles.chatAvatar}>
                  {selectedConversation.ProviderName?.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 style={styles.chatName}>{selectedConversation.ProviderName}</h3>
                  <p style={styles.chatSpecialty}>
                    {selectedConversation.ProviderSpecialty} • {selectedConversation.ProviderDepartment}
                  </p>
                </div>
              </div>
              <div style={styles.chatSubject}>
                <span>Subject: {selectedConversation.Subject}</span>
              </div>
            </div>

            <div style={styles.messagesContainer}>
              {messages.map((message, index) => {
                const isPatient = message.SenderType === 'Patient';
                const showDate =
                  index === 0 ||
                  formatDate(messages[index - 1].CreatedAt) !== formatDate(message.CreatedAt);

                return (
                  <React.Fragment key={message.MessageId}>
                    {showDate && (
                      <div style={styles.dateDivider}>
                        <span>{formatDate(message.CreatedAt)}</span>
                      </div>
                    )}
                    <div
                      style={{
                        ...styles.messageWrapper,
                        justifyContent: isPatient ? 'flex-end' : 'flex-start',
                      }}
                    >
                      {!isPatient && (
                        <div style={styles.messageAvatar}>
                          {message.SenderName?.split(' ').map((n) => n[0]).join('')}
                        </div>
                      )}
                      <div
                        style={{
                          ...styles.messageBubble,
                          ...(isPatient ? styles.messageBubblePatient : styles.messageBubbleProvider),
                        }}
                      >
                        {!isPatient && (
                          <span style={styles.messageSenderName}>{message.SenderName}</span>
                        )}
                        <p style={styles.messageText}>{message.Content}</p>
                        <div style={styles.messageFooter}>
                          <span style={styles.messageTime}>{formatTime(message.CreatedAt)}</span>
                          {isPatient && (
                            <span style={styles.messageStatus}>
                              {message.IsRead ? (
                                <CheckCheck size={14} color="#0057B8" />
                              ) : (
                                <Check size={14} color="#999999" />
                              )}
                            </span>
                          )}
                        </div>
                        {isPatient && (
                          <button
                            style={styles.deleteMessageBtn}
                            onClick={() => handleDeleteMessage(message.MessageId)}
                            title="Delete message"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form style={styles.messageInputContainer} onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={styles.messageInput}
              />
              <button
                type="submit"
                style={styles.sendBtn}
                disabled={!newMessage.trim() || isSending}
              >
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div style={styles.noConversationSelected}>
            <MessageSquare size={64} color="#E5E5E5" />
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the list or start a new one</p>
            <button
              style={styles.startConversationBtnLarge}
              onClick={() => setShowNewMessageModal(true)}
            >
              <Plus size={20} />
              <span>New Message</span>
            </button>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div style={styles.modalOverlay} onClick={() => setShowNewMessageModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>New Message</h2>
              <button style={styles.modalCloseBtn} onClick={() => setShowNewMessageModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateConversation} style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Select Healthcare Provider</label>
                <select
                  value={newConversation.providerId}
                  onChange={(e) =>
                    setNewConversation({ ...newConversation, providerId: parseInt(e.target.value) })
                  }
                  style={styles.formSelect}
                  required
                >
                  <option value={0}>Choose a provider...</option>
                  {providers.map((provider) => (
                    <option key={provider.ProviderId} value={provider.ProviderId}>
                      Dr. {provider.FirstName} {provider.LastName} - {provider.Specialty}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Subject</label>
                <input
                  type="text"
                  value={newConversation.subject}
                  onChange={(e) =>
                    setNewConversation({ ...newConversation, subject: e.target.value })
                  }
                  placeholder="Enter message subject"
                  style={styles.formInput}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Message</label>
                <textarea
                  value={newConversation.initialMessage}
                  onChange={(e) =>
                    setNewConversation({ ...newConversation, initialMessage: e.target.value })
                  }
                  placeholder="Type your message here..."
                  style={styles.formTextarea}
                  rows={5}
                  required
                />
              </div>
              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowNewMessageModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 70px)',
    backgroundColor: '#F5F5F5',
  },
  sidebar: {
    width: '360px',
    backgroundColor: '#FFFFFF',
    borderRight: '1px solid #E5E5E5',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1rem',
    borderBottom: '1px solid #E5E5E5',
  },
  sidebarTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1A1A1A',
    margin: 0,
  },
  newMessageBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#0057B8',
    color: '#FFFFFF',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  searchContainer: {
    position: 'relative' as const,
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #E5E5E5',
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '1.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999999',
  },
  searchInput: {
    width: '100%',
    padding: '0.625rem 1rem 0.625rem 2.5rem',
    fontSize: '0.9375rem',
    border: '1px solid #E5E5E5',
    borderRadius: '8px',
    outline: 'none',
  },
  conversationList: {
    flex: 1,
    overflowY: 'auto' as const,
  },
  loadingState: {
    padding: '2rem',
    textAlign: 'center' as const,
    color: '#666666',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    color: '#999999',
    gap: '1rem',
  },
  startConversationBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#0057B8',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  conversationItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1rem',
    cursor: 'pointer',
    borderBottom: '1px solid #F0F0F0',
    position: 'relative' as const,
    transition: 'background-color 150ms ease',
  },
  conversationItemActive: {
    backgroundColor: '#E8F4FD',
  },
  conversationAvatar: {
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
  conversationContent: {
    flex: 1,
    minWidth: 0,
  },
  conversationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem',
  },
  conversationName: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: '#1A1A1A',
  },
  conversationTime: {
    fontSize: '0.75rem',
    color: '#999999',
  },
  conversationSubject: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#333333',
    margin: '0 0 0.25rem 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  conversationPreview: {
    fontSize: '0.8125rem',
    color: '#666666',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  unreadBadge: {
    position: 'absolute' as const,
    right: '40px',
    top: '50%',
    transform: 'translateY(-50%)',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    backgroundColor: '#0057B8',
    color: '#FFFFFF',
    fontSize: '0.6875rem',
    fontWeight: 600,
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationMenuBtn: {
    position: 'absolute' as const,
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '28px',
    height: '28px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#999999',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationMenu: {
    position: 'absolute' as const,
    right: '8px',
    top: '60px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 100,
    overflow: 'hidden',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#333333',
    fontSize: '0.875rem',
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#FFFFFF',
  },
  chatHeader: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #E5E5E5',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatHeaderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  chatAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#0057B8',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 600,
  },
  chatName: {
    fontSize: '1.0625rem',
    fontWeight: 600,
    color: '#1A1A1A',
    margin: 0,
  },
  chatSpecialty: {
    fontSize: '0.8125rem',
    color: '#666666',
    margin: 0,
  },
  chatSubject: {
    fontSize: '0.875rem',
    color: '#666666',
    backgroundColor: '#F5F5F5',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '1rem 1.5rem',
  },
  dateDivider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '1.5rem 0',
  },
  messageWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  messageAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#00A3AD',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
    flexShrink: 0,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '0.875rem 1rem',
    borderRadius: '16px',
    position: 'relative' as const,
  },
  messageBubblePatient: {
    backgroundColor: '#0057B8',
    color: '#FFFFFF',
    borderBottomRightRadius: '4px',
  },
  messageBubbleProvider: {
    backgroundColor: '#F0F0F0',
    color: '#1A1A1A',
    borderBottomLeftRadius: '4px',
  },
  messageSenderName: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
    color: '#0057B8',
  },
  messageText: {
    margin: 0,
    fontSize: '0.9375rem',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap' as const,
  },
  messageFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.25rem',
    marginTop: '0.5rem',
  },
  messageTime: {
    fontSize: '0.6875rem',
    opacity: 0.7,
  },
  messageStatus: {
    display: 'flex',
    alignItems: 'center',
  },
  deleteMessageBtn: {
    position: 'absolute' as const,
    top: '4px',
    right: '4px',
    width: '24px',
    height: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '4px',
    color: '#FFFFFF',
    cursor: 'pointer',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #E5E5E5',
  },
  messageInput: {
    flex: 1,
    padding: '0.875rem 1rem',
    fontSize: '1rem',
    border: '1px solid #E5E5E5',
    borderRadius: '24px',
    outline: 'none',
  },
  sendBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#0057B8',
    color: '#FFFFFF',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  noConversationSelected: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999999',
    gap: '1rem',
  },
  startConversationBtnLarge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#0057B8',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 500,
    marginTop: '0.5rem',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #E5E5E5',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1A1A1A',
    margin: 0,
  },
  modalCloseBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#666666',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  modalBody: {
    padding: '1.5rem',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  formLabel: {
    display: 'block',
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: '#333333',
    marginBottom: '0.5rem',
  },
  formInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: '1px solid #E5E5E5',
    borderRadius: '8px',
    outline: 'none',
  },
  formSelect: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: '1px solid #E5E5E5',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#FFFFFF',
  },
  formTextarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: '1px solid #E5E5E5',
    borderRadius: '8px',
    outline: 'none',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 500,
    backgroundColor: '#F5F5F5',
    color: '#666666',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 500,
    backgroundColor: '#0057B8',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default Messages;
