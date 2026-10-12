import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  LayoutDashboard,
  User,
  Users,
  Search,
  UserCheck,
  Award,
  Briefcase,
  Calendar,
  MessageSquare,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (user.role === 'student') {
      return [
        { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { label: 'My Profile', path: '/student/profile', icon: User },
        { label: 'Alumni Directory', path: '/student/alumni-directory', icon: Search },
        { label: 'Connections', path: '/student/connections', icon: Users },
        { label: 'Mentorship', path: '/student/mentorship', icon: Award },
        { label: 'Jobs & Internships', path: '/student/jobs', icon: Briefcase },
        { label: 'Events', path: '/student/events', icon: Calendar },
        { label: 'Messages', path: '/student/messages', icon: MessageSquare },
        { label: 'Career Resources', path: '/student/resources', icon: BookOpen },
        { label: 'Notifications', path: '/student/notifications', icon: Bell, badge: unreadCount },
        { label: 'Settings', path: '/student/settings', icon: Settings }
      ];
    } else if (user.role === 'alumni') {
      return [
        { label: 'Dashboard', path: '/alumni/dashboard', icon: LayoutDashboard },
        { label: 'My Profile', path: '/alumni/profile', icon: User },
        { label: 'Student Directory', path: '/alumni/student-directory', icon: Search },
        { label: 'Connections', path: '/alumni/connections', icon: Users },
        { label: 'Mentorship Requests', path: '/alumni/mentorship', icon: Award },
        { label: 'Jobs & Internships', path: '/alumni/jobs', icon: Briefcase },
        { label: 'Events', path: '/alumni/events', icon: Calendar },
        { label: 'Messages', path: '/alumni/messages', icon: MessageSquare },
        { label: 'Career Resources', path: '/alumni/resources', icon: BookOpen },
        { label: 'Notifications', path: '/alumni/notifications', icon: Bell, badge: unreadCount },
        { label: 'Settings', path: '/alumni/settings', icon: Settings }
      ];
    } else if (user.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'User Management', path: '/admin/users', icon: ShieldCheck },
        { label: 'Alumni Verification', path: '/admin/alumni-verification', icon: UserCheck },
        { label: 'Connections', path: '/admin/connections', icon: Users },
        { label: 'Mentorship Overview', path: '/admin/mentorship', icon: Award },
        { label: 'Job Postings', path: '/admin/jobs', icon: Briefcase },
        { label: 'Events & Requests', path: '/admin/events', icon: Calendar },
        { label: 'Career Resources', path: '/admin/resources', icon: BookOpen },
        { label: 'Reports & Stats', path: '/admin/reports', icon: FileText },
        { label: 'Notifications', path: '/admin/notifications', icon: Bell, badge: unreadCount },
        { label: 'Settings', path: '/admin/settings', icon: Settings }
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-sidebar)',
      color: 'var(--text-light)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 64px)',
      padding: '1.25rem 0.75rem',
      flexShrink: 0
    }}>
      <div style={{ padding: '0 0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
          Navigation Menu
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '1rem', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius)',
                color: isActive ? 'white' : '#94a3b8',
                background: isActive ? 'var(--primary)' : 'transparent',
                fontWeight: isActive ? '600' : '400',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span style={{
                  background: 'var(--danger)',
                  color: 'white',
                  borderRadius: '9999px',
                  padding: '0.15rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}>
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </div>

      <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius)',
            color: '#ef4444',
            background: 'rgba(239, 68, 68, 0.1)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
