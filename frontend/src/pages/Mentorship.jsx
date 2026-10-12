import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, EmptyState } from '../components/UIHelpers';
import Modal from '../components/Modal';
import { Award, Calendar, Clock, Video, Check, X, User, MessageSquare } from 'lucide-react';

const Mentorship = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Response Modal for Alumni
  const [selectedReq, setSelectedReq] = useState(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/abc-xyz-connect');
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMentorshipData = async () => {
    try {
      setLoading(true);
      const [reqRes, sessRes] = await Promise.all([
        API.get('/mentorship/my-requests'),
        API.get('/mentorship/sessions')
      ]);

      setRequests(reqRes.data);
      setSessions(sessRes.data);
    } catch (err) {
      console.error('Error fetching mentorship data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorshipData();
  }, []);

  const handleRespond = async (status) => {
    if (!selectedReq) return;
    try {
      setActionLoading(true);
      await API.put('/mentorship/respond', {
        requestId: selectedReq._id,
        status,
        responseMessage: responseMsg,
        meetingLink,
        scheduledDate: schedDate || selectedReq.preferredDate,
        scheduledTime: schedTime || selectedReq.preferredTime
      });

      setSelectedReq(null);
      setResponseMsg('');
      fetchMentorshipData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSessionStatus = async (sessionId, status) => {
    try {
      await API.put(`/mentorship/sessions/${sessionId}/status`, { status });
      fetchMentorshipData();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <LoadingSpinner message="Loading mentorship workspace..." />;

  const getStatusBadge = (status) => {
    if (status === 'Scheduled' || status === 'Accepted') return <span className="badge badge-success">{status}</span>;
    if (status === 'Pending') return <span className="badge badge-warning">{status}</span>;
    if (status === 'Completed') return <span className="badge badge-info">{status}</span>;
    return <span className="badge badge-danger">{status}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card-header" style={{ marginBottom: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>1-on-1 Mentorship Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Structured mentorship requests, session scheduling, and career guidance</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
          Mentorship Requests ({requests.length})
        </button>
        <button className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>
          Scheduled Sessions ({sessions.length})
        </button>
      </div>

      {/* REQUESTS TAB */}
      {activeTab === 'requests' && (
        requests.length === 0 ? (
          <EmptyState title="No Mentorship Requests Found" description="Submit a request from the Alumni Directory to get started." />
        ) : (
          <div className="grid-2">
            {requests.map(req => (
              <div key={req._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-primary">{req.topic}</span>
                  {getStatusBadge(req.status)}
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  {user.role === 'student' ? `Mentor: ${req.alumni?.name}` : `Student: ${req.student?.name}`}
                </h4>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  "{req.message}"
                </p>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: '#f8fafc', padding: '0.6rem', borderRadius: 'var(--radius)' }}>
                  <div><Calendar size={14} style={{ display: 'inline', marginRight: 4 }} /> Date: {req.preferredDate}</div>
                  <div><Clock size={14} style={{ display: 'inline', marginRight: 4 }} /> Time: {req.preferredTime}</div>
                  {req.responseMessage && (
                    <div style={{ color: 'var(--primary)', marginTop: '4px' }}>
                      <strong>Response:</strong> {req.responseMessage}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Link
                    to={`/${user.role}/messages?userId=${user.role === 'student' ? req.alumni?._id : req.student?._id}`}
                    className="btn btn-outline btn-sm"
                  >
                    <MessageSquare size={14} /> Message {user.role === 'student' ? 'Alumni' : 'Student'}
                  </Link>

                  {/* Alumni Action Buttons */}
                  {(user.role === 'alumni' || user.role === 'admin') && req.status === 'Pending' && (
                    <button
                      onClick={() => {
                        setSelectedReq(req);
                        setSchedDate(req.preferredDate);
                        setSchedTime(req.preferredTime);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Respond & Confirm Slot
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* SESSIONS TAB */}
      {activeTab === 'sessions' && (
        sessions.length === 0 ? (
          <EmptyState title="No Scheduled Sessions" description="Confirmed mentorship requests will appear here with call links." />
        ) : (
          <div className="grid-2">
            {sessions.map(sess => (
              <div key={sess._id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-info">{sess.topic}</span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '600', marginTop: '0.4rem' }}>
                      {user.role === 'student' ? `With Alumni: ${sess.alumni?.name}` : `With Student: ${sess.student?.name}`}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <Calendar size={14} style={{ display: 'inline', marginRight: 4 }} />
                      {new Date(sess.date).toLocaleDateString()} at {sess.time}
                    </p>
                  </div>
                  {getStatusBadge(sess.status)}
                </div>

                {sess.meetingLink && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#eff6ff', borderRadius: 'var(--radius)', border: '1px solid #bfdbfe' }}>
                    <a href={sess.meetingLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '0.9rem' }}>
                      <Video size={16} /> Join Online Call Room →
                    </a>
                  </div>
                )}

                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Link
                    to={`/${user.role}/messages?userId=${user.role === 'student' ? sess.alumni?._id : sess.student?._id}`}
                    className="btn btn-outline btn-sm"
                  >
                    <MessageSquare size={14} /> Message {user.role === 'student' ? 'Alumni' : 'Student'}
                  </Link>

                  {sess.status === 'Scheduled' && (
                    <>
                      <button
                        onClick={() => handleUpdateSessionStatus(sess._id, 'Completed')}
                        className="btn btn-success btn-sm"
                      >
                        <Check size={14} /> Mark Completed
                      </button>
                      <button
                        onClick={() => handleUpdateSessionStatus(sess._id, 'Cancelled')}
                        className="btn btn-outline btn-sm"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Response Modal */}
      {selectedReq && (
        <Modal
          isOpen={!!selectedReq}
          onClose={() => setSelectedReq(null)}
          title={`Respond to ${selectedReq.student?.name}`}
        >
          <div>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Topic: <strong>{selectedReq.topic}</strong><br />
              Requested Slot: {selectedReq.preferredDate} at {selectedReq.preferredTime}
            </p>

            <div className="form-group">
              <label className="form-label">Response Message / Notes</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={responseMsg}
                onChange={(e) => setResponseMsg(e.target.value)}
                placeholder="e.g. Glad to assist! Let's connect at the scheduled time."
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Confirm Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={schedDate}
                  onChange={(e) => setSchedDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Time</label>
                <input
                  type="text"
                  className="form-input"
                  value={schedTime}
                  onChange={(e) => setSchedTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Online Meeting Link (Google Meet / Zoom)</label>
              <input
                type="text"
                className="form-input"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => handleRespond('Rejected')}
                className="btn btn-danger btn-sm"
                disabled={actionLoading}
              >
                Decline Request
              </button>
              <button
                type="button"
                onClick={() => handleRespond('Accepted')}
                className="btn btn-success btn-sm"
                disabled={actionLoading}
              >
                Accept & Create Session
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Mentorship;
