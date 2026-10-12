import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    prn: '',
    department: 'CSBS',
    batch: '2026',
    graduationYear: '2024',
    currentCompany: '',
    jobTitle: '',
    industry: 'Technology',
    location: '',
    phone: '',
    skills: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        role
      };
      const user = await register(payload);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message && err.message.includes('Network Error')) {
        setError('Cannot connect to backend server. Please ensure Node.js server is running on port 5000.');
      } else {
        setError(err.message || 'Registration failed. Please check inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Create an Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Join KIT Kolhapur Alumni Connect</p>
        </div>

        {error && <div className="toast toast-error">{error}</div>}

        {/* Role Tab Selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: 'var(--radius)'
        }}>
          <button
            type="button"
            onClick={() => setRole('student')}
            style={{
              padding: '0.6rem',
              border: 'none',
              borderRadius: 'var(--radius)',
              background: role === 'student' ? 'white' : 'transparent',
              fontWeight: role === 'student' ? '600' : '500',
              color: role === 'student' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Student Registration
          </button>
          <button
            type="button"
            onClick={() => setRole('alumni')}
            style={{
              padding: '0.6rem',
              border: 'none',
              borderRadius: 'var(--radius)',
              background: role === 'alumni' ? 'white' : 'transparent',
              fontWeight: role === 'alumni' ? '600' : '500',
              color: role === 'alumni' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Alumni Registration
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            style={{
              padding: '0.6rem',
              border: 'none',
              borderRadius: 'var(--radius)',
              background: role === 'admin' ? 'white' : 'transparent',
              fontWeight: role === 'admin' ? '600' : '500',
              color: role === 'admin' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Admin Registration
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{role === 'admin' ? 'Admin Name' : 'Full Name'}</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Siddharth Chavan"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{role === 'admin' ? 'Institutional Email' : 'Email Address'}</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. user@alumniconnect.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
            />
          </div>

          {/* Student Specific Fields */}
          {role === 'student' && (
            <>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">PRN (Permanent Reg. No.)</label>
                  <input
                    type="text"
                    name="prn"
                    className="form-input"
                    value={formData.prn}
                    onChange={handleChange}
                    placeholder="e.g. 2425001002"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select name="department" className="form-select" value={formData.department} onChange={handleChange}>
                    <option value="CSBS">CSBS (CS & Business Systems)</option>
                    <option value="CSE">CSE (Computer Science & Eng)</option>
                    <option value="IT">IT (Information Technology)</option>
                    <option value="ENTC">ENTC Engineering</option>
                    <option value="Mechanical">Mechanical Engineering</option>
                    <option value="Civil">Civil Engineering</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Batch / Graduation Year</label>
                  <input
                    type="text"
                    name="batch"
                    className="form-input"
                    value={formData.batch}
                    onChange={handleChange}
                    placeholder="e.g. 2026"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Skills (Comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  className="form-input"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. React, Node.js, Python, MongoDB"
                />
              </div>
            </>
          )}

          {/* Alumni Specific Fields */}
          {role === 'alumni' && (
            <>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Graduation Year</label>
                  <input
                    type="number"
                    name="graduationYear"
                    className="form-input"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    placeholder="e.g. 2022"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select name="department" className="form-select" value={formData.department} onChange={handleChange}>
                    <option value="CSBS">CSBS (CS & Business Systems)</option>
                    <option value="CSE">CSE (Computer Science & Eng)</option>
                    <option value="IT">IT (Information Technology)</option>
                    <option value="ENTC">ENTC Engineering</option>
                    <option value="Mechanical">Mechanical Engineering</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Current Company</label>
                  <input
                    type="text"
                    name="currentCompany"
                    className="form-input"
                    value={formData.currentCompany}
                    onChange={handleChange}
                    placeholder="e.g. Google India"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    className="form-input"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer"
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    className="form-input"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g. Technology / Cloud"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    className="form-input"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru, India"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Skills & Expertise (Comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  className="form-input"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. System Design, Placement Prep, Career Guidance"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : `Register as ${role.toUpperCase()}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
