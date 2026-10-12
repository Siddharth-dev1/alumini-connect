import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/UIHelpers';
import Modal from '../components/Modal';
import { Users, Award, Briefcase, Calendar, ShieldCheck, Check, X, Clock, Plus } from 'lucide-react';

const AlumniDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [incomingConnections, setIncomingConnections] = useState([]);
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [mentorshipSessions, setMentorshipSessions] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [connectionsCount, setConnectionsCount] = useState(0);

  // Response Modal State for Mentorship
  const [selectedReq, setSelectedReq] = useState(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/abc-xyz-connect');
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAlumniData = async () => {
    try {
      setLoading(true);
      const [connRes, pendingConnRes, mentorRes, sessionsRes, jobsRes, eventsRes] = await Promise.all([
        API.get('/connections/my-connections'),
        API.get('/connections/pending'),
        API.get('/mentorship/my-requests'),
        API.get('/mentorship/sessions'),
        API.get('/jobs'),
        API.get('/events')
      ]);

      setConnectionsCount(connRes.data.length);
      setIncomingConnections(pendingConnRes.data.incoming || []);
      setMentorshipRequests(mentorRes.data.filter(r => r.status === 'Pending'));
      setMentorshipSessions(sessionsRes.data || []);
      setMyJobs(jobsRes.data.filter(j => j.postedBy?._id === user._id || j.postedBy === user._id));
      setMyEvents(eventsRes.data.filter(e => e.organizer?._id === user._id || e.organizer === user._id));
    } catch (err) {
      console.error('Error loading alumni dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumniData();
  }, [user?._id]);

  const handleConnectionResponse = async (requestId, status) => {
    try {
      await API.put('/connections/respond', { requestId, status });
      fetchAlumniData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleMentorshipResponse = async (status) => {
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
      fetchAlumniData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update mentorship request');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Alumni Dashboard..." />;

  const ap = user.alumniProfile || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        color: 'white',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Welcome, {user.name}!</h2>
              {user.isVerified ? (
                <span className="badge badge-success"><ShieldCheck size={14} style={{ marginRight: 4 }} /> Verified Alumni</span>
              ) : (
                <span className="badge badge-warning">Pending Verification</span>
              )}
            </div>
            <p style={{ color: '#94a3b8', marginTop: '0.4rem', fontSize: '0.95rem' }}>
              {ap.jobTitle || 'Alumni'} at <strong>{ap.currentCompany || 'MNC'}</strong> ({ap.location || 'India'}) • Graduated {ap.graduationYear || '2024'} ({ap.department || 'CSBS'})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/alumni/jobs" className="btn btn-primary btn-sm">
              <Plus size={16} /> Post Job / Internship
            </Link>
            <Link to="/alumni/events" className="btn btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              <Plus size={16} /> Create Event
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div>
            <div className="stat-number">{connectionsCount}</div>
            <div className="stat-label">Connections</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}><Award size={24} /></div>
          <div>
            <div className="stat-number">{mentorshipRequests.length}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}><Briefcase size={24} /></div>
          <div>
            <div className="stat-number">{myJobs.length}</div>
            <div className="stat-label">Posted Jobs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><Calendar size={24} /></div>
          <div>
            <div className="stat-number">{myEvents.length}</div>
            <div className="stat-label">Posted Events</div>
          </div>
        </div>
      </div>

      {/* Grid: Requests & Sessions */}
      <div className="grid-2">
        {/* Incoming Connection Requests */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Incoming Connection Requests ({incomingConnections.length})</h3>
            <Link to="/alumni/connections" style={{ fontSize: '0.85rem' }}>View All →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {incomingConnections.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>No pending connection requests.</p>
            ) : (
              incomingConnections.map(req => (
                <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{req.sender?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {req.sender?.role.toUpperCase()} • {req.sender?.studentProfile?.department || 'KIT'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>"{req.message}"</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleConnectionResponse(req._id, 'accepted')}
                      className="btn btn-success btn-sm"
                      title="Accept"
                    >
                      <Check size={14} /> Accept
                    </button>
                    <button
                      onClick={() => handleConnectionResponse(req._id, 'rejected')}
                      className="btn btn-outline btn-sm"
                      title="Decline"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Incoming Mentorship Requests */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Incoming Mentorship Requests ({mentorshipRequests.length})</h3>
            <Link to="/alumni/mentorship" style={{ fontSize: '0.85rem' }}>View All →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {mentorshipRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>No pending mentorship requests.</p>
            ) : (
              mentorshipRequests.map(req => (
                <div key={req._id} style={{ padding: '0.85rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge badge-primary">{req.topic}</span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginTop: '0.35rem' }}>From: {req.student?.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>"{req.message}"</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Requested Date: {req.preferredDate} at {req.preferredTime}
                      </p>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setSelectedReq(req);
                        setSchedDate(req.preferredDate);
                        setSchedTime(req.preferredTime);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Respond & Schedule
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Scheduled Sessions & Postings */}
      <div className="grid-2">
        {/* Scheduled Mentorship Sessions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Scheduled Mentorship Sessions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mentorshipSessions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No upcoming mentorship sessions scheduled.</p>
            ) : (
              mentorshipSessions.map(sess => (
                <div key={sess._id} style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{sess.topic}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Student: <strong>{sess.student?.name}</strong> ({sess.student?.email})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> Date: {new Date(sess.date).toLocaleDateString()} at {sess.time}
                  </div>
                  {sess.meetingLink && (
                    <a href={sess.meetingLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', display: 'inline-block', marginTop: '6px' }}>
                      Join Meeting Link →
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Posted Postings Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">My Posted Opportunities ({myJobs.length})</h3>
            <Link to="/alumni/jobs" style={{ fontSize: '0.85rem' }}>Manage Jobs →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myJobs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>You have not posted any job openings or internships yet.</p>
            ) : (
              myJobs.map(j => (
                <div key={j._id} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className="badge badge-info">{j.type}</span>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginTop: '2px' }}>{j.title}</h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{j.company} • {j.location}</div>
                    </div>
                    <Link to="/alumni/jobs" className="btn btn-outline btn-sm">
                      Applicants
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mentorship Response Modal */}
      {selectedReq && (
        <Modal
          isOpen={!!selectedReq}
          onClose={() => setSelectedReq(null)}
          title={`Respond to ${selectedReq.student?.name}'s Request`}
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
                placeholder="e.g. Happy to help! Here is the meeting link for our call."
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
                  placeholder="e.g. 05:00 PM"
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
                placeholder="https://meet.google.com/abc-xyz"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => handleMentorshipResponse('Rejected')}
                className="btn btn-danger btn-sm"
                disabled={actionLoading}
              >
                Decline Request
              </button>
              <button
                type="button"
                onClick={() => handleMentorshipResponse('Accepted')}
                className="btn btn-success btn-sm"
                disabled={actionLoading}
              >
                Accept & Schedule Session
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AlumniDashboard;
