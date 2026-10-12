import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, User as UserIcon, LogOut, Settings, CheckCheck, GraduationCap, ShieldCheck, Briefcase } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') return <span className="badge badge-danger"><ShieldCheck size={12} style={{marginRight: 4}} /> Admin</span>;
    if (role === 'alumni') return <span className="badge badge-primary"><Briefcase size={12} style={{marginRight: 4}} /> Alumni</span>;
    return <span className="badge badge-success"><GraduationCap size={12} style={{marginRight: 4}} /> Student</span>;
  };

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid var(--border)',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div style={{
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          color: 'white',
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          fontWeight: '700',
          fontSize: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <GraduationCap size={24} />
          <span>ALUMNI CONNECT</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>KIT Kolhapur</span>
      </Link>

      {/* User Actions */}
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {getRoleBadge(user.role)}

          {/* Notifications Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowNotif(!showNotif); setShowUserMenu(false); }}
              className="btn btn-outline"
              style={{ padding: '0.5rem', borderRadius: '50%', position: 'relative' }}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--danger)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '50px',
                width: '360px',
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
                maxHeight: '420px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <strong style={{ fontSize: '0.95rem' }}>Notifications ({unreadCount} unread)</strong>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {notifications.length === 0 ? (
                    <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No notifications found</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n._id}
                        onClick={() => markAsRead(n._id)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid #f1f5f9',
                          background: n.isRead ? 'white' : 'var(--primary-light)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{n.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotif(false); }}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <div className="avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.name}</span>
            </button>

            {showUserMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '50px',
                width: '200px',
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
                padding: '0.5rem 0'
              }}>
                <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: '600' }}>{user.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                </div>
                <Link
                  to={`/${user.role}/profile`}
                  onClick={() => setShowUserMenu(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                >
                  <UserIcon size={16} /> My Profile
                </Link>
                <Link
                  to={`/${user.role}/settings`}
                  onClick={() => setShowUserMenu(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                >
                  <Settings size={16} /> Settings
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: '0.6rem 1rem',
                    color: 'var(--danger)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderTop: '1px solid var(--border)'
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/login" className="btn btn-outline">Login</Link>
          <Link to="/register" className="btn btn-primary">Register</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
