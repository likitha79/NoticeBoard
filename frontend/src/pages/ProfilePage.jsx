import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Building2, Hash, Shield, Calendar, ArrowRight, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const isStudent = user.role === 'student';

  return (
    <div className="container" style={{ maxWidth: '720px', margin: '2.5rem auto 4rem auto' }}>
      <div className="form-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
            }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{user.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span className="badge" style={{ backgroundColor: isStudent ? '#eff6ff' : '#fef2f2', color: isStudent ? '#1e40af' : '#991b1b', textTransform: 'capitalize' }}>
                {isStudent ? 'Student Account' : 'College Administrator'}
              </span>
              {isStudent && (
                <span className="badge" style={{ backgroundColor: '#f5f3ff', color: '#6d28d9' }}>
                  {user.department} Department
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="meta-box" style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <span className="meta-box-label">Email Address</span>
            <span className="meta-box-value" style={{ wordBreak: 'break-all' }}>
              <Mail size={15} color="var(--primary)" />
              {user.email}
            </span>
          </div>

          {isStudent && (
            <div className="meta-box" style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <span className="meta-box-label">Roll Number / Student ID</span>
              <span className="meta-box-value">
                <Hash size={15} color="var(--primary)" />
                {user.studentId || 'N/A'}
              </span>
            </div>
          )}

          <div className="meta-box" style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <span className="meta-box-label">Assigned Department</span>
            <span className="meta-box-value">
              <Building2 size={15} color="var(--primary)" />
              {user.department || 'All Departments'}
            </span>
          </div>

          <div className="meta-box" style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <span className="meta-box-label">Account Role</span>
            <span className="meta-box-value" style={{ textTransform: 'capitalize' }}>
              <Shield size={15} color="var(--primary)" />
              {user.role}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '1rem' }}>
          {isStudent ? (
            <Link
              to="/notices?scope=My+Department"
              className="btn btn-primary"
              id="profile-view-dept-notices"
            >
              <Bell size={16} />
              <span>View {user.department} Department Notices</span>
            </Link>
          ) : (
            <Link to="/admin" className="btn btn-primary">
              <Shield size={16} />
              <span>Go to Admin Dashboard</span>
            </Link>
          )}

          <Link to="/notices" className="btn btn-secondary">
            <span>All Published Notices</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
