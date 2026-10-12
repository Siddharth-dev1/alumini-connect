import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, EmptyState } from '../components/UIHelpers';
import Modal from '../components/Modal';
import { Calendar, Clock, MapPin, Plus, CheckCircle, Users, ExternalLink, Send } from 'lucide-react';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Create Event Modal (Alumni/Admin)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    type: 'Webinar',
    date: '',
    time: '10:00 AM - 11:30 AM',
    location: 'Google Meet (Online)',
    speaker: '',
    eligibility: 'Open to all students',
    maxParticipants: 100,
    registrationDeadline: '',
    registrationLink: ''
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Event Request Modal (Students/Alumni)
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqData, setReqData] = useState({
    title: '',
    description: '',
    proposedDate: '',
    eventType: 'Workshop',
    reason: '',
    expectedParticipants: 50
  });
  const [requestLoading, setRequestLoading] = useState(false);

  // Registrations View Modal (Organizer/Admin)
  const [viewEventParticipants, setViewEventParticipants] = useState(null);
  const [participantsList, setParticipantsList] = useState([]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);

      const res = await API.get(`/events?${params.toString()}`);
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [typeFilter]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      await API.post('/events', eventData);
      setShowCreateModal(false);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSubmitEventRequest = async (e) => {
    e.preventDefault();
    try {
      setRequestLoading(true);
      await API.post('/event-requests', reqData);
      alert('Event request submitted to University Admin for approval!');
      setShowRequestModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit event request');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleRegisterEvent = async (eventId) => {
    try {
      await API.post(`/events/${eventId}/register`);
      alert('Successfully registered for event!');
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleCancelRegistration = async (eventId) => {
    try {
      await API.delete(`/events/${eventId}/register`);
      alert('Event registration cancelled.');
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleFetchParticipants = async (eventId) => {
    try {
      const res = await API.get(`/events/${eventId}/registrations`);
      setParticipantsList(res.data);
      setViewEventParticipants(eventId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load participants');
    }
  };

  if (loading) return <LoadingSpinner message="Loading institutional events..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card-header" style={{ marginBottom: 0, flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Events & Workshops Hub</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Participate in alumni webinars, industrial workshops, and networking meets</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => setShowRequestModal(true)}>
            <Send size={16} /> Request New Event
          </button>
          {(user.role === 'alumni' || user.role === 'admin') && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> Create Event
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <form onSubmit={(e) => { e.preventDefault(); fetchEvents(); }}>
          <div className="grid-2">
            <input
              type="text"
              className="form-input"
              placeholder="Search event title, speaker, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Event Types</option>
              <option value="Webinar">Webinar</option>
              <option value="Workshop">Workshop</option>
              <option value="Alumni Meet">Alumni Meet</option>
              <option value="Industrial Visit">Industrial Visit</option>
              <option value="Career Event">Career Event</option>
              <option value="Training Program">Training Program</option>
            </select>
          </div>
        </form>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <EmptyState title="No Events Found" description="No upcoming events match your filter criteria." />
      ) : (
        <div className="grid-2">
          {events.map(ev => {
            const isOrganizer = user.role === 'admin' || (ev.organizer?._id === user._id || ev.organizer === user._id);

            return (
              <div key={ev._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="badge badge-info">{ev.type}</span>
                    <span className="badge badge-primary">
                      {ev.registrationCount || 0} / {ev.maxParticipants || 100} Registered
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginTop: '0.4rem' }}>{ev.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Speaker: <strong>{ev.speaker || 'Alumni Speaker'}</strong></p>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                    {ev.description}
                  </p>

                  <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)', background: '#f8fafc', padding: '0.65rem', borderRadius: 'var(--radius)' }}>
                    <div><Calendar size={14} style={{ display: 'inline', marginRight: 4 }} /> <strong>Date:</strong> {new Date(ev.date).toLocaleDateString()}</div>
                    <div><Clock size={14} style={{ display: 'inline', marginRight: 4 }} /> <strong>Time:</strong> {ev.time}</div>
                    <div><MapPin size={14} style={{ display: 'inline', marginRight: 4 }} /> <strong>Venue / Link:</strong> {ev.location}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
                  {user.role === 'student' && (
                    ev.isUserRegistered ? (
                      <button onClick={() => handleCancelRegistration(ev._id)} className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }}>
                        Cancel Registration
                      </button>
                    ) : (
                      <button onClick={() => handleRegisterEvent(ev._id)} className="btn btn-primary btn-sm">
                        Register for Event
                      </button>
                    )
                  )}

                  {isOrganizer && (
                    <button onClick={() => handleFetchParticipants(ev._id)} className="btn btn-outline btn-sm">
                      <Users size={14} /> Registered Students ({ev.registrationCount || 0})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showCreateModal && (
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Event">
          <form onSubmit={handleCreateEvent}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={eventData.title}
                  onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                  placeholder="e.g. Masterclass on System Design"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Event Type</label>
                <select className="form-select" value={eventData.type} onChange={(e) => setEventData({ ...eventData, type: e.target.value })}>
                  <option value="Webinar">Webinar</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Alumni Meet">Alumni Meet</option>
                  <option value="Industrial Visit">Industrial Visit</option>
                  <option value="Career Event">Career Event</option>
                  <option value="Training Program">Training Program</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={eventData.description}
                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Event Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={eventData.date}
                  onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Event Time Slot</label>
                <input
                  type="text"
                  className="form-input"
                  value={eventData.time}
                  onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                  placeholder="10:00 AM - 12:00 PM"
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Venue / Online Link</label>
                <input
                  type="text"
                  className="form-input"
                  value={eventData.location}
                  onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                  placeholder="e.g. Google Meet Link or Auditorium"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Speaker Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={eventData.speaker}
                  onChange={(e) => setEventData({ ...eventData, speaker: e.target.value })}
                  placeholder="e.g. Pranali Titvekar"
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Max Participants</label>
                <input
                  type="number"
                  className="form-input"
                  value={eventData.maxParticipants}
                  onChange={(e) => setEventData({ ...eventData, maxParticipants: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Registration Deadline</label>
                <input
                  type="date"
                  className="form-input"
                  value={eventData.registrationDeadline}
                  onChange={(e) => setEventData({ ...eventData, registrationDeadline: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={createLoading}>
                {createLoading ? 'Publishing...' : 'Publish Event'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EVENT REQUEST MODAL */}
      {showRequestModal && (
        <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request Event Creation (Admin Approval)">
          <form onSubmit={handleSubmitEventRequest}>
            <div className="form-group">
              <label className="form-label">Proposed Event Title</label>
              <input
                type="text"
                className="form-input"
                value={reqData.title}
                onChange={(e) => setReqData({ ...reqData, title: e.target.value })}
                placeholder="e.g. Workshop on AI Agentic Workflows"
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Event Type</label>
                <select className="form-select" value={reqData.eventType} onChange={(e) => setReqData({ ...reqData, eventType: e.target.value })}>
                  <option value="Workshop">Workshop</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Industrial Visit">Industrial Visit</option>
                  <option value="Alumni Meet">Alumni Meet</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Proposed Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={reqData.proposedDate}
                  onChange={(e) => setReqData({ ...reqData, proposedDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Event Description & Objective</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={reqData.description}
                onChange={(e) => setReqData({ ...reqData, description: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Student Benefit</label>
              <input
                type="text"
                className="form-input"
                value={reqData.reason}
                onChange={(e) => setReqData({ ...reqData, reason: e.target.value })}
                placeholder="Why is this event beneficial for KIT students?"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowRequestModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={requestLoading}>
                {requestLoading ? 'Submitting...' : 'Submit Request to Admin'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW PARTICIPANTS MODAL */}
      {viewEventParticipants && (
        <Modal isOpen={!!viewEventParticipants} onClose={() => setViewEventParticipants(null)} title="Registered Participants List">
          <div>
            {participantsList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No student registrations yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {participantsList.map(p => (
                  <div key={p._id} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{p.user?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {p.user?.email} • PRN: {p.user?.studentProfile?.prn}
                      </div>
                    </div>
                    <span className="badge badge-success">Registered</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Events;
