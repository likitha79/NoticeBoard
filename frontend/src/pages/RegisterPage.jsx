import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Building2, Hash, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchCollegeConfig } from '../services/api';

const DEFAULT_DEPARTMENTS = [
  'CSE',
  'CSE (AI & ML)',
  'CSE (Data Science)',
  'IT',
  'ECE',
  'EEE',
  'Mechanical',
  'Civil',
];

const RegisterPage = () => {
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'CSE',
    studentId: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCollegeConfig()
      .then((res) => {
        if (res.success && res.data?.departments) {
          setDepartments(res.data.departments);
        }
      })
      .catch(() => console.log('Using default departments'));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/notices', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.studentId.trim()) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData);
      if (res.success) {
        navigate('/notices', { replace: true });
      } else {
        setErrorMessage(res.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to create account. Please check your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '480px' }}>
        <div className="login-header">
          <div className="login-icon-box">
            <UserPlus size={28} />
          </div>
          <h2>Create Student Account</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            PVPSIT Digital Notice Board Portal
          </p>
        </div>

        {errorMessage && (
          <div className="alert-box danger">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="register-name"
              name="name"
              className="form-control"
              placeholder="e.g. Rahul Varma"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              College / Personal Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="register-email"
              name="email"
              className="form-control"
              placeholder="e.g. rahul.cse@pvpsit.ac.in"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Department and Student Roll Number in 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-department">
                Department <span className="required">*</span>
              </label>
              <select
                id="register-department"
                name="department"
                className="form-control"
                value={formData.department}
                onChange={handleChange}
                required
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-studentId">
                Roll Number / ID <span className="required">*</span>
              </label>
              <input
                type="text"
                id="register-studentId"
                name="studentId"
                className="form-control"
                placeholder="21VR1A0542"
                value={formData.studentId}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Password (min 6 characters) <span className="required">*</span>
            </label>
            <input
              type="password"
              id="register-password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            id="register-submit-btn"
            style={{ padding: '0.85rem', marginTop: '0.5rem' }}
          >
            {loading ? (
              <>
                <span className="spinner spinner-light"></span>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }} id="go-to-login-link">
            Sign In here
          </Link>
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link
            to="/"
            style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ArrowLeft size={14} />
            <span>Return to Public Notice Board</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
