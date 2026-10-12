import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { LoadingSpinner, EmptyState } from '../components/UIHelpers';
import Modal from '../components/Modal';
import { ShieldCheck, Users, GraduationCap, Briefcase, Calendar, BookOpen, Award, CheckCircle, XCircle, Search, Trash2, Check, X } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Users State
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Event Requests State
  const [eventRequests, setEventRequests] = useState([]);

  // Edit User Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editVerified, setEditVerified] = useState(false);

  const fetchAdminStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get(`/admin/users?role=${roleFilter}&isVerified=${verifiedFilter}&search=${userSearch}`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchEventRequests = async () => {
    try {
      const res = await API.get('/event-requests');
      setEventRequests(res.data);
    } catch (err) {
      console.error('Error fetching event requests:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchAdminStats(), fetchUsers(), fetchEventRequests()]);
      setLoading(false);
    };
    initData();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, verifiedFilter, userSearch]);

  const handleToggleVerification = async (userId, currentStatus) => {
    try {
      await API.put(`/admin/verify-alumni/${userId}`, { isVerified: !currentStatus });
      fetchUsers();
      fetchAdminStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification update failed');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      fetchUsers();
      fetchAdminStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete user failed');
    }
  };

  const handleRespondEventRequest = async (requestId, status) => {
    try {
      const adminRemarks = prompt(`Enter admin remarks for this event ${status.toLowerCase()}:`) || '';
      await API.put(`/event-requests/${requestId}/respond`, {
        status,
        adminRemarks,
        time: '11:00 AM',
        location: 'KIT Main Auditorium & Online Stream'
      });
      fetchEventRequests();
      fetchAdminStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await API.put(`/admin/users/${selectedUser._id}`, {
        name: editName,
        role: editRole,
        isVerified: editVerified
      });
      setSelectedUser(null);
      fetchUsers();
      fetchAdminStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <LoadingSpinner message="Loading University Admin Console..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0f172a, #991b1b)',
        color: 'white',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={32} />
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>University Administration Portal</h2>
            <p style={{ color: '#fca5a5', fontSize: '0.9rem' }}>KIT Kolhapur | System Overview & User Governance</p>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Platform Overview
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          User Management ({users.length})
        </button>
        <button className={`tab-btn ${activeTab === 'alumni' ? 'active' : ''}`} onClick={() => { setActiveTab('users'); setRoleFilter('alumni'); }}>
          Alumni Verification
        </button>
        <button className={`tab-btn ${activeTab === 'event-requests' ? 'active' : ''}`} onClick={() => setActiveTab('event-requests')}>
          Event Requests ({eventRequests.filter(r => r.status === 'Pending').length})
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid-4">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}><GraduationCap size={24} /></div>
              <div>
                <div className="stat-number">{stats.totalStudents || 0}</div>
                <div className="stat-label">Total Students</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><Users size={24} /></div>
              <div>
                <div className="stat-number">{stats.totalAlumni || 0}</div>
                <div className="stat-label">Total Alumni</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dbeafe', color: '#1e40af' }}><ShieldCheck size={24} /></div>
              <div>
                <div className="stat-number">{stats.verifiedAlumni || 0}</div>
                <div className="stat-label">Verified Alumni</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Award size={24} /></div>
              <div>
                <div className="stat-number">{stats.activeMentorships || 0}</div>
                <div className="stat-label">Active Mentorships</div>
              </div>
            </div>
          </div>

          <div className="grid-4">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}><Briefcase size={24} /></div>
              <div>
                <div className="stat-number">{stats.totalJobs || 0}</div>
                <div className="stat-label">Jobs Posted</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><Briefcase size={24} /></div>
              <div>
                <div className="stat-number">{stats.totalInternships || 0}</div>
                <div className="stat-label">Internships Posted</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}><Calendar size={24} /></div>
              <div>
                <div className="stat-number">{stats.totalEvents || 0}</div>
                <div className="stat-label">Total Events</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#f1f5f9', color: '#475569' }}><BookOpen size={24} /></div>
              <div>
                <div className="stat-number">{stats.totalResources || 0}</div>
                <div className="stat-label">Career Resources</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <h3 className="card-title">User Accounts Governance</h3>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '220px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search user..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ paddingLeft: '2.2rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              </div>

              <select className="form-select" style={{ width: '150px' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="alumni">Alumni</option>
                <option value="admin">Admin</option>
              </select>

              <select className="form-select" style={{ width: '160px' }} value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}>
                <option value="">All Verification</option>
                <option value="true">Verified Only</option>
                <option value="false">Unverified Only</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User Name & Email</th>
                  <th>Role</th>
                  <th>Details / Dept</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No users match filter criteria.</td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'alumni' ? 'badge-primary' : 'badge-success'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.role === 'student' && u.studentProfile ? (
                          <div style={{ fontSize: '0.8rem' }}>
                            PRN: {u.studentProfile.prn} • Dept: {u.studentProfile.department} • Batch {u.studentProfile.batch}
                          </div>
                        ) : u.role === 'alumni' && u.alumniProfile ? (
                          <div style={{ fontSize: '0.8rem' }}>
                            {u.alumniProfile.jobTitle} at {u.alumniProfile.currentCompany} ({u.alumniProfile.department} '{u.alumniProfile.graduationYear})
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>System User</span>
                        )}
                      </td>
                      <td>
                        {u.isVerified ? (
                          <span className="badge badge-success">Verified</span>
                        ) : (
                          <span className="badge badge-warning">Unverified</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {u.role === 'alumni' && (
                            <button
                              onClick={() => handleToggleVerification(u._id, u.isVerified)}
                              className={`btn btn-sm ${u.isVerified ? 'btn-outline' : 'btn-success'}`}
                            >
                              {u.isVerified ? 'Unverify' : 'Verify Alumni'}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setEditName(u.name);
                              setEditRole(u.role);
                              setEditVerified(u.isVerified);
                            }}
                            className="btn btn-outline btn-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="btn btn-danger btn-sm"
                            title="Delete user"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EVENT REQUESTS APPROVAL TAB */}
      {activeTab === 'event-requests' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Student & Alumni Event Requests Approval</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {eventRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No event requests found.</p>
            ) : (
              eventRequests.map(req => (
                <div key={req._id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className="badge badge-info">{req.eventType}</span>
                        <span className={`badge ${req.status === 'Approved' ? 'badge-success' : req.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                          {req.status}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '600', marginTop: '0.4rem' }}>{req.title}</h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Requested by: <strong>{req.requestedBy?.name}</strong> ({req.requestedBy?.role})</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>"{req.description}"</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Proposed Date: {new Date(req.proposedDate).toLocaleDateString()} • Reason: {req.reason} • Expected Participants: {req.expectedParticipants}
                      </p>
                    </div>

                    {req.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleRespondEventRequest(req._id, 'Approved')}
                          className="btn btn-success btn-sm"
                        >
                          <Check size={14} /> Approve & Create Event
                        </button>
                        <button
                          onClick={() => handleRespondEventRequest(req._id, 'Rejected')}
                          className="btn btn-danger btn-sm"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Edit User: ${selectedUser.email}`}
        >
          <div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="alumni">Alumni</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="verifyCheck"
                checked={editVerified}
                onChange={(e) => setEditVerified(e.target.checked)}
              />
              <label htmlFor="verifyCheck" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                Account Verified Status
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" onClick={() => setSelectedUser(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateUser}>Save Changes</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;
