import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, EmptyState } from '../components/UIHelpers';
import { Users, UserCheck, Check, X, MessageSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Connections = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConnectionsData = async () => {
    try {
      setLoading(true);
      const [connRes, pendingRes] = await Promise.all([
        API.get('/connections/my-connections'),
        API.get('/connections/pending')
      ]);

      setConnections(connRes.data);
      setIncoming(pendingRes.data.incoming || []);
      setOutgoing(pendingRes.data.outgoing || []);
    } catch (err) {
      console.error('Error fetching connections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectionsData();
  }, []);

  const handleRespond = async (requestId, status) => {
    try {
      await API.put('/connections/respond', { requestId, status });
      fetchConnectionsData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <LoadingSpinner message="Loading your connection network..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card-header" style={{ marginBottom: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Network Connections</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage your connections, pending requests, and network relationships</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
          onClick={() => setActiveTab('connections')}
        >
          My Connections ({connections.length})
        </button>

        <button
          className={`tab-btn ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          Incoming Requests ({incoming.length})
        </button>

        <button
          className={`tab-btn ${activeTab === 'outgoing' ? 'active' : ''}`}
          onClick={() => setActiveTab('outgoing')}
        >
          Sent Requests ({outgoing.length})
        </button>
      </div>

      {/* MY CONNECTIONS TAB */}
      {activeTab === 'connections' && (
        connections.length === 0 ? (
          <EmptyState
            title="No Connections Yet"
            description="Explore the Alumni Directory to connect with experienced graduates and peers."
            action={
              <Link to={`/${user.role}/alumni-directory`} className="btn btn-primary">
                Browse Directory
              </Link>
            }
          />
        ) : (
          <div className="grid-2">
            {connections.map((item) => (
              <div key={item.connectionId} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="avatar avatar-lg">
                    {item.user?.name ? item.user.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '600' }}>{item.user?.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span className="badge badge-primary" style={{ marginRight: 6 }}>{item.user?.role}</span>
                      {item.user?.alumniProfile?.jobTitle ? `${item.user.alumniProfile.jobTitle} at ${item.user.alumniProfile.currentCompany}` : item.user?.studentProfile?.department}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Connected since: {new Date(item.connectedSince).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Link to={`/${user.role}/messages?userId=${item.user?._id}`} className="btn btn-outline btn-sm">
                  <MessageSquare size={14} /> Message
                </Link>
              </div>
            ))}
          </div>
        )
      )}

      {/* INCOMING REQUESTS TAB */}
      {activeTab === 'incoming' && (
        incoming.length === 0 ? (
          <EmptyState title="No Incoming Requests" description="You have no pending incoming connection invitations." />
        ) : (
          <div className="grid-2">
            {incoming.map((req) => (
              <div key={req._id} className="card">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="avatar avatar-lg">
                    {req.sender?.name ? req.sender.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '600' }}>{req.sender?.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span className="badge badge-info" style={{ marginRight: 6 }}>{req.sender?.role}</span>
                      {req.sender?.email}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                      "{req.message}"
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleRespond(req._id, 'rejected')}
                    className="btn btn-outline btn-sm"
                  >
                    <X size={14} /> Decline
                  </button>
                  <button
                    onClick={() => handleRespond(req._id, 'accepted')}
                    className="btn btn-success btn-sm"
                  >
                    <Check size={14} /> Accept Connection
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* OUTGOING REQUESTS TAB */}
      {activeTab === 'outgoing' && (
        outgoing.length === 0 ? (
          <EmptyState title="No Sent Requests" description="You have no pending sent connection requests." />
        ) : (
          <div className="grid-2">
            {outgoing.map((req) => (
              <div key={req._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="avatar avatar-lg">
                    {req.receiver?.name ? req.receiver.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '600' }}>{req.receiver?.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{req.receiver?.email}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Sent on: {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <span className="badge badge-warning">
                  <Clock size={12} style={{ marginRight: 4 }} /> Pending Response
                </span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Connections;
