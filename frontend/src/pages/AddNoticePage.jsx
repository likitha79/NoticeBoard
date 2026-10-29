import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FilePlus,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Send,
  Building2,
  Globe,
  Calendar,
  Clock,
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { createNotice, fetchCollegeConfig } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEFAULT_CATEGORIES = [
  'General',
  'Academics',
  'Examinations',
  'Circulars',
  'Placements',
  'Events',
  'Workshops & FDPs',
  'Scholarships',
  'Fees',
  'Student Activities',
  'Urgent',
];

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

const AddNoticePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scope: 'College-wide',
    department: 'CSE',
    category: 'Examinations',
    author: user?.name || 'Office of the Principal, PVPSIT',
    isImportant: false,
    expiresAt: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Today's date in YYYY-MM-DD for min attribute
  const todayDate = new Date().toISOString().split('T')[0];

  // Load config from backend
  useEffect(() => {
    fetchCollegeConfig()
      .then((res) => {
        if (res.success && res.data) {
          if (res.data.categories) setCategories(res.data.categories);
          if (res.data.departments) setDepartments(res.data.departments);
        }
      })
      .catch(() => console.log('Using default config'));
  }, []);

  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Notice title is required';
    } else if (formData.title.length > 180) {
      errs.title = 'Title cannot exceed 180 characters';
    } else if (formData.title.length < 3) {
      errs.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      errs.description = 'Notice description is required';
    } else if (formData.description.length < 5) {
      errs.description = 'Description must be at least 5 characters';
    }

    if (!formData.category) {
      errs.category = 'Category is required';
    }

    if (formData.scope === 'Department' && !formData.department) {
      errs.department = 'Please select a specific department';
    }

    if (!formData.author.trim()) {
      errs.author = 'Author / Issuing authority is required';
    }

    if (formData.expiresAt) {
      const selectedExp = new Date(formData.expiresAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedExp < today) {
        errs.expiresAt = 'Expiry date cannot be earlier than today';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleClearExpiry = () => {
    setFormData((prev) => ({ ...prev, expiresAt: '' }));
    if (errors.expiresAt) {
      setErrors((prev) => ({ ...prev, expiresAt: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        scope: formData.scope,
        department: formData.scope === 'Department' ? formData.department : 'All',
        category: formData.category,
        author: formData.author.trim(),
        isImportant: formData.isImportant,
        expiresAt: formData.expiresAt ? formData.expiresAt : null,
      };

      const res = await createNotice(payload);
      if (res.success) {
        navigate('/admin', {
          state: { flashMessage: `Notice "${formData.title}" published successfully!` },
        });
      }
    } catch (err) {
      console.error('Failed to publish notice:', err);
      setServerError(
        err.response?.data?.message || 'Failed to create notice. Please verify all inputs.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        {/* Header */}
        <div className="admin-page-header">
          <div className="admin-title-group">
            <Link
              to="/admin"
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                marginBottom: '0.5rem',
              }}
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1>Publish New Notice</h1>
            <p>Post an official college-wide or department circular with optional expiry date</p>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="alert-box danger" style={{ maxWidth: '780px', margin: '0 auto 1.5rem auto' }}>
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="notice-title">
                Notice Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="notice-title"
                name="title"
                className="form-control"
                placeholder="e.g. B.Tech Semester Examination Notification & Fee Schedule"
                value={formData.title}
                onChange={handleChange}
                maxLength={180}
              />
              <div className="form-help-text">
                <span style={{ color: errors.title ? 'var(--urgent-red)' : 'var(--text-muted)' }}>
                  {errors.title || 'Give a clear and descriptive title'}
                </span>
                <span>{formData.title.length} / 180</span>
              </div>
            </div>

            {/* Scope (Type) & Department in 2 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="notice-scope">
                  Notice Type / Scope <span className="required">*</span>
                </label>
                <select
                  id="notice-scope"
                  name="scope"
                  className="form-control"
                  value={formData.scope}
                  onChange={handleChange}
                >
                  <option value="College-wide">College-wide (All Students)</option>
                  <option value="Department">Department Specific</option>
                </select>
              </div>

              {/* Department */}
              <div className="form-group">
                <label className="form-label" htmlFor="notice-department">
                  Department {formData.scope === 'Department' && <span className="required">*</span>}
                </label>
                <select
                  id="notice-department"
                  name="department"
                  className="form-control"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={formData.scope === 'College-wide'}
                  style={{ opacity: formData.scope === 'College-wide' ? 0.6 : 1 }}
                >
                  {formData.scope === 'College-wide' ? (
                    <option value="All">All Departments (College-wide)</option>
                  ) : (
                    departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))
                  )}
                </select>
                {errors.department && (
                  <div className="form-help-text" style={{ color: 'var(--urgent-red)' }}>
                    {errors.department}
                  </div>
                )}
              </div>
            </div>

            {/* Category and Author in 2 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="notice-category">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="notice-category"
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="notice-author">
                  Author / Issuing Authority <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="notice-author"
                  name="author"
                  className="form-control"
                  placeholder="e.g. Controller of Examinations, PVPSIT"
                  value={formData.author}
                  onChange={handleChange}
                  maxLength={100}
                />
                {errors.author && (
                  <div className="form-help-text" style={{ color: 'var(--urgent-red)' }}>
                    {errors.author}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="notice-description">
                Notice Content / Description <span className="required">*</span>
              </label>
              <textarea
                id="notice-description"
                name="description"
                className="form-control"
                placeholder="Enter full notice instructions, details, rules, and schedules..."
                value={formData.description}
                onChange={handleChange}
                rows={7}
              ></textarea>
              {errors.description && (
                <div className="form-help-text" style={{ color: 'var(--urgent-red)' }}>
                  {errors.description}
                </div>
              )}
            </div>

            {/* Notice Expiry Date */}
            <div className="form-group" style={{ backgroundColor: 'var(--bg-subtle)', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="notice-expires-at" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={16} color="var(--primary)" />
                  <span>Notice Expiry Date (Optional)</span>
                </label>
                {formData.expiresAt && (
                  <button
                    type="button"
                    onClick={handleClearExpiry}
                    style={{ fontSize: '0.8rem', color: 'var(--urgent-red)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Clear Expiry Date
                  </button>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                Select the date after which this notice should automatically expire and be hidden from student dashboards. Leave blank for indefinite active notice.
              </p>
              <input
                type="date"
                id="notice-expires-at"
                name="expiresAt"
                className="form-control"
                value={formData.expiresAt}
                onChange={handleChange}
                min={todayDate}
                style={{ maxWidth: '280px' }}
              />
              {errors.expiresAt && (
                <div className="form-help-text" style={{ color: 'var(--urgent-red)' }}>
                  {errors.expiresAt}
                </div>
              )}
            </div>

            {/* Important Flag */}
            <div className="form-group" style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  name="isImportant"
                  checked={formData.isImportant}
                  onChange={handleChange}
                  id="notice-is-important"
                />
                <div>
                  <div>Mark as High Priority / Urgent Notice</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                    Urgent notices appear with an 'IMPORTANT' badge and are highlighted in the student announcements ticker.
                  </div>
                </div>
              </label>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <Link to="/admin" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                id="submit-notice-btn"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner spinner-light"></span>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Publish Notice</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddNoticePage;
