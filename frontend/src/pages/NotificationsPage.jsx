import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { LoadingSpinner, EmptyState } from '../components/UIHelpers';
import { Bell, CheckCheck, Clock } from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="card-header" style={{ marginBottom: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Notifications Hub</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Updates on connections, mentorships, jobs, and events</p>
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-outline btn-sm">
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No Notifications" description="You have no system or interaction notifications at this time." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map(n => (
            <div
              key={n._id}
              onClick={() => markAsRead(n._id)}
              className="card"
              style={{
                background: n.isRead ? 'white' : 'var(--primary-light)',
                borderLeft: n.isRead ? '4px solid var(--border)' : '4px solid var(--primary)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{n.title}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{n.message}</p>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
