import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, EmptyState } from '../components/UIHelpers';
import Modal from '../components/Modal';
import { Search, Filter, ShieldCheck, MapPin, Briefcase, Award, Send, UserCheck, Clock, Check, X, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const AlumniDirectory = () => {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [industry, setIndustry] = useState('');
  const [company, setCompany] = useState('');
  const [skill, setSkill] = useState('');
  const [location, setLocation] = useState('');

  // Mentorship Modal State
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [topic, setTopic] = useState('Career Guidance');
  const [message, setMessage] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('05:00 PM');
  const [requestLoading, setRequestLoading] = useState(false);

  // Connection status map: { userId: { status: 'none' | 'pending_sent' | 'pending_received' | 'accepted', requestId } }
  const [connectionStatuses, setConnectionStatuses] = useState({});

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (department) params.append('department', department);
      if (graduationYear) params.append('graduationYear', graduationYear);
      if (industry) params.append('industry', industry);
      if (company) params.append('company', company);
      if (skill) params.append('skill', skill);
      if (location) params.append('location', location);

      const res = await API.get(`/directory/alumni?${params.toString()}`);
      setAlumni(res.data);

      // Fetch connection status for each alumni
      const statuses = {};
      await Promise.all(
        res.data.map(async (al) => {
          if (al.user?._id && al.user._id !== user._id) {
            try {
              const statusRes = await API.get(`/connections/status/${al.user._id}`);
              statuses[al.user._id] = statusRes.data;
            } catch (e) {
              statuses[al.user._id] = { status: 'none' };
            }
          }
        })
      );
      setConnectionStatuses(statuses);
    } catch (err) {
      console.error('Error fetching alumni directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [department, graduationYear, industry, company, skill, location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAlumni();
  };

  const handleSendConnection = async (targetUserId) => {
    try {
      await API.post('/connections/send', { receiverId: targetUserId });
      setConnectionStatuses(prev => ({
        ...prev,
        [targetUserId]: { status: 'pending_sent' }
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Connection request failed');
    }
  };

  const handleRespondConnection = async (targetUserId, requestId, status) => {
    try {
      await API.put('/connections/respond', { requestId, status });
      setConnectionStatuses(prev => ({
        ...prev,
        [targetUserId]: { status: status === 'accepted' ? 'accepted' : 'none' }
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleSendMentorshipRequest = async (e) => {
    e.preventDefault();
    if (!selectedAlumni) return;

    try {
      setRequestLoading(true);
      await API.post('/mentorship/request', {
        alumniId: selectedAlumni.user._id,
        topic,
        message,
        preferredDate,
        preferredTime
      });

      alert(`Mentorship request sent successfully to ${selectedAlumni.user.name}!`);
      setSelectedAlumni(null);
      setMessage('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit mentorship request');
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card-header" style={{ marginBottom: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Alumni Network Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Search and connect with verified KIT graduates across global companies</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit}>
          <div className="grid-4" style={{ marginBottom: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search name, title, skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.2rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
            </div>

            <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">All Departments</option>
              <option value="CSBS">CSBS</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ENTC">ENTC</option>
              <option value="Mechanical">Mechanical</option>
            </select>

            <input
              type="number"
              className="form-input"
              placeholder="Graduation Year (e.g. 2022)"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
            />

            <input
              type="text"
              className="form-input"
              placeholder="Company (e.g. Google)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="grid-3">
            <input
              type="text"
              className="form-input"
              placeholder="Industry (e.g. Technology)"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Location (e.g. Bengaluru)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Filter size={16} /> Apply Directory Filters
            </button>
          </div>
        </form>
      </div>

      {/* Directory Cards */}
      {loading ? (
        <LoadingSpinner message="Searching alumni directory records..." />
      ) : alumni.length === 0 ? (
        <EmptyState title="No Alumni Found" description="Try broadening your search term or clearing filters." />
      ) : (
        <div className="grid-2">
          {alumni.map((al) => {
            const statusInfo = connectionStatuses[al.user?._id] || { status: 'none' };
            const status = statusInfo.status;
            const isSelf = al.user?._id === user._id;

            return (
              <div key={al._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div className="avatar avatar-lg">
                        {al.user ? al.user.name.charAt(0) : 'A'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{al.user?.name}</h3>
                          {al.user?.isVerified && (
                            <ShieldCheck size={16} color="var(--success)" title="Verified Alumni" />
                          )}
                        </div>
                        <p style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.9rem' }}>
                          {al.jobTitle}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <Briefcase size={14} style={{ display: 'inline', marginRight: 4 }} />
                          {al.currentCompany} • {al.industry}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <MapPin size={12} style={{ display: 'inline', marginRight: 2 }} />
                          {al.location} | KIT Class of {al.graduationYear} ({al.department})
                        </p>
                      </div>
                    </div>
                  </div>

                  {al.bio && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem', fontStyle: 'italic' }}>
                      "{al.bio}"
                    </p>
                  )}

                  {/* Skills & Expertise */}
                  <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {al.skills && al.skills.map((s, idx) => (
                      <span key={idx} className="badge badge-primary">{s}</span>
                    ))}
                    {al.expertise && al.expertise.map((e, idx) => (
                      <span key={idx} className="badge badge-info">{e}</span>
                    ))}
                  </div>
                </div>

                {/* Actions Bar */}
                {!isSelf && (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                    {status === 'accepted' ? (
                      <span className="badge badge-success" style={{ padding: '0.5rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <UserCheck size={14} /> Connected
                      </span>
                    ) : status === 'pending_sent' ? (
                      <span className="badge badge-warning" style={{ padding: '0.5rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> Connection Sent
                      </span>
                    ) : status === 'pending_received' ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={() => handleRespondConnection(al.user._id, statusInfo.requestId, 'accepted')}
                          className="btn btn-success btn-sm"
                        >
                          <Check size={14} /> Accept
                        </button>
                        <button
                          onClick={() => handleRespondConnection(al.user._id, statusInfo.requestId, 'rejected')}
                          className="btn btn-outline btn-sm"
                        >
                          <X size={14} /> Decline
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSendConnection(al.user._id)}
                        className="btn btn-outline btn-sm"
                      >
                        <Send size={14} /> Connect
                      </button>
                    )}

                    <Link to={`/${user.role}/messages?userId=${al.user?._id}`} className="btn btn-outline btn-sm">
                      <MessageSquare size={14} /> Message
                    </Link>

                    {user.role === 'student' && (
                      <button
                        onClick={() => {
                          setSelectedAlumni(al);
                          setPreferredDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        <Award size={14} /> Request Mentorship
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mentorship Request Modal */}
      {selectedAlumni && (
        <Modal
          isOpen={!!selectedAlumni}
          onClose={() => setSelectedAlumni(null)}
          title={`Request Mentorship with ${selectedAlumni.user?.name}`}
        >
          <form onSubmit={handleSendMentorshipRequest}>
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
              <strong>Mentor:</strong> {selectedAlumni.user?.name} ({selectedAlumni.jobTitle} at {selectedAlumni.currentCompany})
            </div>

            <div className="form-group">
              <label className="form-label">Mentorship Topic</label>
              <select className="form-select" value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="Career Guidance">Career Guidance</option>
                <option value="Placement">Placement & Interview Prep</option>
                <option value="Higher Studies">Higher Studies abroad / MS</option>
                <option value="Technical Guidance">Technical Guidance & System Design</option>
                <option value="Entrepreneurship">Entrepreneurship & Startups</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Message / Specific Questions</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain what specific topics or guidance you are seeking..."
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Preferred Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Time Slot</label>
                <input
                  type="text"
                  className="form-input"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  placeholder="e.g. 05:00 PM"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setSelectedAlumni(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={requestLoading}>
                {requestLoading ? 'Submitting...' : 'Submit Mentorship Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AlumniDirectory;
