import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/UIHelpers';
import { Users, Award, Briefcase, Calendar, MessageSquare, ArrowRight, CheckCircle, Clock } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recommendedAlumni, setRecommendedAlumni] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [mentorshipSessions, setMentorshipSessions] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [connectionsCount, setConnectionsCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [alumniRes, connRes, pendingConnRes, mentorRes, sessionsRes, jobsRes, eventsRes] = await Promise.all([
          API.get('/directory/alumni?limit=4'),
          API.get('/connections/my-connections'),
          API.get('/connections/pending'),
          API.get('/mentorship/my-requests'),
          API.get('/mentorship/sessions'),
          API.get('/jobs?limit=3'),
          API.get('/events?limit=3')
        ]);

        setRecommendedAlumni(alumniRes.data.slice(0, 4));
        setConnectionsCount(connRes.data.length);
        setPendingConnections(pendingConnRes.data.incoming || []);
        setMentorshipRequests(mentorRes.data || []);
        setMentorshipSessions(sessionsRes.data || []);
        setJobs(jobsRes.data.slice(0, 3));
        setEvents(eventsRes.data.slice(0, 3));
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your dashboard statistics..." />;

  // Calculate Profile Completion %
  const sp = user.studentProfile || {};
  let score = 30; // base score
  if (sp.prn) score += 10;
  if (sp.department) score += 10;
  if (sp.skills && sp.skills.length > 0) score += 20;
  if (sp.bio) score += 15;
  if (sp.projects && sp.projects.length > 0) score += 15;
  const completionPercentage = Math.min(100, score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
        color: 'white',
        padding: '2rem'
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Welcome back, {user.name}! 🎓</h2>
        <p style={{ color: '#dbeafe', margin: '0.5rem 0 1.25rem', fontSize: '0.95rem' }}>
          KIT Kolhapur | Department of {sp.department || 'CSBS'} | Batch {sp.batch || '2026'}
        </p>

        {/* Profile Completion Bar */}
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '9999px', height: '10px', overflow: 'hidden', maxWidth: '400px' }}>
          <div style={{ background: '#10b981', height: '100%', width: `${completionPercentage}%`, transition: 'width 0.5s' }} />
        </div>
        <div style={{ fontSize: '0.8rem', color: '#e0f2fe', marginTop: '0.35rem' }}>
          Profile Completion: {completionPercentage}%
        </div>
      </div>

      {/* Overview Stats */}
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
            <div className="stat-number">{mentorshipSessions.length}</div>
            <div className="stat-label">Mentorship Sessions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}><Briefcase size={24} /></div>
          <div>
            <div className="stat-number">{jobs.length}</div>
            <div className="stat-label">Open Positions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><Calendar size={24} /></div>
          <div>
            <div className="stat-number">{events.length}</div>
            <div className="stat-label">Upcoming Events</div>
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid-2">
        {/* Recommended Alumni */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recommended Alumni Mentors</h3>
            <Link to="/student/alumni-directory" style={{ fontSize: '0.85rem' }}>View All →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recommendedAlumni.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No alumni recommended at the moment.</p>
            ) : (
              recommendedAlumni.map(al => (
                <div key={al._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="avatar">
                      {al.user ? al.user.name.charAt(0) : 'A'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{al.user ? al.user.name : 'Alumni'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{al.jobTitle} at {al.currentCompany}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class of {al.graduationYear} ({al.department})</div>
                    </div>
                  </div>
                  <Link to="/student/alumni-directory" className="btn btn-outline btn-sm">
                    Connect
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Requests & Scheduled Sessions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pending Connections & Mentorship</h3>
            <Link to="/student/mentorship" style={{ fontSize: '0.85rem' }}>Manage →</Link>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Pending Connections ({pendingConnections.length})
            </h4>
            {pendingConnections.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>No pending connection requests.</p>
            ) : (
              pendingConnections.slice(0, 2).map(req => (
                <div key={req._id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                  <strong>{req.sender?.name}</strong> sent you a connection request.
                </div>
              ))
            )}

            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '1rem', marginBottom: '0.5rem' }}>
              Upcoming Sessions ({mentorshipSessions.length})
            </h4>
            {mentorshipSessions.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No mentorship sessions scheduled.</p>
            ) : (
              mentorshipSessions.slice(0, 2).map(sess => (
                <div key={sess._id} style={{ padding: '0.6rem', background: '#f8fafc', borderRadius: 'var(--radius)', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{sess.topic}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    With {sess.alumni?.name} on {new Date(sess.date).toLocaleDateString()} at {sess.time}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Jobs & Events */}
      <div className="grid-2">
        {/* Recommended Jobs & Internships */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Latest Opportunity Postings</h3>
            <Link to="/student/jobs" style={{ fontSize: '0.85rem' }}>Browse Portal →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {jobs.map(j => (
              <div key={j._id} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-primary">{j.type}</span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginTop: '0.25rem' }}>{j.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{j.company} • {j.location}</p>
                  </div>
                  <Link to="/student/jobs" className="btn btn-primary btn-sm">
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Upcoming Workshops & Webinars</h3>
            <Link to="/student/events" style={{ fontSize: '0.85rem' }}>All Events →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {events.map(ev => (
              <div key={ev._id} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-info">{ev.type}</span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginTop: '0.25rem' }}>{ev.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Clock size={12} style={{ marginRight: 4 }} />
                      {new Date(ev.date).toLocaleDateString()} at {ev.time}
                    </p>
                  </div>
                  <Link to="/student/events" className="btn btn-outline btn-sm">
                    View & Register
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
