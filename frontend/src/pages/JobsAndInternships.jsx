import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, EmptyState } from '../components/UIHelpers';
import Modal from '../components/Modal';
import { Briefcase, MapPin, Calendar, Plus, ExternalLink, CheckCircle, Search, Filter, Trash2, Users } from 'lucide-react';

const JobsAndInternships = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState('');

  // Modals
  const [showPostModal, setShowPostModal] = useState(false);
  const [postData, setPostData] = useState({
    title: '',
    company: '',
    description: '',
    type: 'Job',
    location: '',
    employmentType: 'Full-time',
    skillsRequired: '',
    eligibility: 'Open to all students',
    salaryOrStipend: '',
    deadline: '',
    applicationLink: ''
  });
  const [postLoading, setPostLoading] = useState(false);

  // Apply Modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  // Applicants Modal
  const [viewJobApplicants, setViewJobApplicants] = useState(null);
  const [applicantsList, setApplicantsList] = useState([]);

  // My Applications (for Student)
  const [myApplications, setMyApplications] = useState([]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      if (employmentFilter) params.append('employmentType', employmentFilter);

      const res = await API.get(`/jobs?${params.toString()}`);
      setJobs(res.data);

      if (user.role === 'student') {
        const myAppsRes = await API.get('/jobs/my-applications');
        setMyApplications(myAppsRes.data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [typeFilter, employmentFilter]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      setPostLoading(true);
      await API.post('/jobs', postData);
      setShowPostModal(false);
      setPostData({
        title: '',
        company: '',
        description: '',
        type: 'Job',
        location: '',
        employmentType: 'Full-time',
        skillsRequired: '',
        eligibility: 'Open to all students',
        salaryOrStipend: '',
        deadline: '',
        applicationLink: ''
      });
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post job');
    } finally {
      setPostLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    try {
      setApplyLoading(true);
      await API.post(`/jobs/${selectedJob._id}/apply`, {
        resumeUrl,
        coverNote
      });

      alert('Application submitted successfully!');
      setSelectedJob(null);
      setResumeUrl('');
      setCoverNote('');
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleFetchApplicants = async (jobId) => {
    try {
      const res = await API.get(`/jobs/${jobId}/applications`);
      setApplicantsList(res.data);
      setViewJobApplicants(jobId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load applicants');
    }
  };

  const handleUpdateApplicantStatus = async (appId, newStatus) => {
    try {
      await API.put(`/jobs/applications/${appId}/status`, { status: newStatus });
      setApplicantsList(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this posting?')) return;
    try {
      await API.delete(`/jobs/${jobId}`);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <LoadingSpinner message="Loading opportunity portal..." />;

  const appliedJobIds = myApplications.map(a => a.job?._id || a.job);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card-header" style={{ marginBottom: 0, flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Career & Opportunity Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Explore verified jobs, internships, and training programs posted by alumni</p>
        </div>

        {(user.role === 'alumni' || user.role === 'admin') && (
          <button className="btn btn-primary" onClick={() => setShowPostModal(true)}>
            <Plus size={18} /> Post Opportunity
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <form onSubmit={(e) => { e.preventDefault(); fetchJobs(); }}>
          <div className="grid-3">
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search title, company, skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.2rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
            </div>

            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types (Jobs & Internships)</option>
              <option value="Job">Full Time Jobs</option>
              <option value="Internship">Internships</option>
              <option value="Training Program">Training Programs</option>
            </select>

            <select className="form-select" value={employmentFilter} onChange={(e) => setEmploymentFilter(e.target.value)}>
              <option value="">All Modes</option>
              <option value="Full-time">Full-time</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>
        </form>
      </div>

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <EmptyState title="No Opportunities Found" description="Try adjusting your filter options." />
      ) : (
        <div className="grid-2">
          {jobs.map(job => {
            const hasApplied = appliedJobIds.includes(job._id);
            const isPoster = user.role === 'admin' || (job.postedBy?._id === user._id || job.postedBy === user._id);

            return (
              <div key={job._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <span className="badge badge-primary">{job.type}</span>
                        <span className="badge badge-info">{job.employmentType}</span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginTop: '0.4rem' }}>{job.title}</h3>
                      <p style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.9rem' }}>{job.company}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        <MapPin size={14} style={{ display: 'inline', marginRight: 2 }} /> {job.location}
                      </p>
                    </div>

                    {isPoster && (
                      <button onClick={() => handleDeleteJob(job._id)} className="btn btn-outline btn-sm" title="Delete posting">
                        <Trash2 size={14} color="var(--danger)" />
                      </button>
                    )}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.85rem' }}>
                    {job.description}
                  </p>

                  <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div><strong>Stipend / Package:</strong> {job.salaryOrStipend}</div>
                    <div><strong>Eligibility:</strong> {job.eligibility}</div>
                    <div><Calendar size={12} style={{ display: 'inline', marginRight: 2 }} /> <strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</div>
                  </div>

                  {job.skillsRequired && job.skillsRequired.length > 0 && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {job.skillsRequired.map((sk, idx) => (
                        <span key={idx} className="badge badge-primary">{sk}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
                  {user.role === 'student' && (
                    hasApplied ? (
                      <span className="badge badge-success" style={{ padding: '0.5rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={14} /> Applied
                      </span>
                    ) : (
                      <button onClick={() => setSelectedJob(job)} className="btn btn-primary btn-sm">
                        Apply Now
                      </button>
                    )
                  )}

                  {isPoster && (
                    <button onClick={() => handleFetchApplicants(job._id)} className="btn btn-outline btn-sm">
                      <Users size={14} /> View Applicants
                    </button>
                  )}

                  {job.applicationLink && (
                    <a href={job.applicationLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                      External Link <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* POST JOB MODAL */}
      {showPostModal && (
        <Modal isOpen={showPostModal} onClose={() => setShowPostModal(false)} title="Post Opportunity">
          <form onSubmit={handlePostJob}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Job / Opportunity Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={postData.title}
                  onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                  placeholder="e.g. SDE 1 / React Intern"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={postData.company}
                  onChange={(e) => setPostData({ ...postData, company: e.target.value })}
                  placeholder="e.g. Google India"
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Opportunity Type</label>
                <select className="form-select" value={postData.type} onChange={(e) => setPostData({ ...postData, type: e.target.value })}>
                  <option value="Job">Full Time Job</option>
                  <option value="Internship">Internship</option>
                  <option value="Training Program">Training Program</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Work Mode</label>
                <select className="form-select" value={postData.employmentType} onChange={(e) => setPostData({ ...postData, employmentType: e.target.value })}>
                  <option value="Full-time">Full-time</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={postData.location}
                  onChange={(e) => setPostData({ ...postData, location: e.target.value })}
                  placeholder="e.g. Bengaluru / Remote"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Application Deadline</label>
                <input
                  type="date"
                  className="form-input"
                  value={postData.deadline}
                  onChange={(e) => setPostData({ ...postData, deadline: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={postData.description}
                onChange={(e) => setPostData({ ...postData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Salary / Stipend</label>
                <input
                  type="text"
                  className="form-input"
                  value={postData.salaryOrStipend}
                  onChange={(e) => setPostData({ ...postData, salaryOrStipend: e.target.value })}
                  placeholder="e.g. ₹ 50,000 / month"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Skills Required (Comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={postData.skillsRequired}
                  onChange={(e) => setPostData({ ...postData, skillsRequired: e.target.value })}
                  placeholder="e.g. React, Node.js, SQL"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowPostModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={postLoading}>
                {postLoading ? 'Publishing...' : 'Publish Posting'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* APPLY MODAL */}
      {selectedJob && (
        <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title={`Apply to ${selectedJob.title} at ${selectedJob.company}`}>
          <form onSubmit={handleApply}>
            <div className="form-group">
              <label className="form-label">Resume Link (Google Drive / GitHub / PDF link)</label>
              <input
                type="text"
                className="form-input"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/your-resume.pdf"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cover Note / Why are you a good fit?</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Briefly highlight your relevant skills and projects..."
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setSelectedJob(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={applyLoading}>
                {applyLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW APPLICANTS MODAL */}
      {viewJobApplicants && (
        <Modal isOpen={!!viewJobApplicants} onClose={() => setViewJobApplicants(null)} title="Job Applicants List">
          <div>
            {applicantsList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No student applications received yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {applicantsList.map(app => (
                  <div key={app._id} style={{ padding: '0.85rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{app.applicant?.name}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          PRN: {app.applicant?.studentProfile?.prn} • Dept: {app.applicant?.studentProfile?.department}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>"{app.coverNote}"</p>
                        {app.resumeUrl && (
                          <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem' }}>
                            View Resume Link →
                          </a>
                        )}
                      </div>

                      <select
                        className="form-select"
                        style={{ width: '140px' }}
                        value={app.status}
                        onChange={(e) => handleUpdateApplicantStatus(app._id, e.target.value)}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
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

export default JobsAndInternships;
