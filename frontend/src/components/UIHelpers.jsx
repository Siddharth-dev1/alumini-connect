import React from 'react';

export const Badge = ({ type = 'primary', children }) => {
  return (
    <span className={`badge badge-${type}`}>
      {children}
    </span>
  );
};

export const LoadingSpinner = ({ message = 'Loading details...' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid var(--border)',
      borderTopColor: 'var(--primary)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{message}</p>
  </div>
);

export const EmptyState = ({ title = 'No records found', description = 'Try adjusting your search or filters.', action }) => (
  <div style={{
    textAlign: 'center',
    padding: '3rem 1.5rem',
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    border: '1px border var(--border)',
    color: 'var(--text-secondary)'
  }}>
    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{title}</h3>
    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{description}</p>
    {action && action}
  </div>
);
