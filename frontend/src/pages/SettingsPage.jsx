import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Shield, Bell, Lock } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const [emailNotif, setEmailNotif] = useState(true);
  const [inAppNotif, setInAppNotif] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedMsg('Settings saved successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card-header" style={{ marginBottom: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Account Settings</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Preferences and security controls</p>
        </div>
      </div>

      {savedMsg && <div className="toast toast-success">{savedMsg}</div>}

      <div className="card">
        <form onSubmit={handleSaveSettings}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} /> Notification Preferences
          </h3>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>In-App Notifications</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Receive live popups for connection & mentorship updates</div>
            </div>
            <input
              type="checkbox"
              checked={inAppNotif}
              onChange={(e) => setInAppNotif(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Email Notifications</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Receive email digests for new job & event postings</div>
            </div>
            <input
              type="checkbox"
              checked={emailNotif}
              onChange={(e) => setEmailNotif(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">Save Preferences</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={18} /> Security & Account
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Your account is registered as <strong>{user?.email}</strong> ({user?.role}).
        </p>
        <span className="badge badge-success">JWT Secured Session</span>
      </div>
    </div>
  );
};

export default SettingsPage;
