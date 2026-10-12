import React, { useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Briefcase, GraduationCap, Save, ShieldCheck } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUserState } = useAuth();

  const isAlumni = user?.role === 'alumni';
  const sp = user?.studentProfile || {};
  const ap = user?.alumniProfile || {};

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [phone, setPhone] = useState((isAlumni ? ap.phone : sp.phone) || '');
  const [bio, setBio] = useState((isAlumni ? ap.bio : sp.bio) || '');
  const [department, setDepartment] = useState((isAlumni ? ap.department : sp.department) || 'CSBS');
  const [skills, setSkills] = useState((isAlumni ? ap.skills : sp.skills)?.join(', ') || '');

  // Student specific
  const [prn, setPrn] = useState(sp.prn || '');
  const [batch, setBatch] = useState(sp.batch || '2026');
  const [careerGoals, setCareerGoals] = useState(sp.careerGoals || '');
  const [interests, setInterests] = useState(sp.interests?.join(', ') || '');

  // Alumni specific
  const [graduationYear, setGraduationYear] = useState(ap.graduationYear || 2024);
  const [currentCompany, setCurrentCompany] = useState(ap.currentCompany || '');
  const [jobTitle, setJobTitle] = useState(ap.jobTitle || '');
  const [industry, setIndustry] = useState(ap.industry || '');
  const [location, setLocation] = useState(ap.location || '');
  const [expertise, setExpertise] = useState(ap.expertise?.join(', ') || '');

  // Social links
  const [linkedin, setLinkedin] = useState((isAlumni ? ap.socialLinks?.linkedin : sp.socialLinks?.linkedin) || '');
  const [github, setGithub] = useState((isAlumni ? ap.socialLinks?.github : sp.socialLinks?.github) || '');
  const [portfolio, setPortfolio] = useState((isAlumni ? ap.socialLinks?.portfolio : sp.socialLinks?.portfolio) || '');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isAlumni) {
        const payload = {
          name,
          avatar,
          phone,
          bio,
          department,
          graduationYear: Number(graduationYear),
          currentCompany,
          jobTitle,
          industry,
          location,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          expertise: expertise.split(',').map(e => e.trim()).filter(Boolean),
          socialLinks: { linkedin, github, portfolio }
        };
        const res = await API.put('/profiles/alumni', payload);
        updateUserState(res.data);
      } else {
        const payload = {
          name,
          avatar,
          phone,
          bio,
          department,
          prn,
          batch,
          careerGoals,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          interests: interests.split(',').map(i => i.trim()).filter(Boolean),
          socialLinks: { linkedin, github, portfolio }
        };
        const res = await API.put('/profiles/student', payload);
        updateUserState(res.data);
      }

      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card-header" style={{ marginBottom: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Manage Professional Profile</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Keep your institutional credentials and portfolio up to date</p>
        </div>
      </div>

      {message && (
        <div className={`toast ${message.includes('successfully') ? 'toast-success' : 'toast-error'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSaveProfile}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ background: '#f1f5f9' }}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="CSBS">Computer Science & Business Systems (CSBS)</option>
                <option value="CSE">Computer Science & Engineering (CSE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="ENTC">ENTC Engineering</option>
                <option value="Mechanical">Mechanical Engineering</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          {/* Student Specific Fields */}
          {!isAlumni && (
            <>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">PRN</label>
                  <input
                    type="text"
                    className="form-input"
                    value={prn}
                    onChange={(e) => setPrn(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Batch Year</label>
                  <input
                    type="text"
                    className="form-input"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Career Goals</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                  placeholder="e.g. Aiming for SDE roles in top tech companies"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Interests (Comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g. Web Dev, System Design, AI"
                />
              </div>
            </>
          )}

          {/* Alumni Specific Fields */}
          {isAlumni && (
            <>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Graduation Year</label>
                  <input
                    type="number"
                    className="form-input"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Company</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder="e.g. Google India"
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <input
                    type="text"
                    className="form-input"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Technology"
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, India"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mentorship Expertise Areas (Comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="e.g. Career Guidance, Placement Prep"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Skills (Comma separated)</label>
            <input
              type="text"
              className="form-input"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Node.js, Python, MongoDB"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bio / Profile Summary</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share a brief summary of your background and achievements..."
            />
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input
                type="text"
                className="form-input"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input
                type="text"
                className="form-input"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Portfolio URL</label>
              <input
                type="text"
                className="form-input"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} /> {loading ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
