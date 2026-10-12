import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, EmptyState } from '../components/UIHelpers';
import { Search, Filter, GraduationCap, Send, UserCheck, Clock, Check, X, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDirectory = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [batch, setBatch] = useState('');
  const [skill, setSkill] = useState('');

  // Connection status map: { userId: { status: 'none' | 'pending_sent' | 'pending_received' | 'accepted', requestId } }
  const [connectionStatuses, setConnectionStatuses] = useState({});

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (department) params.append('department', department);
      if (batch) params.append('batch', batch);
      if (skill) params.append('skill', skill);

      const res = await API.get(`/directory/students?${params.toString()}`);
      setStudents(res.data);

      const statuses = {};
      await Promise.all(
        res.data.map(async (st) => {
          if (st.user?._id && st.user._id !== user._id) {
            try {
              const statusRes = await API.get(`/connections/status/${st.user._id}`);
              statuses[st.user._id] = statusRes.data;
            } catch (e) {
              statuses[st.user._id] = { status: 'none' };
            }
          }
        })
      );
      setConnectionStatuses(statuses);
    } catch (err) {
      console.error('Error fetching student directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [department, batch, skill]);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card-header" style={{ marginBottom: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Student Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Browse enrolled KIT Kolhapur students, skills, and projects</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <form onSubmit={(e) => { e.preventDefault(); fetchStudents(); }}>
          <div className="grid-4">
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search name, PRN, skills..."
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
            </select>

            <input
              type="text"
              className="form-input"
              placeholder="Batch (e.g. 2026)"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
            />

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Filter size={16} /> Filter Students
            </button>
          </div>
        </form>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <LoadingSpinner message="Searching student records..." />
      ) : students.length === 0 ? (
        <EmptyState title="No Students Found" description="Try clearing filters or search terms." />
      ) : (
        <div className="grid-2">
          {students.map((st) => {
            const statusInfo = connectionStatuses[st.user?._id] || { status: 'none' };
            const status = statusInfo.status;
            const isSelf = st.user?._id === user._id;

            return (
              <div key={st._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="avatar avatar-lg" style={{ background: 'var(--secondary)' }}>
                      {st.user ? st.user.name.charAt(0) : 'S'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{st.user?.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <GraduationCap size={14} style={{ display: 'inline', marginRight: 4 }} />
                        PRN: {st.prn} • Dept: {st.department} ({st.batch})
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{st.user?.email}</p>
                    </div>
                  </div>

                  {st.bio && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.85rem' }}>
                      "{st.bio}"
                    </p>
                  )}

                  <div style={{ marginTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {st.skills && st.skills.map((s, idx) => (
                      <span key={idx} className="badge badge-primary">{s}</span>
                    ))}
                    {st.interests && st.interests.map((it, idx) => (
                      <span key={idx} className="badge badge-info">{it}</span>
                    ))}
                  </div>
                </div>

                {!isSelf && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {status === 'accepted' ? (
                      <span className="badge badge-success" style={{ padding: '0.4rem 0.6rem' }}>
                        <UserCheck size={14} /> Connected
                      </span>
                    ) : status === 'pending_sent' ? (
                      <span className="badge badge-warning" style={{ padding: '0.4rem 0.6rem' }}>
                        <Clock size={14} /> Connection Sent
                      </span>
                    ) : status === 'pending_received' ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={() => handleRespondConnection(st.user._id, statusInfo.requestId, 'accepted')}
                          className="btn btn-success btn-sm"
                        >
                          <Check size={14} /> Accept
                        </button>
                        <button
                          onClick={() => handleRespondConnection(st.user._id, statusInfo.requestId, 'rejected')}
                          className="btn btn-outline btn-sm"
                        >
                          <X size={14} /> Decline
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSendConnection(st.user._id)}
                        className="btn btn-outline btn-sm"
                      >
                        <Send size={14} /> Connect
                      </button>
                    )}

                    <Link to={`/${user.role}/messages?userId=${st.user?._id}`} className="btn btn-outline btn-sm">
                      <MessageSquare size={14} /> Message
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentDirectory;
