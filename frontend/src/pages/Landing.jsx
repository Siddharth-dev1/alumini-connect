import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Users, Briefcase, Award, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Welcome back, {user.name}!</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>
          You are logged in as <strong style={{ textTransform: 'capitalize' }}>{user.role}</strong>.
        </p>
        <button
          onClick={() => navigate(`/${user.role}/dashboard`)}
          className="btn btn-primary btn-lg"
        >
          Go to My Dashboard <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: 'white' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #2563eb 100%)',
        color: 'white',
        padding: '5rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '1.5rem',
            backdropFilter: 'blur(5px)'
          }}>
            <GraduationCap size={18} /> Official Institutional Portal - KIT Kolhapur
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '1.5rem' }}>
            Bridging Students & Alumni for Career Excellence
          </h1>

          <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Connect with top industry alumni, request 1-on-1 mentorship, explore exclusive job & internship postings, and participate in technical workshops.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem' }}>
              Join Platform Now <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-outline" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>Key Platform Capabilities</h2>
          <p style={{ color: 'var(--text-muted)' }}>Empowering institutional growth through structured networking</p>
        </div>

        <div className="grid-4">
          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
            <div style={{ width: '56px', height: '56px', background: '#dbeafe', color: '#2563eb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Users size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '0.5rem' }}>Alumni Directory</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Search and filter alumni by company, industry, department, and domain expertise.</p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
            <div style={{ width: '56px', height: '56px', background: '#f3e8ff', color: '#7c3aed', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Award size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '0.5rem' }}>1-on-1 Mentorship</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Schedule structured mentorship sessions for career advice, placement prep, and mock interviews.</p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
            <div style={{ width: '56px', height: '56px', background: '#d1fae5', color: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Briefcase size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '0.5rem' }}>Opportunity Portal</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Exclusive job openings, internships, and training programs posted directly by alumni.</p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
            <div style={{ width: '56px', height: '56px', background: '#e0f2fe', color: '#0284c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <ShieldCheck size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '0.5rem' }}>Verified Ecosystem</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>University admin verification ensuring authentic institutional users and secure communications.</p>
          </div>
        </div>
      </section>

      {/* Demo Credentials Quick Test Box */}
      <section style={{ background: '#f8fafc', padding: '3rem 2rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Instant Demo Access</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Test the application immediately using pre-configured seed accounts for all three roles:
          </p>

          <div className="grid-3">
            <div className="card" style={{ background: 'white' }}>
              <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>Student Account</span>
              <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>student@alumniconnect.com</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Password: Student@123</p>
            </div>
            <div className="card" style={{ background: 'white' }}>
              <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Alumni Account</span>
              <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>alumni@alumniconnect.com</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Password: Alumni@123</p>
            </div>
            <div className="card" style={{ background: 'white' }}>
              <span className="badge badge-danger" style={{ marginBottom: '0.5rem' }}>Admin Account</span>
              <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>admin@alumniconnect.com</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Password: Admin@123</p>
            </div>
          </div>

          <div style={{ marginTop: '1.75rem' }}>
            <Link to="/login" className="btn btn-primary btn-lg">
              Launch Login Page
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
