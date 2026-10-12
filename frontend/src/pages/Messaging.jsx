import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { LoadingSpinner } from '../components/UIHelpers';
import Modal from '../components/Modal';
import {
  Send,
  MessageSquare,
  Plus,
  Search,
  User,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Check,
  CheckCheck,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Smile,
  X,
  ExternalLink
} from 'lucide-react';

const QUICK_EMOJIS = ['👍', '👋', '🎉', '💡', '🎓', '🚀', '❤️', '🙌'];
const QUICK_REPLIES = [
  'Hi! How are you?',
  'Thank you for reaching out!',
  'Could we schedule a quick call?',
  'Sounds great to me!'
];

const Messaging = () => {
  const { user } = useAuth();
  const { socket, isOnline } = useSocketContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetUserId = searchParams.get('userId');

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);



  // Sidebar filters and search
  const [convSearch, setConvSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' or 'unread'

  // Chat message search
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  // Typing status
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // New Chat Modal States
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Clear Chat Modal
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearingChat, setClearingChat] = useState(false);

  // Emoji picker toggle
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Responsive mobile view toggle (when on narrow screen)
  const [mobileViewActive, setMobileViewActive] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(() => window.innerWidth < 768);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileScreen(mobile);
      if (!mobile) setMobileViewActive(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };



  // Fetch all conversations
  const fetchConversations = async (preserveActiveId = null) => {
    try {
      const res = await API.get('/messages/conversations');
      setConversations(res.data);

      const currentActiveId = preserveActiveId || activeConv?._id;

      if (targetUserId) {
        // Find existing or create conversation with target user
        const existing = res.data.find(c => c.otherParticipant?._id === targetUserId);
        if (existing) {
          if (!activeConv || activeConv._id !== existing._id) {
            setActiveConv(existing);
            if (isMobileScreen) setMobileViewActive(true);
          }
        } else {
          try {
            const userConvRes = await API.get(`/messages/user/${targetUserId}`);
            setActiveConv(userConvRes.data);
            setConversations(prev => {
              if (prev.some(c => c._id === userConvRes.data._id)) return prev;
              return [userConvRes.data, ...prev];
            });
            if (isMobileScreen) setMobileViewActive(true);
          } catch (err) {
            console.error('Error starting chat with target user:', err);
          }
        }
      } else if (currentActiveId) {
        const found = res.data.find(c => c._id === currentActiveId);
        if (found) setActiveConv(found);
      } else if (res.data.length > 0 && !activeConv && !isMobileScreen) {
        setActiveConv(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (convId) => {
    if (!convId) return;
    try {
      setLoadingMsgs(true);
      const res = await API.get(`/messages/${convId}`);
      setMessages(res.data);

      // Mark unread in state
      setConversations(prev =>
        prev.map(c => (c._id === convId ? { ...c, unreadCount: 0 } : c))
      );

      // Emit socket event that messages were read
      if (socket && activeConv?.otherParticipant?._id) {
        socket.emit('mark_read', {
          conversationId: convId,
          readerId: user?._id,
          senderId: activeConv.otherParticipant._id
        });
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMsgs(false);
      setTimeout(() => scrollToBottom('auto'), 50);
    }
  };

  // Fetch eligible users for new chat modal
  const fetchEligibleUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await API.get('/messages/users/search');
      setEligibleUsers(res.data);
    } catch (err) {
      console.error('Error fetching eligible users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [targetUserId]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConv?._id) {
      fetchMessages(activeConv._id);
    }
  }, [activeConv?._id]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    // Receive new message
    const handleNewMessage = (incomingMsg) => {
      const incomingConvId = incomingMsg.conversation?._id || incomingMsg.conversation;

      if (activeConv && incomingConvId?.toString() === activeConv._id?.toString()) {
        setMessages(prev => {
          if (prev.some(m => m._id === incomingMsg._id)) return prev;
          return [...prev, incomingMsg];
        });

        // If current user is receiver, mark as read immediately
        const receiverId = incomingMsg.receiver?._id || incomingMsg.receiver;
        if (receiverId?.toString() === user?._id?.toString()) {
          API.put(`/messages/${activeConv._id}/read`).catch(() => {});
          socket.emit('mark_read', {
            conversationId: activeConv._id,
            readerId: user?._id,
            senderId: incomingMsg.sender?._id || incomingMsg.sender
          });
        }

        setTimeout(() => scrollToBottom('smooth'), 50);
      }

      // Update conversations list in real time
      setConversations(prev => {
        let matched = false;
        const updated = prev.map(c => {
          if (c._id?.toString() === incomingConvId?.toString()) {
            matched = true;
            const isCurrentActive = activeConv && activeConv._id === c._id;
            const receiverId = incomingMsg.receiver?._id || incomingMsg.receiver;
            const isForMe = receiverId?.toString() === user?._id?.toString();

            return {
              ...c,
              lastMessage: incomingMsg,
              updatedAt: new Date().toISOString(),
              unreadCount: isCurrentActive || !isForMe ? 0 : (c.unreadCount || 0) + 1
            };
          }
          return c;
        });

        if (!matched) {
          fetchConversations(activeConv?._id);
          return prev;
        }

        // Sort by newest updatedAt
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    };

    // Messages read receipt event
    const handleMessagesRead = ({ conversationId }) => {
      if (activeConv && conversationId?.toString() === activeConv._id?.toString()) {
        setMessages(prev =>
          prev.map(m => {
            const senderId = m.sender?._id || m.sender;
            if (senderId?.toString() === user?._id?.toString()) {
              return { ...m, isRead: true };
            }
            return m;
          })
        );
      }
    };

    // User typing indicator
    const handleUserTyping = ({ conversationId, userId, isTyping: typingStatus }) => {
      if (
        activeConv &&
        conversationId?.toString() === activeConv._id?.toString() &&
        userId?.toString() !== user?._id?.toString()
      ) {
        setIsTyping(typingStatus);
      }
    };

    // Single message deleted
    const handleMessageDeleted = ({ messageId, conversationId }) => {
      if (activeConv && conversationId?.toString() === activeConv._id?.toString()) {
        setMessages(prev => prev.filter(m => m._id !== messageId));
      }
      fetchConversations(activeConv?._id);
    };

    // Entire conversation cleared
    const handleConversationCleared = ({ conversationId }) => {
      if (activeConv && conversationId?.toString() === activeConv._id?.toString()) {
        setMessages([]);
      }
      fetchConversations(activeConv?._id);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('messages_read', handleMessagesRead);
    socket.on('user_typing', handleUserTyping);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('conversation_cleared', handleConversationCleared);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('user_typing', handleUserTyping);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('conversation_cleared', handleConversationCleared);
    };
  }, [socket, activeConv?._id, user?._id]);

  // Handle typing input changes and emit typing status
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (socket && activeConv?.otherParticipant?._id) {
      socket.emit('typing', {
        conversationId: activeConv._id,
        userId: user._id,
        receiverId: activeConv.otherParticipant._id,
        isTyping: true
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (socket && activeConv?.otherParticipant?._id) {
          socket.emit('typing', {
            conversationId: activeConv._id,
            userId: user._id,
            receiverId: activeConv.otherParticipant._id,
            isTyping: false
          });
        }
      }, 1500);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeConv || sendingMsg) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setShowEmojiPicker(false);

    // Cancel typing status immediately
    if (socket && activeConv?.otherParticipant?._id) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit('typing', {
        conversationId: activeConv._id,
        userId: user._id,
        receiverId: activeConv.otherParticipant._id,
        isTyping: false
      });
    }

    try {
      setSendingMsg(true);
      const targetId = activeConv.otherParticipant._id;
      const res = await API.post('/messages/send', {
        receiverId: targetId,
        content: messageText
      });

      // Avoid duplicate append if socket event arrived first
      setMessages(prev => {
        if (prev.some(m => m._id === res.data._id)) return prev;
        return [...prev, res.data];
      });

      // Update conversations list locally
      setConversations(prev => {
        const updated = prev.map(c => {
          if (c._id === activeConv._id) {
            return {
              ...c,
              lastMessage: res.data,
              updatedAt: new Date().toISOString(),
              unreadCount: 0
            };
          }
          return c;
        });
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });

      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (err) {
      console.error('Failed to send message:', err);
      alert(err.response?.data?.message || 'Failed to send message');
      setNewMessage(messageText); // restore on failure
    } finally {
      setSendingMsg(false);
    }
  };

  // Delete single message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message for everyone?')) return;
    try {
      await API.delete(`/messages/${messageId}`);
      setMessages(prev => prev.filter(m => m._id !== messageId));
      fetchConversations(activeConv?._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete message');
    }
  };

  // Clear entire conversation
  const handleClearConversation = async () => {
    if (!activeConv) return;
    try {
      setClearingChat(true);
      await API.delete(`/messages/conversation/${activeConv._id}`);
      setMessages([]);
      setShowClearModal(false);
      fetchConversations(activeConv._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear conversation');
    } finally {
      setClearingChat(false);
    }
  };

  // Select contact
  const handleSelectConversation = (conv) => {
    setActiveConv(conv);
    if (conv.otherParticipant?._id) {
      setSearchParams({ userId: conv.otherParticipant._id });
    }
    if (isMobileScreen) {
      setMobileViewActive(true);
    }
  };

  // Start chat with user from modal
  const handleStartChatWithUser = async (targetUser) => {
    try {
      setShowNewChatModal(false);
      const userConvRes = await API.get(`/messages/user/${targetUser._id}`);
      setActiveConv(userConvRes.data);
      setConversations(prev => {
        if (prev.some(c => c._id === userConvRes.data._id)) return prev;
        return [userConvRes.data, ...prev];
      });
      setSearchParams({ userId: targetUser._id });
      if (isMobileScreen) setMobileViewActive(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start chat');
    }
  };

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const other = conv.otherParticipant;
      if (!other) return false;
      const matchesSearch =
        convSearch === '' ||
        other.name?.toLowerCase().includes(convSearch.toLowerCase()) ||
        other.email?.toLowerCase().includes(convSearch.toLowerCase()) ||
        conv.lastMessage?.content?.toLowerCase().includes(convSearch.toLowerCase());

      if (!matchesSearch) return false;
      if (filterType === 'unread') return (conv.unreadCount || 0) > 0;
      return true;
    });
  }, [conversations, convSearch, filterType]);

  // Filter messages within current chat
  const filteredMessages = useMemo(() => {
    if (!chatSearchQuery.trim()) return messages;
    return messages.filter(m =>
      m.content?.toLowerCase().includes(chatSearchQuery.toLowerCase())
    );
  }, [messages, chatSearchQuery]);

  // Filter eligible users in modal
  const filteredEligibleUsers = useMemo(() => {
    return eligibleUsers.filter(u =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [eligibleUsers, searchQuery]);

  // Format message timestamp
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date header divider
  const formatDateHeader = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format conversation list timestamp
  const formatConvTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24 && d.getDate() === now.getDate()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getRoleIcon = (role) => {
    if (role === 'admin') return <ShieldCheck size={14} color="var(--danger)" />;
    if (role === 'alumni') return <Briefcase size={14} color="var(--primary)" />;
    return <GraduationCap size={14} color="var(--success)" />;
  };

  const totalUnreadCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  if (loadingConvs) {
    return <LoadingSpinner message="Loading your chats and conversations..." />;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobileScreen ? '1fr' : '340px 1fr',
      gap: 0,
      height: 'calc(100vh - 120px)',
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-md)',
      position: 'relative'
    }}>
      {/* ================= LEFT SIDEBAR: CONVERSATIONS LIST ================= */}
      <div style={{
        borderRight: isMobileScreen ? 'none' : '1px solid var(--border)',
        display: isMobileScreen && mobileViewActive ? 'none' : 'flex',
        flexDirection: 'column',
        background: '#f8fafc',
        height: '100%',
        minWidth: 0
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '1.1rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          background: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontWeight: '700',
              fontSize: '1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-primary)'
            }}>
              <MessageSquare size={20} color="var(--primary)" />
              Messages
              {totalUnreadCount > 0 && (
                <span style={{
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}>
                  {totalUnreadCount}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={() => {
              fetchEligibleUsers();
              setShowNewChatModal(true);
            }}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
            title="Start a new chat"
          >
            <Plus size={15} /> New Chat
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ padding: '0.85rem 1rem', background: 'white', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', marginBottom: '0.6rem' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search conversations..."
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              style={{
                paddingLeft: '32px',
                paddingTop: '0.45rem',
                paddingBottom: '0.45rem',
                fontSize: '0.85rem',
                borderRadius: '8px',
                background: '#f8fafc'
              }}
            />
            {convSearch && (
              <button
                onClick={() => setConvSearch('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '8px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setFilterType('all')}
              style={{
                flex: 1,
                padding: '4px 8px',
                fontSize: '0.78rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: filterType === 'all' ? 'var(--primary)' : '#f1f5f9',
                color: filterType === 'all' ? 'white' : 'var(--text-secondary)'
              }}
            >
              All ({conversations.length})
            </button>
            <button
              onClick={() => setFilterType('unread')}
              style={{
                flex: 1,
                padding: '4px 8px',
                fontSize: '0.78rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: filterType === 'unread' ? 'var(--primary)' : '#f1f5f9',
                color: filterType === 'unread' ? 'white' : 'var(--text-secondary)'
              }}
            >
              Unread {totalUnreadCount > 0 ? `(${totalUnreadCount})` : ''}
            </button>
          </div>
        </div>

        {/* Conversation Items List */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filteredConversations.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'var(--primary)'
              }}>
                <MessageSquare size={24} />
              </div>
              <p style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {convSearch ? 'No matches found' : 'No chats yet'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                {convSearch ? `No conversation matches "${convSearch}"` : 'Connect with alumni or fellow students to begin chatting.'}
              </p>
              <button
                onClick={() => {
                  fetchEligibleUsers();
                  setShowNewChatModal(true);
                }}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '8px' }}
              >
                <Plus size={14} style={{ marginRight: 4 }} /> Start New Chat
              </button>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const other = conv.otherParticipant;
              const isActive = activeConv?._id === conv._id;
              const online = isOnline(other?._id);

              return (
                <div
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  style={{
                    padding: '0.9rem 1.1rem',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: isActive ? '#eff6ff' : 'transparent',
                    borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
                    transition: 'background 0.15s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {/* Avatar with Online Dot */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div
                        className="avatar"
                        style={{
                          width: '42px',
                          height: '42px',
                          fontSize: '1rem',
                          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          color: 'white',
                          fontWeight: '700'
                        }}
                      >
                        {other?.name ? other.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      {online && (
                        <span
                          title="Online now"
                          style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            width: '12px',
                            height: '12px',
                            background: '#10b981',
                            border: '2px solid white',
                            borderRadius: '50%'
                          }}
                        />
                      )}
                    </div>

                    {/* Name, Role & Preview */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                        <div style={{
                          fontWeight: isActive ? '700' : '600',
                          fontSize: '0.925rem',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          <span>{other?.name || 'Unknown User'}</span>
                          {getRoleIcon(other?.role)}
                        </div>

                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '6px' }}>
                          {formatConvTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                        <p style={{
                          fontSize: '0.8rem',
                          color: conv.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontWeight: conv.unreadCount > 0 ? '600' : '400',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          margin: 0,
                          flex: 1
                        }}>
                          {conv.lastMessage ? (
                            <>
                              <span style={{ color: 'var(--text-muted)' }}>
                                {conv.lastMessage.sender?._id === user?._id || conv.lastMessage.sender === user?._id
                                  ? 'You: '
                                  : ''}
                              </span>
                              {conv.lastMessage.content}
                            </>
                          ) : (
                            <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No messages yet</span>
                          )}
                        </p>

                        {conv.unreadCount > 0 && (
                          <span style={{
                            background: 'var(--primary)',
                            color: 'white',
                            borderRadius: '10px',
                            minWidth: '20px',
                            height: '20px',
                            padding: '0 6px',
                            fontSize: '0.72rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            flexShrink: 0
                          }}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= RIGHT PANEL: CHAT STREAM & COMPOSER ================= */}
      <div style={{
        display: isMobileScreen && !mobileViewActive ? 'none' : 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#ffffff',
        minWidth: 0,
        position: 'relative'
      }}>
        {activeConv ? (
          <>
            {/* Active Chat Header */}
            <div style={{
              padding: '0.85rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'white',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                {/* Mobile Back Button */}
                {isMobileScreen && (
                  <button
                    onClick={() => setMobileViewActive(false)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '6px', borderRadius: '8px' }}
                    title="Back to conversations"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}

                {/* Avatar with status */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div
                    className="avatar"
                    style={{
                      width: '42px',
                      height: '42px',
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      color: 'white',
                      fontWeight: '700'
                    }}
                  >
                    {activeConv.otherParticipant?.name
                      ? activeConv.otherParticipant.name.charAt(0).toUpperCase()
                      : 'U'}
                  </div>
                  {isOnline(activeConv.otherParticipant?._id) && (
                    <span
                      title="Online"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '12px',
                        height: '12px',
                        background: '#10b981',
                        border: '2px solid white',
                        borderRadius: '50%'
                      }}
                    />
                  )}
                </div>

                {/* User Name & Status */}
                <div style={{ minWidth: 0 }}>
                  <h3 style={{
                    fontSize: '1.05rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--text-primary)',
                    margin: 0
                  }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeConv.otherParticipant?.name}
                    </span>
                    {getRoleIcon(activeConv.otherParticipant?.role)}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isTyping ? (
                      <span style={{ color: 'var(--primary)', fontWeight: '600' }}>typing...</span>
                    ) : isOnline(activeConv.otherParticipant?._id) ? (
                      <span style={{ color: '#10b981', fontWeight: '500' }}>Active now</span>
                    ) : (
                      <span style={{ textTransform: 'capitalize' }}>
                        {activeConv.otherParticipant?.role || 'Member'} • Offline
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Chat Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {/* Search In Chat Toggle */}
                <button
                  onClick={() => setShowInChatSearch(!showInChatSearch)}
                  className="btn btn-outline btn-sm"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: showInChatSearch ? 'var(--primary-light)' : 'transparent',
                    borderColor: showInChatSearch ? 'var(--primary)' : 'var(--border)'
                  }}
                  title="Search inside this conversation"
                >
                  <Search size={15} />
                </button>

                {/* View Profile Link */}
                <button
                  onClick={() => {
                    const role = activeConv.otherParticipant?.role;
                    if (role === 'alumni') {
                      navigate(`/${user.role}/alumni`);
                    } else if (role === 'student') {
                      navigate(`/${user.role}/students`);
                    } else {
                      navigate(`/${user.role}/profile`);
                    }
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '6px 10px', borderRadius: '8px' }}
                  title="View user details"
                >
                  <ExternalLink size={15} />
                </button>


                {/* Clear Chat Button */}
                <button
                  onClick={() => setShowClearModal(true)}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '6px 10px', borderRadius: '8px', color: 'var(--danger)' }}
                  title="Clear conversation"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* In-Chat Search Bar Dropdown */}
            {showInChatSearch && (
              <div style={{
                padding: '0.6rem 1.25rem',
                background: '#f1f5f9',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Search size={15} color="var(--text-muted)" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search in conversation..."
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  style={{ flex: 1, padding: '4px 10px', fontSize: '0.85rem', borderRadius: '6px' }}
                  autoFocus
                />
                {chatSearchQuery && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {filteredMessages.length} match(es)
                  </span>
                )}
                <button
                  onClick={() => {
                    setShowInChatSearch(false);
                    setChatSearchQuery('');
                  }}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Message Stream */}
            <div style={{
              flex: 1,
              padding: '1.25rem',
              overflowY: 'auto',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {loadingMsgs ? (
                <div style={{ margin: 'auto' }}>
                  <LoadingSpinner message="Retrieving conversation history..." />
                </div>
              ) : messages.length === 0 ? (
                <div style={{
                  margin: 'auto',
                  textAlign: 'center',
                  padding: '2rem',
                  maxWidth: '400px',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    color: 'var(--primary)'
                  }}>
                    <MessageSquare size={28} />
                  </div>
                  <h4 style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Say hello to {activeConv.otherParticipant?.name}!
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    This is the start of your direct conversation. Break the ice by sending a quick message below.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                    {QUICK_REPLIES.map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => setNewMessage(reply)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.78rem', borderRadius: '16px' }}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                filteredMessages.map((msg, index) => {
                  const senderId = (msg.sender?._id || msg.sender)?.toString();
                  const receiverId = (msg.receiver?._id || msg.receiver)?.toString();
                  const currentUserId = user?._id?.toString();

                  // Determine if logged-in user is the sender of this message
                  const isSender = senderId === currentUserId;

                  // Date divider check
                  const prevMsg = index > 0 ? filteredMessages[index - 1] : null;
                  const showDateHeader =
                    !prevMsg ||
                    new Date(prevMsg.createdAt).toDateString() !==
                      new Date(msg.createdAt).toDateString();

                  return (
                    <React.Fragment key={msg._id || index}>
                      {/* Date Divider */}
                      {showDateHeader && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0.75rem 0'
                        }}>
                          <span style={{
                            background: '#e2e8f0',
                            color: '#475569',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            padding: '3px 12px',
                            borderRadius: '12px'
                          }}>
                            {formatDateHeader(msg.createdAt)}
                          </span>
                        </div>
                      )}

                      {/* Message Bubble Container: Sender right, Receiver left */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: isSender ? 'flex-end' : 'flex-start',
                          alignItems: 'flex-end',
                          gap: '8px',
                          position: 'relative'
                        }}
                      >
                        {/* Bubble */}
                        <div
                          style={{
                            maxWidth: '72%',
                            minWidth: '140px',
                            background: isSender
                              ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                              : '#ffffff',
                            color: isSender ? '#ffffff' : 'var(--text-primary)',
                            padding: '0.65rem 0.95rem',
                            borderRadius: isSender
                              ? '14px 14px 2px 14px'
                              : '14px 14px 14px 2px',
                            boxShadow: 'var(--shadow-sm)',
                            border: isSender ? 'none' : '1px solid #cbd5e1',
                            position: 'relative'
                          }}
                        >
                          {/* Bubble Subtitle / Sender Label */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            color: isSender ? '#dbeafe' : 'var(--primary)'
                          }}>
                            <span>
                              {isSender
                                ? 'You'
                                : activeConv.otherParticipant?.name || 'Receiver'}
                            </span>

                            {/* Delete button (if message was sent by current user or admin) */}
                            {(isSender || user?.role === 'admin') && (
                              <button
                                onClick={() => handleDeleteMessage(msg._id)}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  color: isSender ? '#cbd5e1' : 'var(--text-muted)',
                                  padding: '0 2px'
                                }}
                                title="Delete this message"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>

                          {/* Message Content */}
                          <p style={{
                            fontSize: '0.925rem',
                            lineHeight: 1.45,
                            wordBreak: 'break-word',
                            margin: 0,
                            whiteSpace: 'pre-wrap'
                          }}>
                            {msg.content}
                          </p>

                          {/* Message Footer: Timestamp & Read Status */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '4px',
                            fontSize: '0.68rem',
                            marginTop: '4px',
                            color: isSender ? '#dbeafe' : 'var(--text-muted)'
                          }}>
                            <span>{formatTime(msg.createdAt)}</span>
                            {/* Read Receipts */}
                            {isSender && (
                              <span title={msg.isRead ? 'Read' : 'Delivered'} style={{ display: 'inline-flex' }}>
                                {msg.isRead ? (
                                  <CheckCheck size={14} color="#93c5fd" />
                                ) : (
                                  <Check size={14} color="#bfdbfe" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}

              {/* Typing indicator bubble */}
              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px' }}>
                  <div style={{
                    background: '#e2e8f0',
                    borderRadius: '16px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ fontStyle: 'italic' }}>
                      {activeConv.otherParticipant?.name} is typing
                    </span>
                    <span style={{ display: 'inline-flex', gap: '2px' }}>
                      <span style={{ animation: 'pulse 1s infinite', animationDelay: '0ms' }}>•</span>
                      <span style={{ animation: 'pulse 1s infinite', animationDelay: '200ms' }}>•</span>
                      <span style={{ animation: 'pulse 1s infinite', animationDelay: '400ms' }}>•</span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Emojis Bar (if open) */}
            {showEmojiPicker && (
              <div style={{
                padding: '0.5rem 1.25rem',
                background: '#f1f5f9',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                  Quick Emojis:
                </span>
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setNewMessage(prev => prev + emoji);
                    }}
                    style={{
                      border: 'none',
                      background: 'white',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Input Composer Footer */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'white'
              }}
            >
              {/* Emoji toggle button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="btn btn-outline"
                style={{
                  padding: '0.65rem',
                  borderRadius: '8px',
                  background: showEmojiPicker ? 'var(--primary-light)' : 'transparent',
                  borderColor: showEmojiPicker ? 'var(--primary)' : 'var(--border)'
                }}
                title="Insert quick emojis"
              >
                <Smile size={18} />
              </button>

              {/* Message Input */}
              <input
                type="text"
                className="form-input"
                placeholder={`Type a message to ${activeConv.otherParticipant?.name || 'user'}... (Press Enter to send)`}
                value={newMessage}
                onChange={handleInputChange}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  fontSize: '0.925rem',
                  borderRadius: '8px',
                  background: '#f8fafc'
                }}
                autoFocus
              />

              {/* Send Button */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!newMessage.trim() || sendingMsg}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: !newMessage.trim() || sendingMsg ? 0.6 : 1
                }}
              >
                <Send size={16} />
                <span style={{ display: isMobileScreen ? 'none' : 'inline' }}>
                  {sendingMsg ? 'Sending...' : 'Send'}
                </span>
              </button>
            </form>
          </>
        ) : (
          /* Empty Active State */
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            padding: '3rem 2rem',
            maxWidth: '460px'
          }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: 'var(--primary)'
            }}>
              <MessageSquare size={36} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Select a Conversation
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Choose a contact from the list on the left to review your chat history, or click <strong>New Chat</strong> to connect with an alumnus or student.
            </p>
            <button
              onClick={() => {
                fetchEligibleUsers();
                setShowNewChatModal(true);
              }}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}
            >
              <Plus size={16} /> Start a New Chat
            </button>
          </div>
        )}
      </div>

      {/* ================= MODAL: START NEW CHAT ================= */}
      {showNewChatModal && (
        <Modal
          isOpen={showNewChatModal}
          onClose={() => setShowNewChatModal(false)}
          title="Start New Chat Conversation"
        >
          <div>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search alumni or students by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '34px', borderRadius: '8px' }}
                autoFocus
              />
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
            </div>

            <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
              {loadingUsers ? (
                <LoadingSpinner message="Loading registered users..." />
              ) : filteredEligibleUsers.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.9rem' }}>
                  {searchQuery ? `No users matching "${searchQuery}"` : 'No users available to chat with.'}
                </p>
              ) : (
                filteredEligibleUsers.map(u => {
                  const online = isOnline(u._id);
                  return (
                    <div
                      key={u._id}
                      onClick={() => handleStartChatWithUser(u)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius)',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                          <div
                            className="avatar"
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                              color: 'white',
                              fontWeight: '700'
                            }}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          {online && (
                            <span
                              title="Online"
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: '10px',
                                height: '10px',
                                background: '#10b981',
                                border: '2px solid white',
                                borderRadius: '50%'
                              }}
                            />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.925rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {u.name}
                            {getRoleIcon(u.role)}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {u.email} • <span style={{ textTransform: 'capitalize' }}>{u.role}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                      >
                        Chat
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL: CLEAR CHAT CONFIRMATION ================= */}
      {showClearModal && (
        <Modal
          isOpen={showClearModal}
          onClose={() => setShowClearModal(false)}
          title="Clear Conversation History"
        >
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              Are you sure you want to clear all messages with{' '}
              <strong>{activeConv?.otherParticipant?.name}</strong>? This action will permanently remove all messages in this conversation.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowClearModal(false)}
                disabled={clearingChat}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleClearConversation}
                disabled={clearingChat}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={16} />
                {clearingChat ? 'Clearing...' : 'Clear All Messages'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Messaging;
