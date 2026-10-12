import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, GraduationCap, Briefcase, ShieldCheck, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password, role);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (targetRole) => {
    setRole(targetRole);
    if (targetRole === 'student') {
      setEmail('student@alumniconnect.com');
      setPassword('Student@123');
    } else if (targetRole === 'alumni') {
      setEmail('alumni@alumniconnect.com');
      setPassword('Alumni@123');
    } else if (targetRole === 'admin') {
      setEmail('admin@alumniconnect.com');
      setPassword('Admin@123');
    }
    setError('');
  };

  return (
    <div style={{
      maxWidth: '460px',
      margin: '3rem auto',
      padding: '0 1rem'
    }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>Account Login</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Welcome to Alumni Connect Platform</p>
        </div>

        {error && (
          <div className="toast toast-error">
            {error}
          </div>
        )}

        {/* Role Selector Tabs */}
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
              padding: '0.5rem',
              border: 'none',
              borderRadius: 'var(--radius)',
              background: role === 'student' ? 'white' : 'transparent',
              fontWeight: role === 'student' ? '600' : '500',
              color: role === 'student' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              boxShadow: role === 'student' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Student
          </button>

          <button
            type="button"
            onClick={() => setRole('alumni')}
            style={{
              padding: '0.5rem',
              border: 'none',
              borderRadius: 'var(--radius)',
              background: role === 'alumni' ? 'white' : 'transparent',
              fontWeight: role === 'alumni' ? '600' : '500',
              color: role === 'alumni' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              boxShadow: role === 'alumni' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Alumni
          </button>

          <button
            type="button"
            onClick={() => setRole('admin')}
            style={{
              padding: '0.5rem',
              border: 'none',
              borderRadius: 'var(--radius)',
              background: role === 'admin' ? 'white' : 'transparent',
              fontWeight: role === 'admin' ? '600' : '500',
              color: role === 'admin' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              boxShadow: role === 'admin' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@alumniconnect.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : `Log In as ${role.toUpperCase()}`}
          </button>
        </form>

        {/* 1-Click Demo Login Fill Buttons */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>
            Quick 1-Click Demo Fill
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => fillDemoCredentials('student')}
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <GraduationCap size={16} /> Fill Demo Student Credentials
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('alumni')}
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <Briefcase size={16} /> Fill Demo Alumni Credentials
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <ShieldCheck size={16} /> Fill Demo Admin Credentials
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
